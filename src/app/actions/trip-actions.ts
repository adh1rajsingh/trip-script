"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db"
import { users, trips } from "@/db/schema"
import { eq } from "drizzle-orm";

export async function createTrip(formData: FormData) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/");
  }

  const destination = formData.get("destination") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!destination) {
    throw new Error("Destination is required");
  }

  //find if user in db, and create a trip for that user

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);
      
    if (user.length === 0) {
      throw new Error("user not found in db");
    }

    const [newTrip] = await db.insert(trips).values({
      userId: user[0].id,
      destination,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }).returning(); 
    redirect('/trips/${newTrip.id}'); 
    
  } catch (error) {
    console.error("error in creating trip:", error);
    throw new Error('Failed to create trip');
  }

  
}
