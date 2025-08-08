"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L, { Marker as LeafletMarker, LatLngExpression, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";

// Fixed default icon (fallback for points without custom icon)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
(LeafletMarker.prototype.options as unknown as { icon: L.Icon }).icon = DefaultIcon;

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  dayIndex?: number; // 0-based day index within the trip
  order?: number; // order within the day (0-based or 1-based supported)
};

function FlyToBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.flyToBounds(bounds.pad(0.2), { duration: 0.5 });
  }, [points, map]);
  return null;
}

const DAY_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#22c55e", // emerald
  "#e11d48", // rose
  "#0ea5e9", // sky
];

function useGroupedByDay(points: MapPoint[]) {
  return useMemo(() => {
    const groups = new Map<number, MapPoint[]>();
    for (const p of points) {
      const d = p.dayIndex;
      if (d == null) continue;
      const list = groups.get(d) ?? [];
      list.push(p);
      groups.set(d, list);
    }
    // sort each group by order if available, else stable
    for (const [k, arr] of groups) {
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      groups.set(k, arr);
    }
    return groups;
  }, [points]);
}

function numberIcon(number: number, color: string): DivIcon {
  const html = `
    <div style="
      background: ${color};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      border: 2px solid white;
      box-shadow: 0 1px 6px rgba(0,0,0,0.3);
    ">${number}</div>`;
  return L.divIcon({
    className: "trip-number-pin",
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export default function TripMap({ points, center, height = 600 }: { points: MapPoint[]; center?: { lat: number; lng: number }; height?: number | string }) {
  const defaultCenter = center || (points[0] ? { lat: points[0].lat, lng: points[0].lng } : { lat: 20, lng: 0 });
  const centerLatLng: LatLngExpression = [defaultCenter.lat, defaultCenter.lng];
  const groups = useGroupedByDay(points);

  const [visibleDays, setVisibleDays] = useState<Set<number>>(new Set());
  const hasDays = useMemo(() => groups.size > 0, [groups]);
  useEffect(() => {
    // Initialize visibility to all days present
    const next = new Set<number>();
    for (const d of groups.keys()) next.add(d);
    setVisibleDays(next);
  }, [groups]);

  const filteredPoints = useMemo(() => {
    if (!hasDays) return points; // if no dayIndex present, show all
    return points.filter((p) => p.dayIndex == null || visibleDays.has(p.dayIndex));
  }, [points, visibleDays, hasDays]);

  const containerHeight = typeof height === "number" ? `${height}px` : height;

  const Legend = () => {
    const map = useMap();
    const fitAllVisible = () => {
      if (filteredPoints.length === 0) return;
      const bounds = L.latLngBounds(filteredPoints.map((p) => [p.lat, p.lng] as [number, number]));
      map.flyToBounds(bounds.pad(0.2), { duration: 0.5 });
    };

    const fitDay = (day: number) => {
      const arr = groups.get(day) || [];
      if (arr.length === 0) return;
      const bounds = L.latLngBounds(arr.map((p) => [p.lat, p.lng] as [number, number]));
      map.flyToBounds(bounds.pad(0.2), { duration: 0.5 });
    };

    if (!hasDays) return null;
    return (
      <div className="absolute top-2 right-2 z-[1000] space-y-2 text-sm">
        <div className="bg-white/90 backdrop-blur border rounded shadow-sm p-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-medium">Days</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="px-2 py-1 border rounded hover:bg-gray-50"
                onClick={() => {
                  const all = new Set<number>();
                  for (const d of groups.keys()) all.add(d);
                  setVisibleDays(all);
                }}
              >
                All
              </button>
              <button
                type="button"
                className="px-2 py-1 border rounded hover:bg-gray-50"
                onClick={() => setVisibleDays(new Set())}
              >
                None
              </button>
              <button
                type="button"
                className="px-2 py-1 border rounded hover:bg-gray-50"
                onClick={fitAllVisible}
              >
                Fit
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-auto pr-1">
            {Array.from(groups.entries()).map(([day, arr]) => {
              const color = DAY_COLORS[day % DAY_COLORS.length];
              const checked = visibleDays.has(day);
              return (
                <div key={day} className="flex items-center justify-between gap-2 py-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(visibleDays);
                        if (e.target.checked) next.add(day); else next.delete(day);
                        setVisibleDays(next);
                      }}
                    />
                    <span>Day {day + 1} <span className="text-gray-500">({arr.length})</span></span>
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                      onClick={() => setVisibleDays(new Set([day]))}
                    >
                      Only
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                      onClick={() => fitDay(day)}
                    >
                      Fit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 relative" style={{ height: containerHeight }}>
      <MapContainer center={centerLatLng} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render polylines by day to connect the route order */}
        {Array.from(groups.entries()).filter(([day]) => visibleDays.has(day)).map(([day, arr]) => {
          const color = DAY_COLORS[day % DAY_COLORS.length];
          const latlngs = arr.map((p) => [p.lat, p.lng]) as [number, number][];
          return <Polyline key={`poly-${day}`} positions={latlngs} pathOptions={{ color, weight: 3, opacity: 0.8 }} />;
        })}

        {/* Render markers, colored & numbered by their day's order */}
        {filteredPoints.map((p) => {
          const color = p.dayIndex != null ? DAY_COLORS[p.dayIndex % DAY_COLORS.length] : "#2563eb"; // default blue
          const number = p.order != null ? (p.order + 1) : undefined;
          const icon = number ? numberIcon(number, color) : DefaultIcon;
          return (
            <Marker position={[p.lat, p.lng]} key={p.id} icon={icon as unknown as L.Icon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{p.name}</div>
                  {p.address && <div className="text-gray-500">{p.address}</div>}
                  {p.dayIndex != null && (
                    <div className="text-xs mt-1" style={{ color }}>
                      Day {p.dayIndex + 1}{number ? ` • Stop ${number}` : ""}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        <FlyToBounds points={points} />
        <Legend />
      </MapContainer>
    </div>
  );
}
