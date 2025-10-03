import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance
export const getPusherClient = () => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });
};

// Helper function to trigger events
export async function triggerTripUpdate(tripId: string, data: Record<string, unknown>) {
  await pusherServer.trigger(`trip-${tripId}`, 'trip-update', data);
}

export async function triggerUserPresence(tripId: string, data: Record<string, unknown>) {
  await pusherServer.trigger(`trip-${tripId}`, 'user-presence', data);
}

export async function triggerCollaboratorUpdate(tripId: string, data: Record<string, unknown>) {
  await pusherServer.trigger(`trip-${tripId}`, 'collaborator-update', data);
}
