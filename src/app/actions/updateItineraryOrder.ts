"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { itineraryItems, users, trips } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface UpdateItineraryOrderParams {
  tripId: string;
  date: string; // ISO date (yyyy-mm-dd)
  placeIdsInOrder: string[];
}

interface UpdateItineraryOrderResult {
  success: boolean;
  error?: string;
}

export async function updateItineraryOrder({ tripId, date, placeIdsInOrder }: UpdateItineraryOrderParams): Promise<UpdateItineraryOrderResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");

  if (!tripId || !date || !placeIdsInOrder?.length) {
    return { success: false, error: "Missing parameters" };
  }

  try {
    // Verify user and trip ownership
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
    if (user.length === 0) return { success: false, error: "User not found" };

    const tripRow = await db.select().from(trips).where(and(eq(trips.id, tripId), eq(trips.userId, user[0].id))).limit(1);
    if (tripRow.length === 0) return { success: false, error: "Trip not found or unauthorized" };

    // Fetch existing items for the date to constrain updates
    const targetDate = new Date(date);
    const existing = await db
      .select()
      .from(itineraryItems)
      .where(and(eq(itineraryItems.tripId, tripId)))

    const sameDayIds = existing
      .filter((it) => new Date(it.date).toDateString() === targetDate.toDateString())
      .map((it) => it.id);

    const validIds = placeIdsInOrder.filter((id) => sameDayIds.includes(id));

    // Apply order updates in sequence
    for (let idx = 0; idx < validIds.length; idx++) {
      const id = validIds[idx];
      await db.update(itineraryItems).set({ order: idx + 1 }).where(eq(itineraryItems.id, id));
    }

    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (e) {
    console.error("Failed to update itinerary order", e);
    return { success: false, error: "Failed to update itinerary order" };
  }
}
