"use client"

import Link from "next/link";
import { trips } from "@/db/schema";
import { deleteTrip } from "@/app/actions/deleteTripAction";
import { useState } from "react";
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  MapPin, 
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
      <Link href={`/trips/${trip.id}`} className="focus-ring">
        <article className="card hover-lift cursor-pointer">
          <div className="vertical-rhythm">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--color-accent-light)' }}>
                  <MapPin className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 className="text-h3 line-clamp-1">{trip.destination}</h3>
                  <div className="text-meta">
                    Created {formatDate(trip.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {trip.startDate && trip.endDate
                    ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
                    : "Dates to be planned"}
                </span>
              </div>

              {getDuration() && (
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{getDuration()}</span>
                </div>
              )}
            </div>

            {/* Action Area */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                  View & Edit Trip
                </span>
                <svg className="w-4 h-4" style={{ color: 'var(--color-accent)' }} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </article>
      </Link>

      {/* Options Menu Button */}
      <button
        onClick={handleMenuToggle}
        disabled={isDeleting}
        className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 focus-ring"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border-light)'
        }}
        title="More options"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Menu */}
      {showDeleteMenu && (
        <div className="absolute top-14 right-4 surface-elevated py-2 z-10 min-w-[160px]"
             style={{ border: '1px solid var(--color-border)' }}>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors"
            style={{ color: 'var(--color-error)' }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Trip
          </button>
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
            style={{ 
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent'
            }}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      {/* Backdrop */}
      {showDeleteMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={handleCancel}
        />
      )}
    </div>
  );
}
