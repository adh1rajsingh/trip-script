"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";

interface CollaboratorPresence {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
}

export function useRealtimeCollaboration(tripId: string) {
  const [activeUsers, setActiveUsers] = useState<CollaboratorPresence[]>([]);
  const router = useRouter();

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`trip-${tripId}`);

    // Listen for trip updates
    channel.bind('trip-update', (data: Record<string, unknown>) => {
      console.log('Trip update received:', data);
      router.refresh();
    });

    // Listen for collaborator updates
    channel.bind('collaborator-update', (data: Record<string, unknown>) => {
      console.log('Collaborator update received:', data);
      router.refresh();
    });

    // Listen for user presence
    channel.bind('user-presence', (data: CollaboratorPresence) => {
      console.log('User presence received:', data);
      setActiveUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        if (data.isActive) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [tripId, router]);

  return { activeUsers };
}
