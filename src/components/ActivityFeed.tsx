"use client";

import { Activity, MapPin, Users, Pencil, Trash2, Plus } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  entityType: string | null;
  metadata: string | null;
  createdAt: Date;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="w-4 h-4" />;
      case "updated":
        return <Pencil className="w-4 h-4" />;
      case "deleted":
        return <Trash2 className="w-4 h-4" />;
      case "added_item":
        return <MapPin className="w-4 h-4" />;
      case "removed_item":
        return <Trash2 className="w-4 h-4" />;
      case "invited_collaborator":
        return <Users className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const userName =
      [activity.user.firstName, activity.user.lastName].filter(Boolean).join(" ") ||
      activity.user.email;

    switch (activity.action) {
      case "created":
        return `${userName} created the trip`;
      case "updated":
        return `${userName} updated the trip`;
      case "added_item":
        return `${userName} added an item to the itinerary`;
      case "removed_item":
        return `${userName} removed an item from the itinerary`;
      case "invited_collaborator":
        const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
        return `${userName} invited ${metadata.email || "a collaborator"}`;
      case "removed_collaborator":
        return `${userName} removed a collaborator`;
      case "updated_collaborator_role":
        return `${userName} updated a collaborator's role`;
      default:
        return `${userName} performed an action`;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Activity className="w-4 h-4" />
        <span>Recent Activity</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No activity yet</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="p-2 bg-white rounded-full text-gray-600 flex-shrink-0">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{getActivityText(activity)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
