import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import TripCard from "@/components/TripCard";
import { Plus, Compass } from "lucide-react";

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

  // User doesn't exist yet
  if (user.length === 0) {
    return (
      <main className="min-h-screen section-spacing-sm">
        <div className="container">
          <div className="vertical-rhythm-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-h1">Your Trips</h1>
              <Link href="/trips/newtrip" className="btn-primary">
                <Plus className="w-4 h-4" />
                Plan New Trip
              </Link>
            </div>

            <div className="text-center py-24">
              <div className="mb-8">
                <Compass className="w-16 h-16 mx-auto" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <h2 className="text-h2 mb-4">Welcome to TripScript!</h2>
              <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                Ready to start your journey? Create your first trip and begin planning your next adventure.
              </p>
              <Link href="/trips/newtrip" className="btn-primary" style={{ 
                padding: 'var(--space-4) var(--space-8)',
                fontSize: 'var(--text-lg)'
              }}>
                <Plus className="w-5 h-5" />
                Create Your First Trip
              </Link>
            </div>
          </div>
        </div>
      </main>
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
      <main className="min-h-screen section-spacing-sm">
        <div className="container">
          <div className="vertical-rhythm-lg">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-h1 mb-2">Your Trips</h1>
                <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  {userTrips.length === 0 
                    ? "Ready to plan your first adventure?" 
                    : `${userTrips.length} trip${userTrips.length === 1 ? '' : 's'} planned`
                  }
                </p>
              </div>
              <Link href="/trips/newtrip" className="btn-primary">
                <Plus className="w-4 h-4" />
                Plan New Trip
              </Link>
            </div>

            {userTrips.length === 0 ? (
              <div className="text-center py-24">
                <div className="mb-8">
                  <Compass className="w-16 h-16 mx-auto" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <h2 className="text-h2 mb-4">No trips yet</h2>
                <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                  Your adventures begin here. Create your first trip and start building amazing memories.
                </p>
                <Link href="/trips/newtrip" className="btn-primary" style={{ 
                  padding: 'var(--space-4) var(--space-8)',
                  fontSize: 'var(--text-lg)'
                }}>
                  <Plus className="w-5 h-5" />
                  Create Your First Trip
                </Link>
              </div>
            ) : (
              <div className="grid-responsive">
                {userTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching trips:", error);
    return (
      <main className="min-h-screen section-spacing-sm">
        <div className="container text-center">
          <div className="vertical-rhythm">
            <h1 className="text-h2" style={{ color: 'var(--color-error)' }}>
              Error loading trips
            </h1>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              We&apos;re having trouble loading your trips. Please refresh the page or try again later.
            </p>
            <Link href="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }
}