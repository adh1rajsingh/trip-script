"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import Supercluster, { type AnyProps, type PointFeature } from "supercluster";
import L, { Marker as LeafletMarker, LatLngExpression, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useRef, useState } from "react";

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

function FlyToBounds({ points, enabled = true }: { points: MapPoint[]; enabled?: boolean }) {
  const map = useMap();
  const didFitRef = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    if (didFitRef.current) return;
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.2));
    didFitRef.current = true;
  }, [enabled, points, map]);
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

const CLUSTER_THRESHOLD = 12; // enable clustering per day when markers exceed this

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

function useDayLatLngs(groups: Map<number, MapPoint[]>) {
  return useMemo(() => {
    const map = new Map<number, [number, number][]>();
    for (const [day, arr] of groups) {
      map.set(
        day,
        arr.map((p) => [p.lat, p.lng] as [number, number])
      );
    }
    return map;
  }, [groups]);
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

// Cache for numbered icons to avoid re-creating on every render
const iconCache = new Map<string, L.Icon | DivIcon>();
function getCachedIcon(number: number | undefined, color: string) {
  const key = number != null ? `${color}-${number}` : "default";
  const existing = iconCache.get(key);
  if (existing) return existing;
  const created = number != null ? (numberIcon(number, color) as unknown as L.Icon) : (DefaultIcon as unknown as L.Icon);
  iconCache.set(key, created);
  return created;
}

function Arrowheads({ positions, color }: { positions: [number, number][]; color: string }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length < 2) return;
    const arrows: L.Marker[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const [lat1, lng1] = positions[i];
      const [lat2, lng2] = positions[i + 1];
      const angle = (Math.atan2(lat2 - lat1, lng2 - lng1) * 180) / Math.PI;
      const icon = L.divIcon({
        className: "trip-arrow",
        html: `<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid ${color};transform: rotate(${-(angle)}deg);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const midLat = (lat1 + lat2) / 2;
      const midLng = (lng1 + lng2) / 2;
      arrows.push(L.marker([midLat, midLng], { icon }));
    }
    const layer = L.layerGroup(arrows).addTo(map);
    return () => {
      layer.removeFrom(map);
    };
  }, [positions, color, map]);
  return null;
}

export default function TripMap({ points, center, height = 600, onExitFullscreen }: { points: MapPoint[]; center?: { lat: number; lng: number }; height?: number | string; onExitFullscreen?: () => void }) {
  const defaultCenter = center || (points[0] ? { lat: points[0].lat, lng: points[0].lng } : { lat: 20, lng: 0 });
  const centerLatLng: LatLngExpression = [defaultCenter.lat, defaultCenter.lng];
  const groups = useGroupedByDay(points);
  const dayLatLngs = useDayLatLngs(groups);

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

  const daylessPoints = useMemo(() => filteredPoints.filter((p) => p.dayIndex == null), [filteredPoints]);

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

    return (
  <div className="absolute top-2 right-2 z-[1100] space-y-2 text-sm">
        <div className="bg-white/90 backdrop-blur border rounded shadow-sm p-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-medium">{hasDays ? "Days" : "Map"}</span>
            <div className="flex gap-1">
              {onExitFullscreen && (
                <button
                  type="button"
                  className="px-2 py-1 border rounded bg-white text-red-600 hover:bg-red-50"
                  onClick={onExitFullscreen}
                  title="Exit fullscreen"
                >
                  Exit fullscreen
                </button>
              )}
              {hasDays ? (
                <>
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
                </>
              ) : (
                <button
                  type="button"
                  className="px-2 py-1 border rounded hover:bg-gray-50"
                  onClick={fitAllVisible}
                >
                  Fit
                </button>
              )}
            </div>
          </div>
          {onExitFullscreen && (
            <div className="text-[11px] text-gray-600 mb-1">Press Esc to exit fullscreen</div>
          )}
          {hasDays && (
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
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 relative" style={{ height: containerHeight }}>
      <MapContainer
        center={centerLatLng}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          updateWhenIdle
          updateWhenZooming={false}
          keepBuffer={2}
        />

        {/* Render polylines by day to connect the route order */}
        {Array.from(groups.entries())
          .filter(([day]) => visibleDays.has(day))
          .map(([day]) => {
            const color = DAY_COLORS[day % DAY_COLORS.length];
            const latlngs = dayLatLngs.get(day) ?? [];
            return (
              <React.Fragment key={`day-${day}`}>
                <Polyline positions={latlngs} pathOptions={{ color, weight: 3, opacity: 0.8 }} />
                <Arrowheads positions={latlngs} color={color} />
              </React.Fragment>
            );
          })}

        {/* Render markers with optional per-day clustering */}
        {hasDays ? (
          Array.from(groups.entries())
            .filter(([day]) => visibleDays.has(day))
            .map(([day, arr]) => {
              const useCluster = arr.length > CLUSTER_THRESHOLD;
              const color = DAY_COLORS[day % DAY_COLORS.length];
              return (
                <React.Fragment key={`markers-day-${day}`}>
                  {useCluster ? (
                    <ClusteredMarkers points={arr} color={color} labelDay={day + 1} />
                  ) : (
                    arr.map((p) => {
                      const number = p.order != null ? p.order + 1 : undefined;
                      const icon = getCachedIcon(number, color);
                      return (
                        <Marker position={[p.lat, p.lng]} key={p.id} icon={icon as unknown as L.Icon}>
                          <Popup>
                            <div className="text-sm">
                              <div className="font-medium">{p.name}</div>
                              {p.address && <div className="text-gray-500">{p.address}</div>}
                              <div className="text-xs mt-1" style={{ color }}>
                                Day {day + 1}
                                {number ? ` • Stop ${number}` : ""}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })
                  )}
                </React.Fragment>
              );
            })
        ) : (
          // No days: cluster if many generic points
          (daylessPoints.length > CLUSTER_THRESHOLD ? (
            <ClusteredMarkers points={daylessPoints} color="#2563eb" />
          ) : (
            daylessPoints.map((p) => {
              const color = "#2563eb";
              const number = p.order != null ? p.order + 1 : undefined;
              const icon = getCachedIcon(number, color);
              return (
                <Marker position={[p.lat, p.lng]} key={p.id} icon={icon as unknown as L.Icon}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium">{p.name}</div>
                      {p.address && <div className="text-gray-500">{p.address}</div>}
                    </div>
                  </Popup>
                </Marker>
              );
            })
          ))
        )}

        <FlyToBounds points={points} enabled />
        <Legend />
      </MapContainer>
    </div>
  );
}

type ClusteredMarkersProps = {
  points: MapPoint[];
  color: string;
  labelDay?: number;
};

type ClusterProps = AnyProps & { point?: MapPoint; cluster?: true; cluster_id?: number; point_count?: number };
type ClusterFeature = PointFeature<ClusterProps>;

function ClusteredMarkers({ points, color, labelDay }: ClusteredMarkersProps) {
  const map = useMap();
  const [clusters, setClusters] = useState<
    Array<
      | { type: "cluster"; id: number; lat: number; lng: number; count: number }
      | { type: "point"; point: MapPoint }
    >
  >([]);
  const indexRef = useRef<Supercluster<ClusterProps> | null>(null);

  // (re)build index when points change
  useEffect(() => {
    const features: ClusterFeature[] = points.map((p) => ({
      type: "Feature",
      properties: { point: p },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    }));
    const idx: Supercluster<ClusterProps> = new Supercluster<ClusterProps>({ radius: 60, maxZoom: 18, minPoints: 2 });
    idx.load(features);
    indexRef.current = idx;
    // trigger initial calculation
    const z = map.getZoom();
    const b = map.getBounds();
    const bbox: [number, number, number, number] = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
  const items = idx.getClusters(bbox, Math.round(z)).map((c: ClusterFeature) => {
      // c can be cluster or point
      if (c.properties.cluster) {
        const [lng, lat] = c.geometry.coordinates as [number, number];
        return { type: "cluster" as const, id: (c.properties.cluster_id as number)!, lat, lng, count: (c.properties.point_count as number)! };
      } else {
        return { type: "point" as const, point: c.properties.point as MapPoint };
      }
    });
    setClusters(items);
  }, [points, map]);

  // Recompute on map move/zoom
  useEffect(() => {
    const handle = () => {
      const idx = indexRef.current;
      if (!idx) return;
      const z = map.getZoom();
      const b = map.getBounds();
      const bbox: [number, number, number, number] = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
      const items = idx.getClusters(bbox, Math.round(z)).map((c: ClusterFeature) => {
        if (c.properties.cluster) {
          const [lng, lat] = c.geometry.coordinates as [number, number];
          return { type: "cluster" as const, id: (c.properties.cluster_id as number)!, lat, lng, count: (c.properties.point_count as number)! };
        } else {
          return { type: "point" as const, point: c.properties.point as MapPoint };
        }
      });
      setClusters(items);
    };
    map.on("moveend", handle);
    map.on("zoomend", handle);
    return () => {
      map.off("moveend", handle);
      map.off("zoomend", handle);
    };
  }, [map]);

  const clusterIcon = (count: number) => {
    const size = count >= 50 ? 44 : count >= 20 ? 36 : 30;
    const html = `<div style="background:${color};color:white;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,.3)">${count}</div>`;
    return L.divIcon({ className: "trip-cluster", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  };

  return (
    <>
      {clusters.map((item) => {
        if (item.type === "cluster") {
          return (
            <Marker
              key={`c-${item.id}`}
              position={[item.lat, item.lng]}
              icon={clusterIcon(item.count) as unknown as L.Icon}
              eventHandlers={{
                click: () => {
                  const idx = indexRef.current;
                  if (!idx) return;
                  const expansion = idx.getClusterExpansionZoom(item.id);
                  map.flyTo([item.lat, item.lng], expansion, { duration: 0.4 });
                },
              }}
            />
          );
        }
        const p = item.point;
        const number = p.order != null ? p.order + 1 : undefined;
        const icon = getCachedIcon(number, color);
        return (
          <Marker position={[p.lat, p.lng]} key={p.id} icon={icon as unknown as L.Icon}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{p.name}</div>
                {p.address && <div className="text-gray-500">{p.address}</div>}
                {labelDay != null && (
                  <div className="text-xs mt-1" style={{ color }}>
                    Day {labelDay}
                    {number ? ` • Stop ${number}` : ""}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
