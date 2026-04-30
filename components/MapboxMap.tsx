"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapCategory = "all" | "accommodation" | "tourism" | "hair" | "makeup";

const PINS = [
  // Core Locations
  {
    id: "finca",
    category: "all",
    label: "AG",
    color: "#8b7e74",
    coords: [-6.6358, 42.6186] as [number, number],
    title: "Finca El Casar",
    subtitle: "Ceremonia y Banquete",
    time: "12 sep 2026 · 13:30h",
    address: "C. Valle del Agua, 14, 24412 Cabañas Raras, León",
  },
  {
    id: "casino",
    category: "all",
    label: "♥",
    color: "#5b634a",
    coords: [-6.5926, 42.5445] as [number, number],
    title: "Rooftop Casino de Ponferrada",
    subtitle: "Pre-boda",
    time: "11 sep 2026 · 19:30h",
    address: "C. Reloj, 14, 24400 Ponferrada, León",
  },
  // Accommodations (Existing/Default)
  {
    id: "hotel-aroi",
    category: "accommodation",
    label: "H",
    color: "#a08b7a",
    coords: [-6.5915, 42.5441] as [number, number],
    title: "Hotel Aroi Bierzo",
    subtitle: "Alojamiento",
    time: "",
    address: "Pl. Ayuntamiento, 4, 24401 Ponferrada, León",
  },
  {
    id: "bus",
    category: "accommodation",
    label: "B",
    color: "#6b6560",
    coords: [-6.5898, 42.5430] as [number, number],
    title: "Parking Albergue Peregrinos",
    subtitle: "Parada de bus",
    time: "",
    address: "Av. el Castillo, 47, 24400 Ponferrada, León",
  },
  // Tourism / Gastro
  {
    id: "castillo",
    category: "tourism",
    label: "🏰",
    color: "#6b705c",
    coords: [-6.5908, 42.5458] as [number, number],
    title: "Castillo de los Templarios",
    subtitle: "Turismo Imprescindible",
    time: "Vista histórica",
    address: "Av. el Castillo, s/n, 24400 Ponferrada, León",
  },
  {
    id: "bodegon",
    category: "tourism",
    label: "🍲",
    color: "#b48464",
    coords: [-6.5920, 42.5443] as [number, number],
    title: "El Bodegón",
    subtitle: "Las mejores bravas",
    time: "Gastro Recomendación",
    address: "C. Travesía de Pelayo, 2, 24400 Ponferrada, León",
  },
  {
    id: "palacio-canedo",
    category: "tourism",
    label: "🍷",
    color: "#a44a3f",
    coords: [-6.7126, 42.6165] as [number, number],
    title: "Prada a Tope (Palacio de Canedo)",
    subtitle: "Vistas y Viñedos",
    time: "Gastro y Enoturismo",
    address: "C. la Iglesia, s/n, 24545 Canedo, León",
  },
  // Hair / Beauty
  {
    id: "sagra",
    category: "hair",
    label: "✂️",
    color: "#c69b7b",
    coords: [-6.5937, 42.5458] as [number, number],
    title: "Peluquería Sagra",
    subtitle: "Peluquería de confianza",
    time: "Reserva anticipada",
    address: "Av. Valdés, 5, 24402 Ponferrada, León",
  },
  {
    id: "kahos",
    category: "hair",
    label: "✂️",
    color: "#b48464",
    coords: [-6.5957, 42.5413] as [number, number],
    title: "KAHOS by baró estilistas",
    subtitle: "Peluquería y Estética",
    time: "Reserva anticipada",
    address: "Paseo San Antonio, 11, 24401 Ponferrada, León",
  },
  {
    id: "alba-canas",
    category: "makeup",
    label: "AC",
    color: "#a08b7a",
    coords: [-6.6575, 42.7248] as [number, number],
    title: "Alba Cañas Estética",
    subtitle: "Maquillaje (Se desplaza)",
    time: "Reserva anticipada",
    address: "Avenida Ancares, 8, Bajo, 24434 Vega de Espinareda, León",
  },
  // Accommodations
  {
    id: "aroi-bierzo",
    category: "accommodation",
    label: "HO",
    color: "#5b6d65",
    coords: [-6.5936, 42.5447] as [number, number],
    title: "Hotel Aroi Bierzo Plaza",
    subtitle: "Alojamiento",
    time: "",
    address: "Pl. Ayuntamiento, 4, 24401 Ponferrada, León",
  },
  {
    id: "hotel-alda",
    category: "accommodation",
    label: "HO",
    color: "#5b6d65",
    coords: [-6.5959, 42.5458] as [number, number],
    title: "Hotel Alda",
    subtitle: "Alojamiento",
    time: "",
    address: "Av. la Puebla, 44, 24402 Ponferrada, León",
  },
  {
    id: "guiana",
    category: "accommodation",
    label: "AP",
    color: "#5b6d65",
    coords: [-6.5942, 42.5432] as [number, number],
    title: "Apartamentos Turísticos Guiana",
    subtitle: "Alojamiento",
    time: "",
    address: "Av. del Castillo, 54, 24401 Ponferrada, León",
  },
  // Tourism
  {
    id: "castillo",
    category: "tourism",
    label: "CA",
    color: "#8b7a60",
    coords: [-6.5960, 42.5444] as [number, number],
    title: "Castillo de los Templarios",
    subtitle: "Cultura",
    time: "",
    address: "Av. del Castillo, s/n, 24400 Ponferrada, León",
  },
  {
    id: "medulas",
    category: "tourism",
    label: "ME",
    color: "#8b7a60",
    coords: [-6.7645, 42.4613] as [number, number],
    title: "Las Médulas",
    subtitle: "Naturaleza",
    time: "",
    address: "24442 Las Médulas, León",
  },
  {
    id: "penalba",
    category: "tourism",
    label: "PE",
    color: "#8b7a60",
    coords: [-6.5398, 42.4276] as [number, number],
    title: "Peñalba de Santiago",
    subtitle: "Pueblo con Encanto",
    time: "",
    address: "24415 Peñalba de Santiago, León",
  },
  {
    id: "molinaseca",
    category: "tourism",
    label: "MO",
    color: "#8b7a60",
    coords: [-6.5197, 42.5386] as [number, number],
    title: "Molinaseca",
    subtitle: "Pueblo con Encanto",
    time: "",
    address: "24413 Molinaseca, León",
  },
  {
    id: "bodegon",
    category: "tourism",
    label: "BO",
    color: "#8b7a60",
    coords: [-6.5937, 42.5440] as [number, number],
    title: "El Bodegón",
    subtitle: "Gastro",
    time: "",
    address: "C. Pelayo, 2, 24401 Ponferrada, León",
  },
  {
    id: "canedo",
    category: "tourism",
    label: "PA",
    color: "#8b7a60",
    coords: [-6.7029, 42.6167] as [number, number],
    title: "Palacio de Canedo",
    subtitle: "Bodega",
    time: "",
    address: "Calle de la Iglesia, s/n, 24546 Canedo, León",
  }
];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export function MapboxMap({ category = "all" }: { category?: MapCategory }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [-6.6050, 42.5620],
      zoom: 11.5,
      pitch: 25,
      bearing: -20,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("style.load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
    });

    const makeSvgEl = (label: string, color: string) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 54" width="42" height="54" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.25))">
          <path d="M21 0C9.4 0 0 9.4 0 21c0 16 21 33 21 33s21-17 21-33C42 9.4 32.6 0 21 0z" fill="${color}"/>
          <circle cx="21" cy="21" r="13" fill="rgba(255,255,255,0.15)"/>
          <text x="21" y="27" text-anchor="middle" font-size="12" font-family="system-ui" fill="white" font-weight="bold">${label}</text>
        </svg>`;
      el.style.cursor = "pointer";
      el.style.width = "42px";
      el.style.height = "54px";
      return el;
    };

    const updateMarkers = () => {
      // Clear existing
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Todos los pines visibles siempre
      const filteredPins = PINS;

      filteredPins.forEach((pin) => {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pin.address)}`;
        
        const marker = new mapboxgl.Marker({ element: makeSvgEl(pin.label, pin.color), anchor: "bottom" })
          .setLngLat(pin.coords)
          .setPopup(
            new mapboxgl.Popup({ offset: 40, className: "wb-popup" }).setHTML(`
              <div style="font-family:serif;padding:8px 4px;text-align:center;min-width:160px">
                <p style="font-weight:bold;font-size:14px;margin:0 0 4px">${pin.title}</p>
                <p style="font-size:11px;color:#6b6560;margin:0;line-height:1.2">${pin.subtitle}</p>
                ${pin.time ? `<p style="font-size:11px;color:#a08b7a;margin:6px 0 0;font-style:italic">${pin.time}</p>` : ""}
                <div style="margin-top:12px">
                  <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:${pin.color};color:white;text-decoration:none;padding:8px 16px;border-radius:20px;font-size:10px;font-family:sans-serif;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Google Maps</a>
                </div>
              </div>`)
          )
          .addTo(map);
        
        markersRef.current.push(marker);
      });
    };

    map.on("load", updateMarkers);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [category]);

  if (!TOKEN) return null;

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-[var(--radius-card)]"
      aria-label="Mapa con ubicaciones de la boda y preboda"
    />
  );
}
