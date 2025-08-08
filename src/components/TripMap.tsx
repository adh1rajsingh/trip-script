"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { Marker as LeafletMarker, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix default icon paths in Leaflet when bundled
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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

export default function TripMap({ points, center }: { points: MapPoint[]; center?: { lat: number; lng: number } }) {
  const defaultCenter = center || (points[0] ? { lat: points[0].lat, lng: points[0].lng } : { lat: 20, lng: 0 });
  const centerLatLng: LatLngExpression = [defaultCenter.lat, defaultCenter.lng];
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={centerLatLng} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker position={[p.lat, p.lng]} key={p.id}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{p.name}</div>
                {p.address && <div className="text-gray-500">{p.address}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        <FlyToBounds points={points} />
      </MapContainer>
    </div>
  );
}
