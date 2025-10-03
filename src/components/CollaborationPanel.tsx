"use client";

import { useState } from "react";
import { Users, UserPlus, X } from "lucide-react";
import CollaboratorsList from "@/components/CollaboratorsList";
import InviteCollaboratorModal from "@/components/InviteCollaboratorModal";
import ActivityFeed from "@/components/ActivityFeed";
import ActiveUsers from "@/components/ActiveUsers";
import { useRealtimeCollaboration } from "@/hooks/useRealtimeCollaboration";

interface Collaborator {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  inviter: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  invitedAt: Date;
}

interface Activity {
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

interface CollaborationPanelProps {
  tripId: string;
  collaborators: Collaborator[];
  activities: Activity[];
  isOwner: boolean;
  currentUserId: string;
}

export default function CollaborationPanel({
  tripId,
  collaborators,
  activities,
  isOwner,
  currentUserId,
}: CollaborationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { activeUsers } = useRealtimeCollaboration(tripId);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center gap-2"
          title="Collaboration"
        >
          <Users className="w-6 h-6" />
          {activeUsers.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center font-semibold border-2 border-white">
              {activeUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">Collaboration</h2>
                <p className="text-sm text-blue-100">
                  {collaborators.length} {collaborators.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Active Users */}
          {activeUsers.length > 0 && (
            <div className="p-4 bg-green-50 border-b border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">Currently active</span>
                <ActiveUsers users={activeUsers} />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Invite Button */}
            {(isOwner || collaborators.find(c => c.user.id === currentUserId)?.role === 'editor') && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <UserPlus className="w-5 h-5" />
                Invite Collaborator
              </button>
            )}

            {/* Collaborators List */}
            <CollaboratorsList
              tripId={tripId}
              collaborators={collaborators}
              isOwner={isOwner}
              currentUserId={currentUserId}
            />

            {/* Activity Feed */}
            <div className="pt-6 border-t border-gray-200">
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Invite Modal */}
      <InviteCollaboratorModal
        tripId={tripId}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </>
  );
}
