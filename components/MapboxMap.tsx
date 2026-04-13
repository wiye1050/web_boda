"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapCategory = "all" | "accommodation" | "tourism";

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

      const filteredPins = PINS.filter(p => p.category === "all" || category === "all" || p.category === category);

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

      // Fly to a central point depending on category if needed
      if (category === "tourism") {
        map.flyTo({ center: [-6.5920, 42.5450], zoom: 14, duration: 2500 });
      } else if (category === "accommodation") {
        map.flyTo({ center: [-6.5915, 42.5441], zoom: 15, duration: 2500 });
      } else {
        map.flyTo({ center: [-6.6050, 42.5620], zoom: 11.5, duration: 2500 });
      }
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
