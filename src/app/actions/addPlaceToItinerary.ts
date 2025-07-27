"use server";

import { db } from "@/db";
import { itineraryItems, trips, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface AddPlaceToItineraryParams {
  tripId: string;
  date: Date;
  name: string;
  description?: string;
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

    if (trip[0].userId != user[0].id) {
      return {
        success: false,
        error: "No Authorization- Trip does not belong to the user",
      };
    }
    const maxOrderResult = await db
      .select({ value: max(itineraryItems.order) })
      .from(itineraryItems)
      .where(
        and(eq(itineraryItems.tripId, tripId), eq(itineraryItems.date, date))
      );

    const maxOrder = maxOrderResult[0].value ?? -1;

    const [newItineraryItem] = await db
      .insert(itineraryItems)
      .values({
        tripId: tripId,
        name: newPlaceName.trim(),
        description: description?.trim() || null,
        date: date,
        order: maxOrder + 1,
      })
      .returning();

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
      placeId: newItineraryItem.id,
    };
  } catch (error) {
    console.error("Error adding place to itinerary", error);
    return {
      success: false,
      error: "Failed to add place to itinerary",
    };
  }
}
