"use client";

import { useState } from "react";
import { addPlaceToItinerary } from "@/app/actions/addPlaceToItinerary";
import { deletePlaceFromItinerary } from "@/app/actions/deletePlaceFromItinerary";
import { Trash2 } from "lucide-react";


interface ItineraryDateProps {
  tripId: string;
  date: Date;
  dayName: string;
  month: string;
  dayNumber: number;
  initialPlaces?: Place[];
}

interface Place {
  id: string;
  name: string;
  description?: string | null;
}

export default function ItineraryDate({
  tripId,
  date,
  dayName,
  month,
  dayNumber,
  initialPlaces = [],
}: ItineraryDateProps) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceDescription, setNewPlaceDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await addPlaceToItinerary({
        tripId,
        date,
        name: newPlaceName,
        description: newPlaceDescription || undefined,
      });

      if (result.success) {
        const newPlace: Place = {
          id: result.placeId!,
          name: newPlaceName.trim(),
          description: newPlaceDescription.trim() || null,
        };

        setPlaces((currentPlaces) => [...currentPlaces, newPlace]);
        setNewPlaceName("");
        setNewPlaceDescription("");
        setIsAddingPlace(false);
      } else {
        setError(result.error || "Failed to add place");
      }
    } catch (error) {
      console.error("error adding the place", error);
      setError("failed to add place");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    setDeletingPlaceId(placeId);
    setError(null);

    try {
      const result = await deletePlaceFromItinerary({
        placeId,
        tripId,
      });

      if (result.success) {
        setPlaces((currentPlaces) =>
          currentPlaces.filter((p) => p.id !== placeId)
        );
      } else {
        setError(result.error || "Failed to delete place");
      }
    } catch (error) {
      console.error("Error deleting place:", error);
      setError("Failed to delete place");
    } finally {
      setDeletingPlaceId(null);
    }
  };

  return (
    <div className="border-l-4 border-blue-500 pl-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {dayName}, {month} {dayNumber}
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        {places.map((place) => (
          <div
            key={place.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-blue-500">📍</span>
              <div>
                <span className="text-gray-800 font-medium">{place.name}</span>
                {place.description && (
                  <p className="text-gray-500 text-sm">{place.description}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDeletePlace(place.id)}
              disabled={deletingPlaceId === place.id}
              className="p-2 hover:bg-red-50 rounded text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete place"
            >
              {deletingPlaceId === place.id ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 />
              )}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {isAddingPlace ? (
        <form onSubmit={handleAddPlace} className="bg-gray-50 rounded-lg p-4">
          <input
            type="text"
            value={newPlaceName}
            onChange={(e) => setNewPlaceName(e.target.value)}
            placeholder="Enter place name (e.g., Louvre Museum)"
            className="w-full bg-transparent border-b border-gray-300 outline-none pb-2 mb-3 focus:border-blue-500"
            autoFocus
            disabled={isLoading}
          />
          <input
            type="text"
            value={newPlaceDescription}
            onChange={(e) => setNewPlaceDescription(e.target.value)}
            placeholder="Add description (optional)"
            className="w-full bg-transparent border-b border-gray-300 outline-none pb-2 mb-4 focus:border-blue-500"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading || !newPlaceName.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Place"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingPlace(false);
                setNewPlaceName("");
                setNewPlaceDescription("");
                setError(null);
              }}
              className="text-gray-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingPlace(true)}
          className="w-full bg-gray-50 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors text-gray-500"
        >
          <span>📍</span>
          <span>Add a place</span>
        </button>
      )}
    </div>
  );
}
