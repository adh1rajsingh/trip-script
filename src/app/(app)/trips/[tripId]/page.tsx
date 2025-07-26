import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import CreateTrip from "./CreateTrip";

interface TripPageProps {
  params: {
    tripId: string;
  };
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params;

  const tripData = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    with: {
      itineraryItems: true,
    },
  });

  if (!tripData) {
    return <h1>Sorry, No Trip not found</h1>;
  }

  return <CreateTrip trip={tripData} />;
}
