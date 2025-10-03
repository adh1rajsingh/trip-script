"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, trips, itineraryItems, tripActivity } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { triggerTripUpdate } from "@/lib/pusher";

interface AddPlaceToItineraryParams {
  tripId: string;
  date: Date;
  name: string;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

interface AddPlaceResult {
  success: boolean;
  placeId?: string;
  error?: string;
}

export async function addPlaceToItinerary({
  tripId,
  date,
  name: newPlaceName,
  description,
  latitude,
  longitude,
  address,
}: AddPlaceToItineraryParams): Promise<AddPlaceResult> {
  //get the id and check auth
  //validate the input
  //find the user in the db if not error
  //verify ifd the trip belongs to user
  //find the max order of the trips to put in place in db and ui

  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/");
  }

  if (!tripId || !newPlaceName.trim()) {
    return {
      success: false,
      error: "Trip id and place is required",
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
        error: "User not found in db",
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
        error: "Trip not found in db",
      };
    }

    if (trip[0].userId !== user[0].id) {
      return {
        success: false,
        error: "No Authorization- Trip does not belong to the user",
      };
    }

    const existingItems = await db
      .select()
      .from(itineraryItems)
      .where(eq(itineraryItems.tripId, tripId));

    const maxOrder = existingItems
      .filter((item) => {
        const itemDate = new Date(item.date);
        const targetDate = new Date(date);
        return itemDate.toDateString() === targetDate.toDateString();
      })
      .reduce((max, item) => Math.max(max, item.order), 0);

    const [newItineraryItem] = await db
      .insert(itineraryItems)
      .values({
        tripId: tripId,
        name: newPlaceName.trim(),
        description: description?.trim() || null,
        date: date,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        address: address ?? null,
        order: maxOrder + 1,
      })
      .returning();

    // Log activity
    await db.insert(tripActivity).values({
      tripId,
      userId: user[0].id,
      action: "added_item",
      entityType: "itinerary_item",
      entityId: newItineraryItem.id,
      metadata: JSON.stringify({ name: newPlaceName }),
    });

    // Trigger real-time update
    await triggerTripUpdate(tripId, {
      type: "itinerary-item-added",
      item: newItineraryItem,
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/trips");

    return {
      success: true,
      placeId: newItineraryItem.id,
    };
  } catch (error) {
    console.error("Error adding place to itinerary:", error);
    return {
      success: false,
      error: "Failed to add place to itinerary",
    };
  }
}
