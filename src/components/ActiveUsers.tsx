"use client";

import { Eye } from "lucide-react";

interface ActiveUser {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
}

interface ActiveUsersProps {
  users: ActiveUser[];
}

export default function ActiveUsers({ users }: ActiveUsersProps) {
  const getInitials = (user: ActiveUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getName = (user: ActiveUser) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return fullName || user.email;
  };

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Eye className="w-4 h-4 text-gray-500" />
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="relative group"
            title={getName(user)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
              {getInitials(user)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {getName(user)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
            +{users.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
