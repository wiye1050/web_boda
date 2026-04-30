"use client";

import { useState } from "react";
import Image from "next/image";
import { PracticalList } from "./PracticalList";
import { StayList } from "./StayList";
import { MapInteractive } from "./MapInteractive";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, Utensils, Info, Coffee, Camera, Scissors, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "info" | "accommodation" | "tourism" | "hair" | "makeup";

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
  const [activeCategory, setActiveCategory] = useState<Category>("info");

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
      <div className="flex justify-start sm:justify-center w-[100vw] ml-[calc(50%-50vw)] overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-2">
        <div className="inline-flex shrink-0 p-1.5 rounded-full bg-surface/80 glass border border-border/40 shadow-sm mx-auto sm:mx-0 min-w-max">
          <button
            onClick={() => setActiveCategory("info")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              activeCategory === "info" 
                ? "bg-accent text-white shadow-sm" 
                : "text-muted hover:text-foreground"
            )}
          >
            <Info className="h-3.5 w-3.5" />
            Info
          </button>
          <button
            onClick={() => setActiveCategory("accommodation")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              activeCategory === "accommodation" 
                ? "bg-accent text-white shadow-sm" 
                : "text-muted hover:text-foreground"
            )}
          >
            <BedDouble className="h-3.5 w-3.5" />
            Dormir
          </button>
          <button
            onClick={() => setActiveCategory("tourism")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              activeCategory === "tourism" 
                ? "bg-accent text-white shadow-sm" 
                : "text-muted hover:text-foreground"
            )}
          >
            <Camera className="h-3 w-3" />
            Qué hacer
          </button>
          <button
            onClick={() => setActiveCategory("hair")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              activeCategory === "hair" 
                ? "bg-accent text-white shadow-sm" 
                : "text-muted hover:text-foreground"
            )}
          >
            <Scissors className="h-3.5 w-3.5" />
            Peluquería
          </button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Sidebar: Content depending on category */}
        <div className="flex flex-col gap-8 order-2 lg:order-1 max-h-[500px] lg:max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent pr-4">
            <AnimatePresence mode="wait">
                {activeCategory === "info" ? (
                    <motion.div
                        key="info-list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-6"
                    >
                         <div className="rounded-3xl bg-surface/50 border border-border/30 p-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4">
                                <Info className="h-3 w-3" /> Info Práctica
                            </h4>
                            <p className="text-[11px] text-muted leading-relaxed mb-6 italic">
                                Detalles importantes para vuestro viaje y estancia durante el evento.
                            </p>
                            <PracticalList variant="strip" items={practicalItems} />
                         </div>
                    </motion.div>
                ) : activeCategory === "accommodation" ? (
                    <motion.div
                        key="acc-list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-6"
                    >
                         <div className="rounded-3xl bg-surface/50 border border-border/30 p-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4">
                                <BedDouble className="h-3 w-3" /> Opciones de Alojamiento
                            </h4>
                            <p className="text-[11px] text-muted leading-relaxed mb-6 italic">
                                Hemos seleccionado los mejores hoteles cercanos al evento con tarifas preferenciales.
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
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="rounded-3xl bg-accent/5 border border-accent/20 p-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4">
                                <Scissors className="h-3 w-3" /> Peluquería y Maquillaje
                            </h4>
                            <p className="text-[11px] text-muted leading-relaxed mb-6 italic">
                                Hemos seleccionado estas dos opciones de confianza en Ponferrada para que estéis radiantes.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {hairItems.map((item) => (
                                    <a 
                                        key={item.id} 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group relative h-40 overflow-hidden rounded-2xl bg-surface border border-border/40 shadow-sm transition-all hover:-translate-y-1"
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />
                                        <div className="absolute bottom-3 left-4 text-white z-30">
                                            <p className="text-[8px] uppercase tracking-widest text-white/70">{item.type}</p>
                                            <p className="font-serif text-sm italic">{item.name}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="tourism-list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="rounded-3xl bg-accent/5 border border-accent/20 p-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4">
                                <Coffee className="h-3 w-3" /> Recomendaciones
                            </h4>
                            <p className="text-[11px] text-muted leading-relaxed mb-6 italic">
                                Ponferrada y el Bierzo tienen lugares mágicos. Aquí os dejamos unos imprescindibles que no os podéis perder.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tourismItems.slice(0, 4).map((item) => (
                                    <a 
                                        key={item.id} 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group relative h-40 overflow-hidden rounded-2xl bg-surface border border-border/40 shadow-sm transition-all hover:-translate-y-1"
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />
                                        <div className="absolute bottom-3 left-4 text-white z-30">
                                            <p className="text-[8px] uppercase tracking-widest text-white/70">{item.type}</p>
                                            <p className="font-serif text-sm italic">{item.name}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Map Column - Always Right on desktop */}
        <div className="relative group order-1 lg:order-2">
           <div className="absolute -inset-1 bg-accent/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
           <MapInteractive 
             mapboxToken={mapboxToken} 
             embedUrl={embedUrl}
             category={activeCategory === "info" ? "accommodation" : activeCategory}
           />
        </div>
      </div>
    </div>
  );
}
