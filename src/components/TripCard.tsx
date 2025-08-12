"use client"

import Link from "next/link";
import { trips } from "@/db/schema";
import { deleteTrip } from "@/app/actions/deleteTripAction";
import { useState } from "react";
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Loader2,
  X 
} from "lucide-react";

type TripSummary = {
  id: string;
  userId: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  isPublic: boolean;
  shareId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface TripCardProps {
  trip: TripSummary | typeof trips.$inferSelect;
}

export default function TripCard({ trip }: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "Date TBD";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getDuration = () => {
    if (!trip.startDate || !trip.endDate) return "";

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteMenu(!showDeleteMenu);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDeleting(true);
    setShowDeleteMenu(false);
    
    try {
      const result = await deleteTrip({ tripId: trip.id });
      
      if (!result.success) {
        alert(result.error || "Failed to delete trip");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteMenu(false);
  };

  return (
    <div className="relative">
      <Link href={`/trips/${trip.id}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white truncate">
              {trip.destination}
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {trip.startDate && trip.endDate
                    ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
                    : "Dates to be planned"}
                </span>
              </div>

              {getDuration() && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{getDuration()}</span>
                </div>
              )}

              <div className="flex items-center text-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-xs">
                  Created {formatDate(trip.createdAt)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 font-medium">
                  View & Edit Trip
                </span>
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={handleMenuToggle}
        disabled={isDeleting}
        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-800 rounded-full transition-all duration-200 shadow-sm"
        title="More options"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>

      {showDeleteMenu && (
        <div className="absolute top-12 right-3 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Trip
          </button>
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      )}

      {showDeleteMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={handleCancel}
        />
      )}
    </div>
  );
}
