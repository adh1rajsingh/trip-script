"use client";

import ItineraryDate from "@/components/ItineraryDate";
import TripMap, { MapPoint } from "@/components/TripMap";
import { trips, itineraryItems } from "@/db/schema";
import { useMemo, useState } from "react";

interface CreateTripProps {
  trip: typeof trips.$inferSelect & {
    itineraryItems: (typeof itineraryItems.$inferSelect)[];
  };
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

export default function CreateTrip({ trip }: CreateTripProps) {
  const hasDates = Boolean(trip.startDate && trip.endDate);

  const itineraryDays = hasDates
    ? getDatesRange(new Date(trip.startDate!), new Date(trip.endDate!))
    : [];

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
    return trip.itineraryItems
      .filter((i) => i.latitude != null && i.longitude != null)
      .map((i) => ({ id: i.id, name: i.name, lat: i.latitude as number, lng: i.longitude as number, address: i.address }));
  }, [trip.itineraryItems]);

  const [points, setPoints] = useState<MapPoint[]>(initialMapPoints);

  const handlePlaceAddedToMap = (p: { id: string; name: string; latitude?: number | null; longitude?: number | null; address?: string | null; }) => {
    if (p.latitude != null && p.longitude != null) {
      setPoints((prev) => [...prev, { id: p.id, name: p.name, lat: p.latitude!, lng: p.longitude!, address: p.address ?? undefined }]);
    }
  };

  const handlePlaceDeletedFromMap = (placeId: string) => {
    setPoints((prev) => prev.filter((pt) => pt.id !== placeId));
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {trip.destination}
        </h1>
        <p className="text-lg text-gray-500">Your itinerary awaits ✨</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-8">
          {itineraryDays.map((date) => {
            const [dayName, monthAndDay] = dateFormatter.format(date).split(", ");
            const [month, dayNumberStr] = monthAndDay.split(" ");

            return (
              <ItineraryDate
                key={date.toISOString()}
                tripId={trip.id}
                date={date}
                dayName={dayName}
                month={month}
                dayNumber={parseInt(dayNumberStr)}
                initialPlaces={getPlacesForDate(date)}
                onPlaceAdded={handlePlaceAddedToMap}
                onPlaceDeleted={handlePlaceDeletedFromMap}
              />
            );
          })}
        </div>

        <div className="md:col-span-2">
          <TripMap points={points} center={mapCenter} />
        </div>
      </div>
    </div>
  );
}
