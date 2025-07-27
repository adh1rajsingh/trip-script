"use server";

import { db } from "@/db";
import { trips, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface DeleteTripParams {
  tripId: string;
}

interface DeleteTripResult {
  success: boolean;
  error?: string;
}

export async function deleteTrip({
  tripId,
}: DeleteTripParams): Promise<DeleteTripResult> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/");
  }

  if (!tripId) {
    return {
      success: false,
      error: "Trip id is required",
    };
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      return {
        success: false,
        error: "user not found in database",
      };
    }

    const trip = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (trip.length === 0) {
      return {
        success: false,
        error: "Trip not found",
      };
    }

    if (trip[0].userId !== user[0].id) {
      return {
        success: false,
        error: "No Auth: Trip doesn't belong to user",
      };
    }

    await db.delete(trips).where(eq(trips.id, tripId));

    revalidatePath("/trips");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting trip:", error);

    return {
      success: false,
      error: "Failed to delete the trip",
    };
  }
}