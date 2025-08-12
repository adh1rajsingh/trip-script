import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import CreateTrip from "./CreateTrip";

interface TripPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params;

  const tripData = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    with: {
      itineraryItems: {
        orderBy: (itineraryItems, { asc }) => [asc(itineraryItems.date), asc(itineraryItems.order)],
      },
  dailyBudgets: true,
    },
  });

  if (!tripData) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Trip Not Found</h1>
        <p className="text-gray-600">Sorry, the trip you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  return <CreateTrip trip={tripData} />;
}
