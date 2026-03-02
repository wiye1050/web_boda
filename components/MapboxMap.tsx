"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Centralized pins data
const PINS = [
  {
    id: "finca",
    label: "AG",
    color: "#8b7e74",
    coords: [-6.6358, 42.6186] as [number, number],
    title: "Finca El Casar",
    subtitle: "Cabañas Raras, Ponferrada",
    time: "12 sep 2026 · 13:30h",
    address: "C. Valle del Agua, 14, 24412 Cabañas Raras, León",
  },
  {
    id: "casino",
    label: "♥",
    color: "#5b634a",
    coords: [-6.5926, 42.5445] as [number, number],
    title: "Rooftop Casino de Ponferrada",
    subtitle: "Pre-boda",
    time: "11 sep 2026 · 19:30h",
    address: "C. Reloj, 14, 24400 Ponferrada, León",
  },
  {
    id: "hotel",
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
    label: "B",
    color: "#6b6560",
    coords: [-6.5898, 42.5430] as [number, number],
    title: "Parking Albergue Peregrinos",
    subtitle: "Parada de bus",
    time: "",
    address: "Av. el Castillo, 47, 24400 Ponferrada, León",
  }
];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export function MapboxMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12", // Vista satélite con calles
      center: [-6.6050, 42.5620], // Centered between Ponferrada and Cabañas Raras
      zoom: 11.5,
      pitch: 25, // Inclinación leve sugerida por el usuario
      bearing: -20, // Rotación de cámara
      attributionControl: false,
    });

    // Añadir topografía 3D (montañas reales)
    map.on("style.load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      // Exageración 1.5 para notar más el relieve del Bierzo
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
    });

    // Custom marker SVG function
    const makeSvgEl = (label: string, color: string) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 54" width="42" height="54" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.25))">
          <path d="M21 0C9.4 0 0 9.4 0 21c0 16 21 33 21 33s21-17 21-33C42 9.4 32.6 0 21 0z" fill="${color}"/>
          <circle cx="21" cy="21" r="13" fill="rgba(255,255,255,0.15)"/>
          <text x="21" y="26" text-anchor="middle" font-size="11" font-family="Georgia,serif" font-style="italic" fill="white" font-weight="bold">${label}</text>
        </svg>`;
      el.style.cursor = "pointer";
      el.style.width = "42px";
      el.style.height = "54px";
      return el;
    };

    map.on("load", () => {
      // Create markers dynamically from PINS array
      PINS.forEach((pin) => {
        // Build the Google Maps direction URL using the exact literal address string
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pin.address)}`;
        
        new mapboxgl.Marker({ element: makeSvgEl(pin.label, pin.color), anchor: "bottom" })
          .setLngLat(pin.coords)
          .setPopup(
            new mapboxgl.Popup({ offset: 50, className: "wb-popup" }).setHTML(`
              <div style="font-family:Georgia,serif;padding:4px 2px;text-align:center">
                <p style="font-weight:bold;font-size:14px;margin:0 0 2px">${pin.title}</p>
                <p style="font-size:12px;color:#6b6560;margin:0">${pin.subtitle}</p>
                ${pin.time ? `<p style="font-size:11px;color:#a08b7a;margin:2px 0 0">${pin.time}</p>` : ""}
                <div style="margin-top:10px">
                  <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:${pin.color};color:white;text-decoration:none;padding:6px 12px;border-radius:20px;font-size:11px;font-family:sans-serif;font-weight:bold;text-transform:uppercase;letter-spacing:1px;transition:opacity 0.2s">Cómo llegar</a>
                </div>
              </div>`)
          )
          .addTo(map);
      });

      // Navigation control
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    });

    return () => map.remove();
  }, []);

  if (!TOKEN) return null;

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-[var(--radius-card)]"
      aria-label="Mapa con ubicaciones de la boda y preboda"
    />
  );
}
