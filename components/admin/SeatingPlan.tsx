"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { useRsvpData } from "./useRsvpData";
import { useSeatingData, type TableConfig, type RoomObject } from "./useSeatingData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

// --- Types ---

type Guest = {
  id: string;
  name: string;
  tableId: string | null; // null means "Sin asignar"
  // Extended info for "X-Ray" modal
  email: string;
  phone: string;
  guestsCount: number;
  guestNames?: string;
  requests?: string; // diet, songs, etc.
  notes?: string;
  tags: string[];
};

// --- Icons Helpers ---
function getDietaryIcons(text?: string) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const icons = [];
  if (lower.match(/vega|vege/)) icons.push("🌱");
  if (lower.match(/celi|glute/)) icons.push("🌾");
  if (lower.match(/alerg|intol/)) icons.push("⚠️");
  if (lower.match(/embara/)) icons.push("🤰");
  if (lower.match(/niñ|bebe|infan/)) icons.push("👶");
  return icons.length > 0 ? icons : null;
}

export function SeatingPlan() {
  const { records, isLoading: isLoadingRsvp } = useRsvpData();
  const { tables, objects, isLoading: isLoadingSeating, updateTableName, updateTablePosition, updateObjectPosition } = useSeatingData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [layoutMode, setLayoutMode] = useState(false); // false = Guests, true = Tables
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  // Viewport State (Zoom & Pan)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // ... (sensors) ...

  const handleAddManualGuest = async (name: string) => {
      try {
          const db = getFirestoreDb();
          await addDoc(collection(db, "rsvps"), {
              fullName: name,
              attendance: "si",
              guests: 1, // Default to 1
              email: "manual@entry.local", // Placeholder
              phone: "-",
              status: "confirmado",
              tags: ["manual"],
              submittedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
          });
          toast.success("Invitado añadido");
      } catch (e) {
          console.error(e);
          toast.error("Error al crear invitado");
      }
  };

  const handleExportExcel = () => {
    // 1. Flatten Data
    const params: Record<string, any>[] = [];
    
    // Sort tables by ID or Name logic if needed, currently native order
    tables.forEach(table => {
       const tableGuests = guests.filter(g => g.tableId === table.id);
       tableGuests.forEach(guest => {
          params.push({
             "Mesa": table.name,
             "Nombre": guest.name,
             "Acompañantes": guest.guestsCount,
             "Dieta / Peticiones": guest.requests || "-",
             "Notas Internas": guest.notes || "-",
             "Teléfono": guest.phone || "-"
          });
       });
    });

    // Unassigned
    const unassigned = guests.filter(g => !g.tableId);
    unassigned.forEach(guest => {
        params.push({
             "Mesa": "SIN ASIGNAR",
             "Nombre": guest.name,
             "Acompañantes": guest.guestsCount,
             "Dieta / Peticiones": guest.requests || "-",
             "Notas Internas": guest.notes || "-",
             "Teléfono": guest.phone || "-"
          });
    });

    // 2. Create Sheet
    const ws = XLSX.utils.json_to_sheet(params);
    
    // Auto-width columns (simple heuristic)
    const wscols = [
        {wch: 15}, // Mesa
        {wch: 30}, // Nombre
        {wch: 10}, // Pax
        {wch: 40}, // Dieta
        {wch: 40}, // Notas
        {wch: 15}  // Telefono
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Distribución");

    // 3. Download
    XLSX.writeFile(wb, "distribucion_boda.xlsx");
    toast.success("Excel descargado correctamente");
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Derived guests list
  const guests: Guest[] = useMemo(() => {
    return records
      .filter((r) => r.attendance === "si")
      .map((r) => ({
        id: r.id,
        name: r.fullName,
        tableId: r.tableId ?? null,
        email: r.email,
        phone: r.phone,
        guestsCount: r.guests,
        guestNames: r.guestNames,
        requests: r.requests,
        notes: r.notes,
        tags: r.tags,
      }));
  }, [records]);

  const unassignedGuests = guests.filter((g) => g.tableId === null);
  
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    setActiveId(null);

    // MODE: Layout (Moving Tables or Objects)
    if (layoutMode) {
      const activeStr = active.id as string;
      
      // Move TABLES
      if (activeStr.startsWith("table-")) {
          const tableId = activeStr;
          const table = tables.find(t => t.id === tableId);
          // Apply zoom correction to delta if necessary, but usually dnd-kit handles it.
          // Because we transform the container, delta might be affected.
          // Let's divide delta by zoom to keep movement 1:1 with mouse.
          if (table) updateTablePosition(tableId, table.x + delta.x / zoom, table.y + delta.y / zoom);
          return;
      }
      
      // Move OBJECTS
      if (activeStr.startsWith("obj-") || activeStr.startsWith("zone-")) {
          const objId = activeStr;
          const obj = objects.find(o => o.id === objId);
          if (obj) updateObjectPosition(objId, obj.x + delta.x / zoom, obj.y + delta.y / zoom);
          return;
      }
      return;
    }

    // MODE: Guests (Assigning)
    if (!over) return;

    const guestId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a table container or unassigned area
    if (overId.startsWith("table-") || overId === "unassigned") {
      const newTableId = overId === "unassigned" ? null : overId;
      
      const db = getFirestoreDb();
      updateDoc(doc(db, "rsvps", guestId), {
          tableId: newTableId
      }).then(() => toast.success("Mesa actualizada"))
        .catch(() => toast.error("Error al asignar mesa"));
    }
  }

  const handleUnassign = async (guestId: string) => {
    try {
      const db = getFirestoreDb();
      await updateDoc(doc(db, "rsvps", guestId), { tableId: null });
      toast.success("Invitado desasignado");
      setSelectedGuest(null);
    } catch (error) {
      toast.error("Error al desasignar");
    }
  };

  const handleTableRename = (id: string, newName: string) => {
    updateTableName(id, newName);
  };
  
  // Handle Mouse Wheel for Zoom
  const handleWheel = (e: React.WheelEvent) => {
      // If Ctrl is pressed, zoom
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          const scale = e.deltaY > 0 ? 0.9 : 1.1;
          setZoom(z => Math.min(Math.max(z * scale, 0.4), 2));
      }
   };

  if (isLoadingRsvp || isLoadingSeating) return <div className="flex justify-center p-20"><span className="animate-spin text-2xl">⏳</span></div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-100px)] flex-col gap-6 lg:flex-row relative">
        
        {/* SIDEBAR */}
        <aside className="flex flex-col gap-4 rounded-xl border border-border bg-surface shadow-sm lg:w-[320px] lg:shrink-0 z-20">
          <div className="border-b border-border p-4 bg-muted/30 rounded-t-xl flex items-center justify-between">
            <h2 className="font-bold uppercase tracking-widest text-muted-foreground text-xs">
              Sin Asignar ({unassignedGuests.length})
            </h2>
            <button 
                onClick={() => setIsAddingGuest(true)}
                className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition shadow-sm"
                title="Añadir invitado manualmente"
            >
                +
            </button>
          </div>
          
          {isAddingGuest && (
             <div className="p-3 bg-muted/20 border-b border-border animate-in slide-in-from-top-2">
                 <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        const name = data.get("name") as string;
                        if(name) {
                            handleAddManualGuest(name);
                            setIsAddingGuest(false);
                        }
                    }}
                    className="flex gap-2"
                 >
                    <input 
                        name="name"
                        autoFocus
                        placeholder="Nombre..."
                        className="flex-1 text-xs rounded border border-input bg-background px-2 py-1"
                    />
                    <button type="submit" className="text-[10px] bg-primary text-white px-2 rounded font-bold uppercase">OK</button>
                    <button type="button" onClick={() => setIsAddingGuest(false)} className="text-[10px] bg-muted text-muted-foreground px-2 rounded font-bold uppercase">X</button>
                 </form>
             </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {layoutMode ? (
              <div className="text-center text-xs text-muted-foreground py-10 opacity-50">
                Modo Edición Activado.<br/>Mueve mesas y decoración.
              </div>
            ) : (
              <DroppableContainer 
                id="unassigned" 
                items={unassignedGuests} 
                type="list" 
                onGuestClick={setSelectedGuest}
              />
            )}
          </div>
          
          {/* CONTROL PANEL */}
          <div className="p-4 border-t border-border bg-background/50 rounded-b-xl">
             <button
               onClick={() => setLayoutMode(!layoutMode)}
               className={cn(
                 "w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-sm border",
                 layoutMode 
                   ? "bg-primary text-primary-foreground border-primary"
                   : "bg-white hover:bg-muted text-foreground border-border"
               )}
             >
               {layoutMode ? "✅ Terminar Edición" : "📐 Mover / Editar"}
             </button>
             <p className="text-[10px] text-center text-muted-foreground mt-2">
               {layoutMode ? "Arrastra para reorganizar el plano." : "Arrastra a los invitados."}
             </p>
          </div>
        </aside>

        {/* MAIN HALL: Infinite Canvas */}
        <main 
            className="flex-1 rounded-xl border border-border/50 bg-stone-100 shadow-inner overflow-hidden relative group cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
               // Enable panning if clicking roughly on background. Middle click always pans.
               if(e.button === 1 || (e.button === 0 && !activeId)) {
                   setIsPanning(true);
                   e.preventDefault(); // Prevent text selection
               }
            }}
            onMouseMove={(e) => {
               if(isPanning) {
                   setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
               }
            }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
            onWheel={handleWheel}
        >
           {/* Visual Floor Texture (Wood/Stone pattern) */}
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                style={{ 
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')", // Subtle noise/wood
                    backgroundSize: "auto"
                }} 
           />

           {/* CONTROLS */}
           <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur border shadow-sm rounded-lg p-1">
              <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-2 hover:bg-muted rounded text-lg font-bold" title="Zoom In">+</button>
              <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))} className="p-2 hover:bg-muted rounded text-lg font-bold" title="Zoom Out">-</button>
              <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="p-2 hover:bg-muted rounded text-xs uppercase font-bold" title="Reset View">Rst</button>
              <div className="h-px bg-border my-1" />
              <button onClick={handleExportExcel} className="p-2 hover:bg-green-50 text-green-600 rounded text-lg font-bold shadow-sm transition hover:scale-105 active:scale-95" title="Descargar Excel">
                📊
              </button>
           </div>

           {/* TRANSFORM CONTAINER */}
           <div 
              style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                  transition: isPanning ? "none" : "transform 0.1s ease-out"
              }}
              className="w-[2500px] h-[2500px] relative transition-transform"
           >
             {/* Render ZONES */}
             {objects.filter(o => o.type === "zone").map(zone => (
                   <div 
                      key={zone.id}
                      className={cn("absolute rounded-xl transition-all border-4 border-stone-300 shadow-sm", zone.color)}
                      style={{ 
                          left: zone.x, top: zone.y, width: zone.width, height: zone.height,
                          zIndex: 0,
                          // Wood flooring effect inside the zone
                          backgroundImage: "linear-gradient(45deg, #f5f5f4 25%, transparent 25%, transparent 75%, #f5f5f4 75%, #f5f5f4), linear-gradient(45deg, #f5f5f4 25%, transparent 25%, transparent 75%, #f5f5f4 75%, #f5f5f4)",
                          backgroundSize: "40px 40px",
                          backgroundPosition: "0 0, 20px 20px"
                      }}
                   >
                       <div className="absolute -top-10 left-0 text-xl font-serif italic text-stone-500 font-bold tracking-widest uppercase">
                           {zone.label}
                       </div>
                   </div>
               ))}

               {/* Render OBJECTS */}
               {objects.filter(o => o.type === "element").map(obj => (
                   <DraggableObject key={obj.id} obj={obj} isLayoutMode={layoutMode} />
               ))}

               {/* Render TABLES */}
               {tables.map(table => (
                  <TableComponent 
                    key={table.id} 
                    table={table} 
                    guests={guests.filter(g => g.tableId === table.id)}
                    onGuestClick={setSelectedGuest}
                    onRename={(name) => handleTableRename(table.id, name)}
                    isLayoutMode={layoutMode}
                  />
               ))}
           </div>
        </main>

        {/* Guest Details Modal (X-Ray) */}
        {selectedGuest && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-serif italic text-primary">{selectedGuest.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedGuest.tableId ? 
                      tables.find(t => t.id === selectedGuest.tableId)?.name : 
                      "Sin asignar"}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedGuest(null)}
                  className="rounded-full p-1 hover:bg-muted transition text-muted-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-muted/30 p-3 rounded-xl">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Acompañantes</div>
                      <div className="font-medium">{selectedGuest.guestsCount} pax</div>
                      {selectedGuest.guestNames && <div className="text-xs text-muted-foreground mt-1">{selectedGuest.guestNames}</div>}
                   </div>
                   <div className="bg-muted/30 p-3 rounded-xl">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Contacto</div>
                      <div className="text-xs truncate">{selectedGuest.phone}</div>
                      <div className="text-xs truncate opacity-70">{selectedGuest.email}</div>
                   </div>
                </div>

                {(selectedGuest.requests || selectedGuest.notes) && (
                   <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <div className="text-[10px] uppercase tracking-widest text-primary/70 mb-2">Notas & Dieta</div>
                      {selectedGuest.requests && (
                        <div className="mb-2">
                          <span className="font-semibold text-primary text-xs">Peticiones:</span>
                          <p className="text-foreground/80">{selectedGuest.requests}</p>
                          <div className="flex gap-1 mt-1">
                             {getDietaryIcons(selectedGuest.requests)?.map((icon, i) => (
                               <span key={i} title="Dieta detectada" className="cursor-help text-base bg-white rounded-full px-1 shadow-sm">{icon}</span>
                             ))}
                          </div>
                        </div>
                      )}
                      {selectedGuest.notes && (
                        <div>
                          <span className="font-semibold text-primary text-xs">Interno:</span>
                          <p className="text-foreground/80 italic">{selectedGuest.notes}</p>
                        </div>
                      )}
                   </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                   onClick={() => handleUnassign(selectedGuest.id)}
                   className="flex-1 rounded-full border border-red-200 bg-red-50 py-2.5 text-xs font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                >
                  Desasignar
                </button>
                <button 
                   onClick={() => setSelectedGuest(null)}
                   className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:opacity-90 shadow-lg shadow-primary/20"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <DragOverlay>
        {activeId && !layoutMode ? (
           <GuestChip guest={guests.find(g => g.id === activeId)!} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// --- Subcomponents ---

function DraggableObject({ obj, isLayoutMode }: { obj: RoomObject, isLayoutMode: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
        id: obj.id,
        disabled: !isLayoutMode,
    });

    const style = {
        position: "absolute" as const,
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging ? 50 : 5,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center justify-center rounded-lg border shadow-sm transition-all select-none backdrop-blur-sm",
                isLayoutMode ? "cursor-move hover:ring-2 hover:ring-primary/50 hover:shadow-md" : "",
                obj.category === "dj" ? "bg-purple-100/90 border-purple-300 shadow-purple-100" : 
                obj.category === "entrance" ? "bg-stone-800 text-white border-stone-900" : 
                "bg-gray-100 border-gray-300"
            )}
        >
            <div className="text-center leading-tight">
                <div className="text-lg">
                    {obj.category === "dj" ? "🎧" : 
                     obj.category === "entrance" ? "🚪" : "📦"}
                </div>
                {obj.height > 40 && (
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1 block px-1">
                        {obj.label}
                    </span>
                )}
            </div>
        </div>
    );
}

function DroppableContainer({ 
  id, 
  items, 
  type = "list",
  onGuestClick 
}: { 
  id: string; 
  items: Guest[]; 
  type?: "list" | "table";
  onGuestClick: (g: Guest) => void;
}) {
  const { setNodeRef } = useSortable({
    id,
    data: { type: "container" },
    disabled: true,
  });

  return (
    <div ref={setNodeRef} className={cn("min-h-[60px]", type === "list" ? "flex flex-col gap-2" : "flex flex-wrap justify-center gap-1.5")}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((guest) => (
          <SortableGuest key={guest.id} guest={guest} onClick={() => onGuestClick(guest)} />
        ))}
      </SortableContext>
      {items.length === 0 && type === "list" && (
         <div className="flex items-center justify-center rounded-lg border border-dashed border-border/40 py-8 text-xs text-muted-foreground/50">
           Arrastra aquí para desasignar
         </div>
      )}
    </div>
  );
}

function TableComponent({ 
  table, 
  guests, 
  onGuestClick,
  onRename,
  isLayoutMode
}: { 
  table: TableConfig; 
  guests: Guest[]; 
  onGuestClick: (g: Guest) => void; 
  onRename: (name: string) => void;
  isLayoutMode: boolean;
}) {
  const isRound = table.type === "round"; // "round" or "presidential" from config
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(table.name);

  // UseDraggable for the TABLE itself when in layoutMode
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: table.id,
    disabled: !isLayoutMode,
  });

  const style = {
     position: "absolute" as const,
     left: table.x,
     top: table.y,
     // Apply transform only if dragging THIS table
     transform: transform ? CSS.Translate.toString(transform) : undefined,
     zIndex: isDragging ? 50 : 10,
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) onRename(tempName);
    setIsEditing(false);
  };

  return (
    <div 
        ref={setNodeRef}
        style={style}
        {...attributes} 
        {...listeners}
        className={cn(
          "flex flex-col items-center gap-3 transition-shadow",
          isLayoutMode ? "cursor-move hover:ring-2 hover:ring-primary hover:z-50" : ""
        )}
    >
      <div 
        className={cn(
          "relative flex items-center justify-center border transition-colors bg-surface",
          table.type === "round"
            ? "h-48 w-48 rounded-full shadow-md" 
            : "h-32 w-80 rounded-xl shadow-lg border-primary/20", // Presidential default style
          guests.length > table.capacity ? "border-red-400 bg-red-50" : "border-border"
        )}
        style={
             table.type === "presidential" 
             ? { 
                 boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                 background: "linear-gradient(135deg, #fff 0%, #fcfcfc 100%)"
               } 
             : undefined
        }
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
          {/* Editable Title */}
          <div className="mb-2 relative group" onPointerDown={e => e.stopPropagation() /* Prevent drag start on input */}>
             {isEditing ? (
               <input 
                 autoFocus
                 value={tempName}
                 onChange={(e) => setTempName(e.target.value)}
                 onBlur={handleNameSubmit}
                 onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                 className="w-24 text-center text-xs font-bold uppercase bg-background border rounded px-1"
               />
             ) : (
               <span 
                 onClick={() => !isLayoutMode && setIsEditing(true)}
                 className={cn(
                    "text-xs font-bold uppercase tracking-widest text-muted-foreground/70",
                    !isLayoutMode && "cursor-pointer hover:text-foreground hover:underline decoration-dotted underline-offset-4"
                 )}
               >
                 {table.name}
               </span>
             )}
          </div>

          {/* Drop Zone inside table */}
          {/* If layout mode, disable dropping guests here? Actually dropping is handled by parents. 
              But we might want to hide internal list or disable interactions. 
          */}
          <div className="w-full max-h-full overflow-y-auto no-scrollbar" onPointerDown={e => !isLayoutMode && e.stopPropagation()}>
             {!isLayoutMode && (
                <DroppableContainer id={table.id} items={guests} type="table" onGuestClick={onGuestClick} />
             )}
             {isLayoutMode && (
                <div className="text-[10px] text-muted-foreground/50 text-center px-4">
                   {guests.length} invitados<br/>(Bloqueado)
                </div>
             )}
          </div>
        </div>
        
        {/* Capacity Indicator */}
        <div className={cn(
          "absolute -bottom-3 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-sm",
          guests.length > table.capacity 
            ? "border-red-200 bg-red-100 text-red-700" 
            : "border-border bg-background text-muted-foreground"
        )}>
          {guests.length}/{table.capacity}
        </div>
      </div>
    </div>
  );
}

function SortableGuest({ guest, onClick }: { guest: Guest; onClick?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: guest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none" onClick={onClick}>
      <GuestChip guest={guest} />
    </div>
  );
}

function GuestChip({ guest, isOverlay }: { guest: Guest, isOverlay?: boolean }) {
  const dietIcons = getDietaryIcons(guest.requests);

  return (
    <div
      className={cn(
        "cursor-grab truncate rounded-full border px-2.5 py-1 text-[10px] font-medium transition active:cursor-grabbing flex items-center justify-center gap-1",
        isOverlay 
          ? "w-auto max-w-[200px] scale-105 border-primary bg-background shadow-xl text-primary z-50 ring-2 ring-primary/20" 
          : "border-border/60 bg-background hover:border-primary/50 hover:text-primary shadow-sm text-foreground/80",
          !isOverlay && "w-full text-center"
      )}
      title={`${guest.name}${guest.requests ? ` - ${guest.requests}` : ""}`}
    >
      <span className="truncate">{guest.name}</span>
      {dietIcons && (
         <span className="flex -space-x-1 shrink-0">
            {dietIcons.slice(0, 2).map((icon, i) => (
              <span key={i} className="text-[9px] leading-none">{icon}</span>
            ))}
         </span>
      )}
    </div>
  );
}
