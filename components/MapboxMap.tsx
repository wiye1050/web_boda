"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Finca El Casar, Cabañas Raras, Ponferrada
const WEDDING_COORDS: [number, number] = [-6.6198, 42.5572];
// Casino de Ponferrada (preboda)
const PREBODA_COORDS: [number, number] = [-6.5874, 42.5462];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export function MapboxMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-6.6050, 42.5520],
      zoom: 11,
      attributionControl: false,
    });

    // Custom AG marker SVG
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
      // Wedding venue marker
      new mapboxgl.Marker({ element: makeSvgEl("AG", "#8b7e74"), anchor: "bottom" })
        .setLngLat(WEDDING_COORDS)
        .setPopup(
          new mapboxgl.Popup({ offset: 50, className: "wb-popup" }).setHTML(`
            <div style="font-family:Georgia,serif;padding:4px 2px">
              <p style="font-weight:bold;font-size:14px;margin:0 0 2px">Finca El Casar</p>
              <p style="font-size:12px;color:#6b6560;margin:0">Cabañas Raras, Ponferrada</p>
              <p style="font-size:11px;color:#a08b7a;margin:4px 0 0">12 sep 2026 · 13:30h</p>
            </div>`)
        )
        .addTo(map);

      // Preboda marker
      new mapboxgl.Marker({ element: makeSvgEl("♥", "#5b634a"), anchor: "bottom" })
        .setLngLat(PREBODA_COORDS)
        .setPopup(
          new mapboxgl.Popup({ offset: 50, className: "wb-popup" }).setHTML(`
            <div style="font-family:Georgia,serif;padding:4px 2px">
              <p style="font-weight:bold;font-size:14px;margin:0 0 2px">Rooftop Casino de Ponferrada</p>
              <p style="font-size:12px;color:#6b6560;margin:0">Pre-boda</p>
              <p style="font-size:11px;color:#a08b7a;margin:4px 0 0">11 sep 2026 · 19:30h</p>
            </div>`)
        )
        .addTo(map);

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
