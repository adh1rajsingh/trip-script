"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, trips, tripCollaborators, tripActivity, pendingInvitations } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { triggerCollaboratorUpdate } from "@/lib/pusher";
import { randomBytes } from "crypto";

export async function inviteCollaborator(
  tripId: string,
  email: string,
  role: "editor" | "viewer" = "viewer"
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  // Get the current user
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!currentUser) {
    throw new Error("User not found");
  }

  // Check if current user is owner or has permission
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);

  if (!trip) {
    throw new Error("Trip not found");
  }

  const [existingCollaborator] = await db
    .select()
    .from(tripCollaborators)
    .where(
      and(
        eq(tripCollaborators.tripId, tripId),
        eq(tripCollaborators.userId, currentUser.id)
      )
    )
    .limit(1);

  const isOwner = trip.userId === currentUser.id;
  const canInvite = isOwner || existingCollaborator?.role === "owner" || existingCollaborator?.role === "editor";

  if (!canInvite) {
    throw new Error("You don't have permission to invite collaborators");
  }

  // Find the user to invite by email
  const [invitedUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // If user exists, add them as collaborator
  if (invitedUser) {
    // Check if already a collaborator
    const [existing] = await db
      .select()
      .from(tripCollaborators)
      .where(
        and(
          eq(tripCollaborators.tripId, tripId),
          eq(tripCollaborators.userId, invitedUser.id)
        )
      )
      .limit(1);

    if (existing) {
      throw new Error("User is already a collaborator");
    }

    // Add collaborator
    await db.insert(tripCollaborators).values({
      tripId,
      userId: invitedUser.id,
      role,
      invitedBy: currentUser.id,
      acceptedAt: new Date(), // Auto-accept for existing users
    });

    // Log activity
    await db.insert(tripActivity).values({
      tripId,
      userId: currentUser.id,
      action: "invited_collaborator",
      entityType: "collaborator",
      entityId: invitedUser.id,
      metadata: JSON.stringify({ email, role }),
    });

    // Trigger real-time update
    await triggerCollaboratorUpdate(tripId, {
      type: "collaborator-added",
      collaborator: {
        id: invitedUser.id,
        email: invitedUser.email,
        firstName: invitedUser.firstName,
        lastName: invitedUser.lastName,
        role,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, status: "added" };
  }

  // User doesn't exist yet - create pending invitation
  // Check if pending invitation already exists
  const [existingPending] = await db
    .select()
    .from(pendingInvitations)
    .where(
      and(
        eq(pendingInvitations.tripId, tripId),
        eq(pendingInvitations.email, email)
      )
    )
    .limit(1);

  if (existingPending) {
    throw new Error("Invitation already sent to this email");
  }

  // Generate secure token for invitation
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

  // Create pending invitation
  await db.insert(pendingInvitations).values({
    tripId,
    email,
    role,
    invitedBy: currentUser.id,
    token,
    expiresAt,
  });

  // Log activity
  await db.insert(tripActivity).values({
    tripId,
    userId: currentUser.id,
    action: "invited_collaborator",
    entityType: "collaborator",
    metadata: JSON.stringify({ email, role, pending: true }),
  });

  revalidatePath(`/trips/${tripId}`);
  
  // Return invitation link that user can share
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`;
  
  return { 
    success: true, 
    status: "pending",
    message: `Invitation sent! Share this link with ${email}: ${inviteLink}`,
    inviteLink 
  };
}

export async function removeCollaborator(tripId: string, collaboratorId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!currentUser) {
    throw new Error("User not found");
  }

  // Check permissions
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);

  if (!trip) {
    throw new Error("Trip not found");
  }

  const isOwner = trip.userId === currentUser.id;
  if (!isOwner) {
    throw new Error("Only the trip owner can remove collaborators");
  }

  // Delete collaborator
  await db
    .delete(tripCollaborators)
    .where(eq(tripCollaborators.id, collaboratorId));

  // Log activity
  await db.insert(tripActivity).values({
    tripId,
    userId: currentUser.id,
    action: "removed_collaborator",
    entityType: "collaborator",
    entityId: collaboratorId,
  });

  // Trigger real-time update
  await triggerCollaboratorUpdate(tripId, {
    type: "collaborator-removed",
    collaboratorId,
  });

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}

export async function updateCollaboratorRole(
  tripId: string,
  collaboratorId: string,
  role: "editor" | "viewer"
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!currentUser) {
    throw new Error("User not found");
  }

  // Check permissions
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);

  if (!trip || trip.userId !== currentUser.id) {
    throw new Error("Only the trip owner can update roles");
  }

  // Update role
  await db
    .update(tripCollaborators)
    .set({ role, updatedAt: new Date() })
    .where(eq(tripCollaborators.id, collaboratorId));

  // Log activity
  await db.insert(tripActivity).values({
    tripId,
    userId: currentUser.id,
    action: "updated_collaborator_role",
    entityType: "collaborator",
    entityId: collaboratorId,
    metadata: JSON.stringify({ role }),
  });

  // Trigger real-time update
  await triggerCollaboratorUpdate(tripId, {
    type: "collaborator-role-updated",
    collaboratorId,
    role,
  });

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}

export async function getCollaborators(tripId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const collaborators = await db.query.tripCollaborators.findMany({
    where: eq(tripCollaborators.tripId, tripId),
    with: {
      user: true,
      inviter: true,
    },
  });

  return collaborators;
}

export async function getPendingInvitations(tripId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const pending = await db.query.pendingInvitations.findMany({
    where: eq(pendingInvitations.tripId, tripId),
    with: {
      inviter: true,
    },
  });

  return pending;
}

export async function cancelPendingInvitation(invitationId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  await db.delete(pendingInvitations).where(eq(pendingInvitations.id, invitationId));
  return { success: true };
}

export async function getTripActivity(tripId: string, limit: number = 20) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const activities = await db.query.tripActivity.findMany({
    where: eq(tripActivity.tripId, tripId),
    with: {
      user: true,
    },
    orderBy: (tripActivity, { desc }) => [desc(tripActivity.createdAt)],
    limit,
  });

  return activities;
}

export async function checkUserAccess(tripId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { hasAccess: false, role: null };
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!currentUser) {
    return { hasAccess: false, role: null };
  }

  // Check if owner
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);

  if (trip?.userId === currentUser.id) {
    return { hasAccess: true, role: "owner" as const };
  }

  // Check if collaborator
  const [collaborator] = await db
    .select()
    .from(tripCollaborators)
    .where(
      and(
        eq(tripCollaborators.tripId, tripId),
        eq(tripCollaborators.userId, currentUser.id)
      )
    )
    .limit(1);

  if (collaborator) {
    return { hasAccess: true, role: collaborator.role };
  }

  return { hasAccess: false, role: null };
}
