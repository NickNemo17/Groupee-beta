"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};

export default function MiniMap({ lat, lng }: { lat: number; lng: number; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE,
      center: [lng, lat],
      zoom: 14,
      interactive: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.on("load", () => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:28px;height:28px;border-radius:999px;background:#53a318;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);display:grid;place-items:center;color:#fff;font-size:13px";
      el.textContent = "📍";
      new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    });
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return <div ref={ref} className="h-full w-full" />;
}
