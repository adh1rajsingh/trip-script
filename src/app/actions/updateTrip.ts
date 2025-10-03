"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { trips, users, tripActivity } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { triggerTripUpdate } from "@/lib/pusher";

interface UpdateTripParams {
  tripId: string;
  destination?: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface UpdateTripResult {
  success: boolean;
  error?: string;
}

export async function updateTrip({ tripId, destination, startDate, endDate }: UpdateTripParams): Promise<UpdateTripResult> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/");
  }

  if (!tripId) {
    return { success: false, error: "Trip ID is required" };
  }

  try {
    // Verify user exists
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
    if (user.length === 0) {
      return { success: false, error: "User not found" };
    }

    // Verify trip ownership
    const tripRow = await db.select().from(trips).where(and(eq(trips.id, tripId), eq(trips.userId, user[0].id))).limit(1);
    if (tripRow.length === 0) {
      return { success: false, error: "Trip not found or unauthorized" };
    }

    // Validate dates
    let start: Date | null | undefined = undefined;
    let end: Date | null | undefined = undefined;

    if (typeof startDate !== "undefined") {
      start = startDate ? new Date(startDate) : null;
    }
    if (typeof endDate !== "undefined") {
      end = endDate ? new Date(endDate) : null;
    }
    if (start && end && end < start) {
      return { success: false, error: "End date cannot be before start date" };
    }

    const updateValues: Partial<typeof trips.$inferInsert> = {};
    updateValues.updatedAt = new Date();
    if (typeof destination !== "undefined" && destination !== null) {
      updateValues.destination = destination.trim();
    }
    if (typeof start !== "undefined") {
      updateValues.startDate = start;
    }
    if (typeof end !== "undefined") {
      updateValues.endDate = end;
    }

    if (Object.keys(updateValues).length === 0) {
      return { success: true };
    }

    await db.update(trips).set(updateValues).where(eq(trips.id, tripId));

    // Log activity
    await db.insert(tripActivity).values({
      tripId,
      userId: user[0].id,
      action: "updated",
      entityType: "trip",
      entityId: tripId,
      metadata: JSON.stringify({ destination, startDate, endDate }),
    });

    // Trigger real-time update
    await triggerTripUpdate(tripId, {
      type: "trip-updated",
      updates: updateValues,
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/trips");

    return { success: true };
  } catch (err) {
    console.error("Error updating trip:", err);
    return { success: false, error: "Failed to update trip" };
  }
}
