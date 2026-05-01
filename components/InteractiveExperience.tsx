"use client";

import { useState } from "react";
import Image from "next/image";
import { PracticalList } from "./PracticalList";
import { StayList } from "./StayList";
import { MapInteractive } from "./MapInteractive";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, Coffee, Camera, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "accommodation" | "tourism" | "hair" | "makeup";

export function InteractiveExperience({ 
  accommodations, 
  practicalItems,
  mapboxToken,
  embedUrl
}: { 
  accommodations: any[]; 
  practicalItems: any[];
  mapboxToken?: string;
  embedUrl?: string;
}) {
  const [activeCategory, setActiveCategory] = useState<Category>("accommodation");

  const tourismItems = [
    {
      id: "castillo",
      name: "Castillo de los Templarios",
      type: "Cultura",
      distance: "En el centro",
      priceRange: "Ticket 6€",
      imageUrl: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Castillo_de_los_Templarios_de_Ponferrada.jpg&width=800",
      link: "https://www.ponferrada.org/turismo/es/monumentos/castillo-templarios",
    },
    {
      id: "medulas",
      name: "Las Médulas",
      type: "Naturaleza",
      distance: "A 25 min",
      priceRange: "Patrimonio UNESCO",
      imageUrl: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Panor%C3%A1mica_de_Las_M%C3%A9dulas.jpg&width=800",
      link: "https://www.ponferrada.org/turismo/es/entorno/medulas",
    },
    {
      id: "penalba",
      name: "Peñalba de Santiago",
      type: "Pueblo",
      distance: "A 30 min",
      priceRange: "Pueblo más bonito",
      imageUrl: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Pe%C3%B1alba_de_Santiago.jpg&width=800",
      link: "https://www.ponferrada.org/turismo/es/entorno/penalba-santiago",
    },
    {
      id: "molinaseca",
      name: "Molinaseca",
      type: "Pueblo",
      distance: "A 10 min",
      priceRange: "Camino de Santiago",
      imageUrl: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Molinaseca_puente_romano.jpg&width=800",
      link: "https://www.turismocastillayleon.com/es/rural-naturaleza/pueblos-con-encanto/molinaseca",
    },
    {
      id: "bodegon",
      name: "El Bodegón",
      type: "Gastro",
      distance: "Casco Antiguo",
      priceRange: "Las mejores bravas",
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
      link: "https://www.google.com/maps/search/?api=1&query=El+Bodegón+Ponferrada",
    },
    {
      id: "palacio",
      name: "Palacio de Canedo",
      type: "Bodega",
      distance: "A 15 min",
      priceRange: "Prada a Tope",
      imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800&auto=format&fit=crop",
      link: "https://www.pradaatope.es/palacio-de-canedo/",
    },
  ];

  const hairItems = [
    {
      id: "sagra",
      name: "Peluquería Sagra",
      type: "Peluquería",
      distance: "Centro",
      priceRange: "Reserva anticipada",
      imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop",
      link: "https://www.google.com/maps/search/?api=1&query=Peluquería+Sagra+Ponferrada",
    },
    {
      id: "kahos",
      name: "KAHOS by baró estilistas",
      type: "Peluquería y Estética",
      distance: "Centro",
      priceRange: "Reserva anticipada",
      imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop",
      link: "https://www.google.com/maps/search/?api=1&query=KAHOS+by+baró+estilistas+Ponferrada",
    },
    {
      id: "alba-canas",
      name: "Alba Cañas Centro Estética Avanzada",
      type: "Maquillaje",
      distance: "Se desplaza al lugar",
      priceRange: "Reserva anticipada",
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
      link: "https://albacestetica.com/",
    }
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Category Toggles */}
      <div className="flex justify-center w-full overflow-x-auto scrollbar-hide px-4 pb-2">
        <div className="inline-flex p-1.5 rounded-full bg-white/40 backdrop-blur-sm border border-accent/10 shadow-sm min-w-max">
          <button
            onClick={() => setActiveCategory("accommodation")}
            className={cn(
              "flex items-center gap-1.5 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              activeCategory === "accommodation" 
                ? "bg-accent text-white shadow-md scale-105" 
                : "text-muted hover:text-accent/60"
            )}
          >
            <BedDouble className="h-3 w-3" />
            Dormir
          </button>
          <button
            onClick={() => setActiveCategory("tourism")}
            className={cn(
              "flex items-center gap-1.5 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              activeCategory === "tourism" 
                ? "bg-accent text-white shadow-md scale-105" 
                : "text-muted hover:text-accent/60"
            )}
          >
            <Camera className="h-3 w-3" />
            Qué hacer
          </button>
          <button
            onClick={() => setActiveCategory("hair")}
            className={cn(
              "flex items-center gap-1.5 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              activeCategory === "hair" 
                ? "bg-accent text-white shadow-md scale-105" 
                : "text-muted hover:text-accent/60"
            )}
          >
            <Scissors className="h-3 w-3" />
            Peluquería
          </button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Sidebar: Content depending on category */}
        <div className="flex flex-col gap-8 order-1 lg:max-h-[650px] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-accent/10 lg:scrollbar-track-transparent lg:pr-6">
            <AnimatePresence mode="wait">
                {activeCategory === "accommodation" ? (
                    <motion.div
                        key="acc-list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                    >
                         <div className="p-2">
                            <h4 className="font-script text-xl text-accent/80 mb-1">Dónde dormir</h4>
                            <p className="font-serif italic text-sm text-muted/80 leading-relaxed mb-8">
                                Selección de hoteles cercanos con tarifas especiales para vosotros.
                            </p>
                            <StayList
                                items={accommodations}
                                linkLabel="Ver hotel"
                                showViewAll={true}
                                variant="compact"
                            />
                         </div>
                    </motion.div>
                ) : activeCategory === "hair" ? (
                    <motion.div
                        key="hair-list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="p-2">
                            <h4 className="font-script text-xl text-accent/80 mb-1">Para estar radiantes</h4>
                            <p className="font-serif italic text-sm text-muted/80 leading-relaxed mb-8">
                                Opciones de confianza en Ponferrada para peluquería y maquillaje.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {hairItems.map((item, idx) => (
                                    <a 
                                        key={item.id} 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group relative h-48 overflow-hidden rounded-2xl bg-white/60 border border-accent/10 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
                                    >
                                        <div className="absolute inset-0 z-10">
                                            <Image 
                                                src={item.imageUrl} 
                                                alt={item.name} 
                                                fill
                                                sizes="(max-width: 640px) 100vw, 300px"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-20" />
                                        <div className="absolute bottom-4 left-5 text-white z-30">
                                            <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">{item.type}</p>
                                            <p className="font-serif text-xl italic leading-tight">{item.name}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="tourism-list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="p-2">
                            <h4 className="font-script text-xl text-accent/80 mb-1">El Bierzo Mágico</h4>
                            <p className="font-serif italic text-sm text-muted/80 leading-relaxed mb-8">
                                Algunos imprescindibles que no os podéis perder durante vuestra estancia.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {tourismItems.slice(0, 4).map((item, idx) => (
                                    <a 
                                        key={item.id} 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group relative h-48 overflow-hidden rounded-2xl bg-white/60 border border-accent/10 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
                                    >
                                        <div className="absolute inset-0 z-10">
                                            <Image 
                                                src={item.imageUrl.includes("unsplash.com") 
                                                    ? `${item.imageUrl}${item.imageUrl.includes("?") ? "&" : "?"}auto=format&fit=crop&q=80&w=600`
                                                    : item.imageUrl
                                                } 
                                                alt={item.name} 
                                                fill
                                                sizes="(max-width: 640px) 100vw, 300px"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-20" />
                                        <div className="absolute bottom-4 left-5 text-white z-30">
                                            <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">{item.type}</p>
                                            <p className="font-serif text-xl italic leading-tight">{item.name}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Map Column - Always last on stack */}
        <div className="relative group order-2">
           <div className="absolute -inset-1 bg-accent/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
           <MapInteractive 
             mapboxToken={mapboxToken} 
             embedUrl={embedUrl}
             category={activeCategory}
           />
        </div>
      </div>
    </div>
  );
}
