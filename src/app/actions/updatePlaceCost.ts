"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, trips, itineraryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updatePlaceCost({ tripId, placeId, costCents, currency = "USD" }: { tripId: string; placeId: string; costCents: number | null; currency?: string }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");
  if (!tripId || !placeId) return { success: false, error: "Missing ids" };
  if (costCents != null && (!Number.isFinite(costCents) || costCents < 0)) return { success: false, error: "Invalid cost" };

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
  if (!user) return { success: false, error: "User not found" };
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (!trip || trip.userId !== user.id) return { success: false, error: "Unauthorized or missing trip" };

  const [item] = await db.select().from(itineraryItems).where(eq(itineraryItems.id, placeId)).limit(1);
  if (!item || item.tripId !== tripId) return { success: false, error: "Place not found" };

  await db
    .update(itineraryItems)
    .set({ costCents: costCents ?? null, costCurrency: costCents == null ? null : currency })
    .where(eq(itineraryItems.id, placeId));

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
