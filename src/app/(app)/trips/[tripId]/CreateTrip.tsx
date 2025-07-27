"use client";

import ItineraryDate from "@/components/ItineraryDate";
import { trips, itineraryItems } from "@/db/schema";

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
  if (!trip.startDate || !trip.endDate) {
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

  const itineraryDays = getDatesRange(
    new Date(trip.startDate),
    new Date(trip.endDate)
  );

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
      }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {trip.destination}
        </h1>
        <p className="text-lg text-gray-500">Your itinerary awaits ✨</p>
      </div>

      <div className="space-y-8">
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
            />
          );
        })}
      </div>
    </div>
  );
}
