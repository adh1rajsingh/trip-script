import { db } from "@/db";
import { pendingInvitations, users, tripCollaborators, trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import AcceptInviteClient from "./AcceptInviteClient";

interface AcceptInvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { token } = await params;
  const { userId: clerkUserId } = await auth();

  // Fetch the invitation
  const [invitation] = await db
    .select()
    .from(pendingInvitations)
    .where(eq(pendingInvitations.token, token))
    .limit(1);

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if expired
  if (new Date(invitation.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please ask the trip owner to send you a new invitation.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Get trip details
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, invitation.tripId))
    .limit(1);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Trip Not Found</h1>
          <p className="text-gray-600 mb-6">
            The trip associated with this invitation no longer exists.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // If user is logged in, check if they need to accept
  if (clerkUserId) {
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (currentUser) {
      // Check if invitation email matches user email
      if (currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-2xl font-bold text-yellow-600 mb-4">Email Mismatch</h1>
              <p className="text-gray-600 mb-4">
                This invitation was sent to <strong>{invitation.email}</strong>, but you&apos;re logged in as{" "}
                <strong>{currentUser.email}</strong>.
              </p>
              <p className="text-gray-600 mb-6">
                Please log out and sign in with the invited email address, or ask the trip owner to send
                a new invitation to your current email.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        );
      }

      // Check if already a collaborator
      const [existingCollaborator] = await db
        .select()
        .from(tripCollaborators)
        .where(
          and(
            eq(tripCollaborators.tripId, invitation.tripId),
            eq(tripCollaborators.userId, currentUser.id)
          )
        )
        .limit(1);

      if (existingCollaborator) {
        // Delete the pending invitation
        await db.delete(pendingInvitations).where(eq(pendingInvitations.id, invitation.id));
        
        // Redirect to trip
        redirect(`/trips/${invitation.tripId}`);
      }

      // Auto-accept for logged-in user
      await db.insert(tripCollaborators).values({
        tripId: invitation.tripId,
        userId: currentUser.id,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        acceptedAt: new Date(),
      });

      // Delete the pending invitation
      await db.delete(pendingInvitations).where(eq(pendingInvitations.id, invitation.id));

      // Redirect to trip
      redirect(`/trips/${invitation.tripId}`);
    }
  }

  // User is not logged in - show invitation details
  return (
    <AcceptInviteClient
      email={invitation.email}
      role={invitation.role}
      tripDestination={trip.destination}
      tripId={invitation.tripId}
    />
  );
}
