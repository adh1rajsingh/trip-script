"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { trips, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

interface ToggleShareParams {
  tripId: string;
  makePublic: boolean;
}

interface ToggleShareResult {
  success: boolean;
  isPublic?: boolean;
  shareId?: string | null;
  shareUrl?: string | null;
  error?: string;
}

export async function toggleShareTrip({ tripId, makePublic }: ToggleShareParams): Promise<ToggleShareResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");

  if (!tripId) return { success: false, error: "Trip ID required" };

  try {
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
    if (user.length === 0) return { success: false, error: "User not found" };

    const row = await db.select().from(trips).where(and(eq(trips.id, tripId), eq(trips.userId, user[0].id))).limit(1);
    if (row.length === 0) return { success: false, error: "Trip not found or unauthorized" };

    let newShareId: string | null = row[0].shareId ?? null;

    if (makePublic) {
      if (!newShareId) newShareId = uuidv4();
      await db.update(trips).set({ isPublic: true, shareId: newShareId, updatedAt: new Date() }).where(eq(trips.id, tripId));
    } else {
      await db.update(trips).set({ isPublic: false, updatedAt: new Date() }).where(eq(trips.id, tripId));
    }

    revalidatePath(`/trips/${tripId}`);

    const shareUrl = makePublic && newShareId ? `/share/${newShareId}` : null;
    return { success: true, isPublic: makePublic, shareId: newShareId, shareUrl };
  } catch (e) {
    console.error("toggleShareTrip error", e);
    return { success: false, error: "Failed to toggle sharing" };
  }
}
