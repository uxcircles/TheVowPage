"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
// Leaflet's JS assumes this stylesheet is present (tile pane positioning,
// container overflow, control layout, etc). Without it tiles render
// scattered/unclipped instead of neatly filling the container.
import "leaflet/dist/leaflet.css";

export function VenueMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([lat, lng], 16);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: '<div class="venue-pin"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 14],
      });

      L.marker([lat, lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<div class="venue-popup">${label}</div>`)
        .openPopup();

      mapRef.current = map;

      // Leaflet measures its container once at creation time and caches
      // that size. If the container is inside a modal, a just-expanded
      // section, or anything else that isn't fully laid out yet at that
      // instant, the cached size is wrong and tiles render for the wrong
      // bounds (scattered/cut-off tiles). Re-measure on the next frame,
      // and keep re-measuring whenever the container's actual size changes.
      requestAnimationFrame(() => map.invalidateSize());

      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => map.invalidateSize());
        resizeObserver.observe(containerRef.current);
      }
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label]);

  // h-full/w-full so this fills its parent by default wherever it's used;
  // the Classic template's own CSS (.classic .venue-map { height: 360px })
  // is more specific and overrides this there, as intended.
  return <div ref={containerRef} className="venue-map h-full w-full" />;
}
