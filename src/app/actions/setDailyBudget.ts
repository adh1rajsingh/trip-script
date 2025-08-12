"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, trips, dailyBudgets } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function setDailyBudget({ tripId, date, amountCents, currency = "USD" }: { tripId: string; date: Date; amountCents: number; currency?: string }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");
  if (!tripId || !date) return { success: false, error: "Missing trip/date" };
  if (!Number.isFinite(amountCents) || amountCents < 0) return { success: false, error: "Invalid amount" };

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
  if (!user) return { success: false, error: "User not found" };
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (!trip || trip.userId !== user.id) return { success: false, error: "Unauthorized or missing trip" };

  // Upsert daily budget (normalize to day start)
  const isoDay = new Date(date);
  isoDay.setHours(0, 0, 0, 0);
  const existing = await db
    .select()
    .from(dailyBudgets)
    .where(and(eq(dailyBudgets.tripId, tripId), eq(dailyBudgets.date, isoDay)))
    .limit(1);

  if (existing.length) {
    await db.update(dailyBudgets).set({ amountCents, currency }).where(eq(dailyBudgets.id, existing[0].id));
  } else {
    await db.insert(dailyBudgets).values({ tripId, date: isoDay, amountCents, currency });
  }

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
