"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useRouter } from "next/navigation";
import { type Experience } from "@/lib/data";
import SmartImg from "./SmartImg";

// modern map: clean light CARTO Positron basemap (WebGL via MapLibre),
// price-pill markers, and a card carousel synced to the active pin.
const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};

function pinStyle(el: HTMLElement, active: boolean) {
  el.style.cssText = `
    cursor:pointer; white-space:nowrap; font-family:inherit;
    font-weight:700; font-size:13px; line-height:1;
    padding:7px 10px; border-radius:999px;
    border:1px solid ${active ? "#1a1a1a" : "#e0e0e0"};
    background:${active ? "#1a1a1a" : "#fff"};
    color:${active ? "#fff" : "#1a1a1a"};
    box-shadow:0 2px 8px rgba(0,0,0,.22);
    transform:scale(${active ? 1.12 : 1}); transition:transform .15s, background .15s;
    z-index:${active ? 5 : 1};
  `;
}

export default function MapView({ items }: { items: Experience[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, { marker: maplibregl.Marker; el: HTMLElement }>>({});
  const railRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  const select = (id: string, fly = true) => {
    setActiveId(id);
    Object.entries(markersRef.current).forEach(([mid, { el }]) => pinStyle(el, mid === id));
    const card = railRef.current?.querySelector<HTMLElement>(`[data-card="${CSS.escape(id)}"]`);
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    const exp = items.find((e) => e.id === id);
    if (fly && exp && mapRef.current) {
      mapRef.current.easeTo({ center: [exp.lng, exp.lat], duration: 500, offset: [0, -60] });
    }
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [-119.6982, 34.4208],
      zoom: 12,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on("load", () => {
      map.resize();
      // frame all listings
      if (items.length) {
        const bounds = items.reduce(
          (b, e) => b.extend([e.lng, e.lat] as [number, number]),
          new maplibregl.LngLatBounds([items[0].lng, items[0].lat], [items[0].lng, items[0].lat])
        );
        map.fitBounds(bounds, { padding: { top: 70, bottom: 150, left: 50, right: 50 }, duration: 0 });
      }
      items.forEach((e) => {
        const el = document.createElement("button");
        el.textContent = `$${e.price}`;
        pinStyle(el, e.id === activeRef.current);
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          select(e.id);
        });
        const marker = new maplibregl.Marker({ element: el }).setLngLat([e.lng, e.lat]).addTo(map);
        markersRef.current[e.id] = { marker, el };
      });
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0">
      {/* maplibre forces position:relative on its container, so inset-0 won't
          stretch it — use explicit full height/width instead. */}
      <div ref={containerRef} className="h-full w-full" />

      {/* card carousel overlaid on the map */}
      <div
        ref={railRef}
        className="no-scrollbar absolute inset-x-0 bottom-3 z-30 flex gap-3 overflow-x-auto px-4"
      >
        {items.map((e) => (
          <button
            key={e.id}
            data-card={e.id}
            onClick={() => (e.id === activeId ? router.push(`/experience/${e.id}`) : select(e.id))}
            className={`flex w-[244px] shrink-0 gap-3 rounded-card bg-white p-2.5 text-left shadow-pop transition ${
              e.id === activeId ? "ring-2 ring-accent" : "opacity-95"
            }`}
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-hairline">
              <SmartImg src={e.images[0]} seed={`${e.id}-map`} alt={e.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{e.title}</p>
              <p className="truncate text-[12px] text-muted">
                ★ {e.rating.toFixed(2)} · {e.neighborhood}
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-ink">
                ${e.price} <span className="font-normal text-muted">all-in</span>
              </p>
              <p className="text-[11px] font-medium text-accent">
                {e.id === activeId ? "Tap again to open →" : ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
