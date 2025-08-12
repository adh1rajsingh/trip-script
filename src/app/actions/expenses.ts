"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { expenses as expensesTable, trips, users, currencyRates } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type ExpenseInput = {
  tripId: string;
  itineraryItemId?: string | null;
  date: Date;
  amountCents: number;
  currency: string;
  category: string;
  note?: string | null;
  receiptUrl?: string | null;
};

export async function addExpense(input: ExpenseInput) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  if (!input.tripId || !input.date || !input.currency || !input.category) {
    return { success: false, error: "Missing required fields" } as const;
  }

  const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (user.length === 0) return { success: false, error: "User not found" } as const;

  const trip = await db.select().from(trips).where(eq(trips.id, input.tripId)).limit(1);
  if (trip.length === 0) return { success: false, error: "Trip not found" } as const;
  if (trip[0].userId !== user[0].id) return { success: false, error: "Unauthorized" } as const;

  const [created] = await db.insert(expensesTable).values({
    tripId: input.tripId,
    itineraryItemId: input.itineraryItemId ?? null,
    date: input.date,
    amountCents: Math.max(0, Math.round(input.amountCents)),
    currency: input.currency,
    category: input.category,
    note: input.note ?? null,
    receiptUrl: input.receiptUrl ?? null,
  }).returning();

  revalidatePath(`/trips/${input.tripId}`);
  return { success: true, expense: created } as const;
}

export async function deleteExpense({ expenseId, tripId }: { expenseId: string; tripId: string }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  if (!expenseId || !tripId) return { success: false, error: "Missing IDs" } as const;

  const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (user.length === 0) return { success: false, error: "User not found" } as const;
  const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (trip.length === 0) return { success: false, error: "Trip not found" } as const;
  if (trip[0].userId !== user[0].id) return { success: false, error: "Unauthorized" } as const;

  await db.delete(expensesTable).where(and(eq(expensesTable.id, expenseId), eq(expensesTable.tripId, tripId)));
  revalidatePath(`/trips/${tripId}`);
  return { success: true } as const;
}

export async function setCurrencyRate({ tripId, currency, rateToBase }: { tripId: string; currency: string; rateToBase: number }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  if (!tripId || !currency) return { success: false, error: "Missing fields" } as const;

  const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (user.length === 0) return { success: false, error: "User not found" } as const;
  const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (trip.length === 0) return { success: false, error: "Trip not found" } as const;
  if (trip[0].userId !== user[0].id) return { success: false, error: "Unauthorized" } as const;

  // Upsert rate
  const existing = await db.select().from(currencyRates).where(and(eq(currencyRates.tripId, tripId), eq(currencyRates.currency, currency))).limit(1);
  if (existing.length > 0) {
    await db
      .update(currencyRates)
      .set({ rateToBase: rateToBase })
      .where(and(eq(currencyRates.tripId, tripId), eq(currencyRates.currency, currency)));
  } else {
    await db.insert(currencyRates).values({ tripId, currency, rateToBase });
  }
  revalidatePath(`/trips/${tripId}`);
  return { success: true } as const;
}
