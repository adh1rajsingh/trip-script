"use client";

import { useState } from "react";
import { Users, Mail, UserMinus, ChevronDown } from "lucide-react";
import {
  removeCollaborator,
  updateCollaboratorRole,
} from "@/app/actions/collaborationActions";

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

interface CollaboratorsListProps {
  tripId: string;
  collaborators: Collaborator[];
  isOwner: boolean;
  currentUserId: string;
}

export default function CollaboratorsList({
  tripId,
  collaborators,
  isOwner,
  currentUserId,
}: CollaboratorsListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedCollaborator, setExpandedCollaborator] = useState<string | null>(null);

  const handleRemove = async (collaboratorId: string) => {
    if (!confirm("Are you sure you want to remove this collaborator?")) {
      return;
    }

    setLoading(collaboratorId);
    try {
      await removeCollaborator(tripId, collaboratorId);
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      alert("Failed to remove collaborator");
    } finally {
      setLoading(null);
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: "editor" | "viewer") => {
    setLoading(collaboratorId);
    try {
      await updateCollaboratorRole(tripId, collaboratorId, newRole);
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role");
    } finally {
      setLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Users className="w-4 h-4" />
        <span>Collaborators ({collaborators.length})</span>
      </div>

      {collaborators.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No collaborators yet</p>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collaborator) => {
            const isCurrentUser = collaborator.user.id === currentUserId;
            const fullName = [collaborator.user.firstName, collaborator.user.lastName]
              .filter(Boolean)
              .join(" ");
            const displayName = fullName || collaborator.user.email;
            const isExpanded = expandedCollaborator === collaborator.id;

            return (
              <div
                key={collaborator.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {getInitials(
                        collaborator.user.firstName,
                        collaborator.user.lastName,
                        collaborator.user.email
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {displayName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{collaborator.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                        collaborator.role
                      )}`}
                    >
                      {collaborator.role}
                    </span>

                    {isOwner && !isCurrentUser && (
                      <button
                        onClick={() =>
                          setExpandedCollaborator(isExpanded ? null : collaborator.id)
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && isOwner && !isCurrentUser && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    <select
                      value={collaborator.role}
                      onChange={(e) =>
                        handleRoleChange(collaborator.id, e.target.value as "editor" | "viewer")
                      }
                      disabled={loading === collaborator.id}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemove(collaborator.id)}
                      disabled={loading === collaborator.id}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <UserMinus className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                )}

                {collaborator.inviter && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Invited by{" "}
                    {[collaborator.inviter.firstName, collaborator.inviter.lastName]
                      .filter(Boolean)
                      .join(" ") || collaborator.inviter.email}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
