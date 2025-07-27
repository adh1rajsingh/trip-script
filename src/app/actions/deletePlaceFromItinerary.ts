"use server";

import { db } from "@/db";
import { itineraryItems, trips, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface DeletePlaceFromItineraryParams {
  placeId: string;
  tripId: string;
}
interface DeletePlaceResult {
  success: boolean;
  error?: string;
}
//we check user
// fetch user and check if the trip is wioght
//verify if th eplacve exists and belongs to the trip
// del;et ethe itinereart it em

export async function deletePlaceFromItinerary({
  placeId,
  tripId,
}: DeletePlaceFromItineraryParams): Promise<DeletePlaceResult> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/");
  }

  if (!placeId || !tripId) {
    return {
      success: false,
      error: "Place ID and Trip ID are required",
    };
  }

  try {
    //user in db
    // trip belongs to user?
    // place belongs to trip?
    //delete the item

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);
    if (user.length === 0) {
      return {
        success: false,
        error: "User not found in database",
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
        error: "No Auth: Trip doesnt belong to user",
      };
    }

    const place = await db
      .select()
      .from(itineraryItems)
      .where(
        and(eq(itineraryItems.id, placeId), eq(itineraryItems.tripId, tripId))
      )
      .limit(1);

    if (place.length === 0) {
      return {
        success: false,
        error: "Place not found or doesnt belong to the trip",
      };
    }

    await db.delete(itineraryItems).where(eq(itineraryItems.id, placeId));

    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/trips");

    return {
      success: true,
    };
  } catch (error) {
    console.error("error deleting the place", error);

    return {
      success: false,
      error: "Failed to delete the place fromt the itinerary",
    };
  }
}
