import { db } from "@/db";
import { trips, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import CreateTrip from "./CreateTrip";
import { auth } from "@clerk/nextjs/server";
import { getCollaborators, getTripActivity, checkUserAccess } from "@/app/actions/collaborationActions";

interface TripPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params;
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-600">Please sign in to view this trip.</p>
      </div>
    );
  }

  const tripData = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    with: {
      itineraryItems: {
        orderBy: (itineraryItems, { asc }) => [asc(itineraryItems.date), asc(itineraryItems.order)],
      },
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

  // Check user access
  const { hasAccess, role } = await checkUserAccess(tripId);
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don&apos;t have permission to view this trip.</p>
      </div>
    );
  }

  // Get current user
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  // Get collaborators and activity
  const collaborators = await getCollaborators(tripId);
  const activities = await getTripActivity(tripId, 20);

  const isOwner = role === "owner";

  return (
    <CreateTrip
      trip={tripData}
      collaborators={collaborators}
      activities={activities}
      isOwner={isOwner}
      currentUserId={currentUser?.id || ""}
      userRole={role}
    />
  );
}
