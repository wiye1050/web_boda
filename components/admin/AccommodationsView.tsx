"use client";
import Image from "next/image";

import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Check, BedDouble, Hotel, Building, Building2 } from "lucide-react";
import { type Accommodation, type AccommodationType, useAccommodations } from "./useAccommodations";
import { motion, AnimatePresence } from "framer-motion";

const ACCOMMODATION_TYPES: AccommodationType[] = ["Hotel", "Casa Rural", "Apartamento", "Otro"];

export function AccommodationsView() {
  const { accommodations, isLoading, error, addAccommodation, updateAccommodation, removeAccommodation } = useAccommodations();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAcc, setCurrentAcc] = useState<Partial<Accommodation> | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        {error}
      </div>
    );
  }

  const handleEdit = (acc: Accommodation) => {
    setCurrentAcc(acc);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentAcc({
      type: "Hotel",
      hasBlock: false,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentAcc(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAcc || !currentAcc.name || !currentAcc.type) return;

    try {
      if (currentAcc.id) {
        await updateAccommodation(currentAcc.id, currentAcc);
      } else {
        await addAccommodation(currentAcc as Omit<Accommodation, "id" | "createdAt" | "updatedAt">);
      }
      setIsEditing(false);
      setCurrentAcc(null);
    } catch (err) {
      console.error("Error saving accommodation:", err);
      alert("Hubo un error al guardar. Revisa la consola.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el alojamiento "${name}"? Esta acción no se puede deshacer.`)) {
      try {
        await removeAccommodation(id);
      } catch (err) {
        console.error("Error deleting accommodation:", err);
        alert("Hubo un error al eliminar. Revisa la consola.");
      }
    }
  };

  const getTypeIcon = (type: AccommodationType) => {
    switch (type) {
      case "Hotel": return <Hotel className="h-4 w-4" />;
      case "Casa Rural": return <Building className="h-4 w-4" />;
      case "Apartamento": return <Building2 className="h-4 w-4" />;
      default: return <BedDouble className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif">Alojamientos</h1>
          <p className="mt-1 text-sm text-muted">Añade y gestiona las opciones de alojamiento para los invitados.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Nuevo Alojamiento
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form
            key="edit-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSave}
            className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-border/80 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {currentAcc?.id ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <h2 className="text-xl font-serif">
                {currentAcc?.id ? "Editar Alojamiento" : "Nuevo Alojamiento"}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Basic Info */}
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Nombre del Alojamiento *</label>
                <input
                  type="text"
                  required
                  value={currentAcc?.name || ""}
                  onChange={(e) => setCurrentAcc({ ...currentAcc, name: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ej. Hotel Ritz"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Tipo *</label>
                <select
                  required
                  value={currentAcc?.type || "Hotel"}
                  onChange={(e) => setCurrentAcc({ ...currentAcc, type: e.target.value as AccommodationType })}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {ACCOMMODATION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Distancia</label>
                <input
                  type="text"
                  value={currentAcc?.distance || ""}
                  onChange={(e) => setCurrentAcc({ ...currentAcc, distance: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ej. A 10 min en coche"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Capacidad / Info</label>
                <input
                  type="text"
                  value={currentAcc?.capacity || ""}
                  onChange={(e) => setCurrentAcc({ ...currentAcc, capacity: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ej. 2-4 personas"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Rango Precio</label>
                <select
                  value={currentAcc?.priceRange || ""}
                  onChange={(e) => setCurrentAcc({ ...currentAcc, priceRange: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">No especificado</option>
                  <option value="€">€ (Económico)</option>
                  <option value="€€">€€ (Medio)</option>
                  <option value="€€€">€€€ (Alto)</option>
                </select>
              </div>

              {/* Media & Links */}
              <div className="space-y-2 lg:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">URL de la Imagen (Recomendado)</label>
                <input
                  type="url"
                  value={currentAcc?.imageUrl || ""}
                  onChange={(e) => setCurrentAcc({ ...currentAcc, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://ejemplo.com/foto-hotel.jpg"
                />
                {currentAcc?.imageUrl && (
                  <div className="mt-2 relative h-32 w-48 overflow-hidden rounded-xl border border-border">
                    <Image src={currentAcc.imageUrl} alt="Preview" fill sizes="192px" className="object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-2 lg:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Enlace para Reservar</label>
                <input
                    type="url"
                    value={currentAcc?.link || ""}
                    onChange={(e) => setCurrentAcc({ ...currentAcc, link: e.target.value })}
                    className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://booking.com/ejemplo"
                  />
              </div>

              <div className="space-y-2 lg:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Notas Adicionales</label>
                <textarea
                  value={currentAcc?.notes || ""}
                  onChange={(e) => setCurrentAcc({ ...currentAcc, notes: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                  placeholder="Instrucciones al llegar, política de mascotas..."
                />
              </div>

              <div className="col-span-full pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border/80 bg-background/50 hover:bg-primary/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={currentAcc?.hasBlock || false}
                    onChange={(e) => setCurrentAcc({ ...currentAcc, hasBlock: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-foreground">Descuento o Bloqueo Especial</span>
                    <span className="block text-xs text-muted">Marca esto si hay habitaciones reservadas o tarifas especiales para los invitados.</span>
                  </div>
                </label>
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-border/80 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-muted transition hover:bg-muted/10 hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
              >
                Guardar
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {accommodations.length === 0 ? (
               <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center text-muted">
                 No hay ningún alojamiento registrado todavía.
               </div>
            ) : accommodations.map((acc) => (
              <div
                key={acc.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm transition hover:shadow-md"
              >
                {/* Image Header */}
                <div className="relative h-40 w-full bg-muted/20">
                  {acc.imageUrl ? (
                    <Image src={acc.imageUrl} alt={acc.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted/50">
                      <BedDouble className="h-12 w-12" />
                    </div>
                  )}
                  {acc.hasBlock && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                      <Check className="h-3 w-3" />
                      Bloqueo Especial
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                    {getTypeIcon(acc.type)}
                    <span className="ml-1">{acc.type}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <header className="mb-4">
                    <h3 className="text-xl font-serif leading-tight text-foreground">{acc.name}</h3>
                    {acc.distance && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {acc.distance}
                      </div>
                    )}
                  </header>

                  <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border/50 pt-4 text-sm">
                     {acc.capacity && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted">Capacidad</p>
                          <p className="font-medium">{acc.capacity}</p>
                        </div>
                     )}
                     {acc.priceRange && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted">Precio</p>
                          <p className="font-semibold text-primary">{acc.priceRange}</p>
                        </div>
                     )}
                  </div>
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(acc)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:scale-110"
                    title="Editar"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id, acc.name)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-white shadow-lg transition hover:scale-110"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
