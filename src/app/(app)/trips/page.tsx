import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import TripCard from "@/components/TripCard";

export default async function TripsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/");
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);
//no trips yet
  if (user.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Your Trips</h1>
            <Link
              href="/trips/newtrip"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Plan New Trip
            </Link>
          </div>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to TripScript!
            </h2>
            <p className="text-gray-500 mb-8">
              Start planning your first adventure!
            </p>
            <Link
              href="/trips/newtrip"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Create Your First Trip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  try {
    const userTrips = await db
      .select({
        id: trips.id,
        userId: trips.userId,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        isPublic: trips.isPublic,
        shareId: trips.shareId,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      })
      .from(trips)
      .where(eq(trips.userId, user[0].id))
      .orderBy(trips.createdAt);

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Your Trips</h1>
            <Link
              href="/trips/newtrip"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Plan New Trip
            </Link>
          </div>

          {userTrips.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                No trips yet
              </h2>
              <p className="text-gray-500 mb-8">
                Start planning your first adventure!
              </p>
              <Link
                href="/trips/newtrip"
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Create Your First Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching trips:", error);
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error loading trips
          </h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }
}