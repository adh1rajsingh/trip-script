"use client";

import ItineraryDate from "@/components/ItineraryDate";
import dynamic from "next/dynamic";
// Removed type import from TripMap to avoid loading Leaflet on server
import { trips, itineraryItems } from "@/db/schema";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { updateTrip } from "@/app/actions/updateTrip";
import { toggleShareTrip } from "@/app/actions/toggleShare";
import { useToast } from "@/components/ui/toast";
import CollaborationPanel from "@/components/CollaborationPanel";

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  dayIndex?: number;
  order?: number;
};

interface CreateTripProps {
  trip: typeof trips.$inferSelect & {
  itineraryItems: (typeof itineraryItems.$inferSelect)[];
  };
  collaborators: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
    inviter: {
      email: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
    invitedAt: Date;
  }>;
  activities: Array<{
    id: string;
    action: string;
    entityType: string | null;
    metadata: string | null;
    createdAt: Date;
    user: {
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  }>;
  isOwner: boolean;
  currentUserId: string;
  userRole: "owner" | "editor" | "viewer" | null;
}

function getDatesRange(startDate: Date, endDate: Date): Date[] {
  const dates = [];

  const currentDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export default function CreateTrip({ trip, collaborators, activities, isOwner, currentUserId, userRole }: CreateTripProps) {
  const hasDates = Boolean(trip.startDate && trip.endDate);
  const { showToast } = useToast();
  const [isSaving, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const canEdit = userRole === "owner" || userRole === "editor";
  const [form, setForm] = useState({
    destination: trip.destination,
    startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : "",
    endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : "",
  });
  const [sharing, startShareTransition] = useTransition();
  const [isPublic, setIsPublic] = useState<boolean>(trip.isPublic ?? false);
  const [shareUrl, setShareUrl] = useState<string | null>(trip.isPublic && trip.shareId ? `/share/${trip.shareId}` : null);
  const [mapWide, setMapWide] = useState<boolean>(false);
  const [mapFullscreen, setMapFullscreen] = useState<boolean>(false);

  // Load persisted map width preference
  useEffect(() => {
    try {
      const raw = localStorage.getItem("trip.mapWide");
      if (raw) setMapWide(raw === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("trip.mapWide", mapWide ? "1" : "0");
    } catch {}
  }, [mapWide]);

  // Close fullscreen on Escape and lock body scroll while active
  useEffect(() => {
    if (!mapFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMapFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mapFullscreen]);

  const onSaveTripMeta = () => {
    startTransition(async () => {
      const res = await updateTrip({
        tripId: trip.id,
        destination: form.destination,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      });
      if (res.success) {
        showToast({ title: "Trip updated", variant: "success" });
        setEditing(false);
      } else {
        showToast({ title: "Failed to update trip", description: res.error, variant: "error" });
      }
    });
  };

  const onToggleShare = (next: boolean) => {
    startShareTransition(async () => {
      const res = await toggleShareTrip({ tripId: trip.id, makePublic: next });
      if (res.success) {
        setIsPublic(res.isPublic ?? false);
        setShareUrl(res.shareUrl ?? null);
        showToast({ title: next ? "Trip is public" : "Trip is private", variant: "success" });
      } else {
        showToast({ title: "Failed to update sharing", description: res.error, variant: "error" });
      }
    });
  };

  const itineraryDays = useMemo(() => (
    hasDates ? getDatesRange(new Date(trip.startDate!), new Date(trip.endDate!)) : []
  ), [hasDates, trip.startDate, trip.endDate]);

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });



  const getPlacesForDate = (date: Date) => {
    return trip.itineraryItems
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === date.toDateString();
      })
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        address: item.address ?? null,
      }));
  };

  const initialMapPoints: MapPoint[] = useMemo(() => {
    // Build a mapping from ISO date -> dayIndex
    const dayMap = new Map<string, number>();
    if (hasDates) {
      const days = getDatesRange(new Date(trip.startDate!), new Date(trip.endDate!));
      days.forEach((d, idx) => dayMap.set(d.toDateString(), idx));
    }
    return trip.itineraryItems
      .filter((i) => i.latitude != null && i.longitude != null)
      .map((i) => {
        const d = new Date(i.date);
        const dayIndex = dayMap.get(d.toDateString());
        return {
          id: i.id,
          name: i.name,
          lat: i.latitude as number,
          lng: i.longitude as number,
          address: i.address,
          dayIndex: dayIndex,
          order: i.order ?? undefined,
        } as MapPoint;
      });
  }, [trip.itineraryItems, hasDates, trip.startDate, trip.endDate]);

  const [points, setPoints] = useState<MapPoint[]>(initialMapPoints);

  const handlePlaceAddedToMap = (p: { id: string; name: string; latitude?: number | null; longitude?: number | null; address?: string | null; date?: Date | string; order?: number; }) => {
    if (p.latitude != null && p.longitude != null) {
      let dayIndex: number | undefined = undefined;
      if (hasDates && p.date) {
        const days = getDatesRange(new Date(trip.startDate!), new Date(trip.endDate!));
        const d = new Date(p.date);
        const idx = days.findIndex((day) => day.toDateString() === d.toDateString());
        if (idx !== -1) dayIndex = idx;
      }
      setPoints((prev) => [
        ...prev,
        {
          id: p.id,
          name: p.name,
          lat: p.latitude!,
          lng: p.longitude!,
          address: p.address ?? undefined,
          dayIndex,
          order: p.order,
        },
      ]);
    }
  };

  const handlePlaceDeletedFromMap = (placeId: string) => {
    setPoints((prev) => prev.filter((pt) => pt.id !== placeId));
  };

  // When a day's order changes (drag/optimize), update that day's point orders so the map updates
  const handleReorderForDate = (date: Date, orderedIds: string[]) => {
    // Find the 0-based day index for this date
    const dayIdx = itineraryDays.findIndex((d) => d.toDateString() === new Date(date).toDateString());
    if (dayIdx === -1) return;

    setPoints((prev) => {
      // Keep only ids that correspond to geo points on this day
      const dayGeoIds = orderedIds.filter((id) => prev.some((p) => p.id === id && p.dayIndex === dayIdx));
      const pos = new Map<string, number>(dayGeoIds.map((id, i) => [id, i]));
      let changed = false;
      const next = prev.map((p) => {
        if (p.dayIndex !== dayIdx) return p;
        const newOrder = pos.get(p.id);
        if (newOrder == null) return p;
        if (p.order === newOrder) return p;
        changed = true;
        return { ...p, order: newOrder };
      });
      return changed ? next : prev;
    });
  };

  // Try to guess center from destination (fallback)
  const mapCenter = points[0] ? { lat: points[0].lat, lng: points[0].lng } : undefined;

  if (!hasDates) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {trip.destination}
        </h1>
        <p className="text-gray-600">
          Please set a start and end date to build your itinerary.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
  <div className="mb-6">
        {editing ? (
          <div className="bg-white border rounded-lg p-4 flex flex-col gap-3">
            <input
              value={form.destination}
              onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
              className="text-2xl font-bold text-gray-900 outline-none"
            />
            <div className="flex gap-3 items-center">
              <label className="text-sm text-gray-600">Start</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="border rounded px-2 py-1"
              />
              <label className="text-sm text-gray-600">End</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="border rounded px-2 py-1"
              />
              <div className="ml-auto flex gap-2">
                <button onClick={() => setEditing(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={onSaveTripMeta} disabled={isSaving} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {trip.destination}
            </h1>
            {canEdit && (
              <button onClick={() => setEditing(true)} className="text-sm px-3 py-2 rounded border">Edit</button>
            )}
          </div>
        )}
        {!editing && <p className="text-lg text-gray-500">Your itinerary awaits ✨</p>}

        <div className="mt-3 flex items-center gap-3">
          {canEdit && (
            <>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPublic} onChange={(e) => onToggleShare(e.target.checked)} disabled={sharing} />
                Share publicly
              </label>
              {isPublic && shareUrl && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${shareUrl}`);
                    showToast({ title: "Link copied", variant: "success" });
                  }}
                  className="text-sm px-3 py-1 rounded border"
                >
                  Copy link
                </button>
              )}
            </>
          )}
          {!canEdit && userRole === "viewer" && (
            <span className="text-sm text-gray-500 italic">You have view-only access</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMapWide((v) => !v)}
              className="text-sm px-3 py-1 rounded border"
              title={mapWide ? "Reduce map width" : "Expand map width"}
            >
              {mapWide ? "Shrink map" : "Expand map"}
            </button>
            <button
              type="button"
              onClick={() => setMapFullscreen(true)}
              className="text-sm px-3 py-1 rounded border"
              title="Open map fullscreen"
            >
              Fullscreen
            </button>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-6 gap-8 items-start`}>
        <div className={`${mapWide ? "md:col-span-2" : "md:col-span-3"} space-y-8`}>
          {itineraryDays.map((date) => {
            const [dayName, monthAndDay] = dateFormatter.format(date).split(", ");
            const [month, dayNumberStr] = monthAndDay.split(" ");

            return (
              <div key={date.toISOString()} className="space-y-3">
                <ItineraryDate
                  tripId={trip.id}
                  date={date}
                  dayName={dayName}
                  month={month}
                  dayNumber={parseInt(dayNumberStr)}
                  initialPlaces={getPlacesForDate(date)}
                  onPlaceAdded={handlePlaceAddedToMap}
                  onPlaceDeleted={handlePlaceDeletedFromMap}
                  onReorder={(ids) => handleReorderForDate(date, ids)}
                />
              </div>
            );
          })}
        </div>

        {!mapFullscreen && (
          <div className={`${mapWide ? "md:col-span-4" : "md:col-span-3"} md:sticky md:top-20 md:self-start`}>
            <LazyMount>
              <TripMap points={points} center={mapCenter} height="calc(100vh - 5rem)" />
            </LazyMount>
          </div>
        )}
      </div>

      {mapFullscreen && (
        <div className="fixed inset-0 z-50 bg-white" role="dialog" aria-modal="true">
          <div className="absolute top-3 right-3 flex gap-2 z-[1100]">
            <button
              type="button"
              onClick={() => setMapFullscreen(false)}
              className="px-3 py-2 rounded border bg-white shadow"
              title="Exit fullscreen (Esc)"
            >
              Exit fullscreen
            </button>
          </div>
          <div
            className="absolute bottom-4 right-4 text-xs text-gray-700 bg-white/80 backdrop-blur px-2 py-1 rounded shadow-sm select-none z-[1100]"
            aria-hidden="true"
          >
            Press Esc to exit fullscreen
          </div>
          <div className="absolute bottom-4 left-4 z-[1100]">
            <button
              type="button"
              onClick={() => setMapFullscreen(false)}
              className="px-4 py-2 rounded-full border bg-white/90 backdrop-blur shadow text-sm"
              title="Exit fullscreen"
            >
              Exit fullscreen
            </button>
          </div>
          <TripMap
            points={points}
            center={mapCenter}
            height="100vh"
            onExitFullscreen={() => setMapFullscreen(false)}
          />
        </div>
      )}

      {/* Collaboration Panel */}
      <CollaborationPanel
        tripId={trip.id}
        collaborators={collaborators}
        activities={activities}
        isOwner={isOwner}
        currentUserId={currentUserId}
      />
    </div>
  );
}

function LazyMount({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <div ref={ref} style={{ minHeight: "300px" }}>
      {visible ? (
        children
      ) : (
        <div className="w-full h-[60vh] rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
      )}
    </div>
  );
}
