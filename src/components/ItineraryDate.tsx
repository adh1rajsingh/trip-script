"use client";

import { useState } from "react";
//import { addPlaceToItinerary, deletePlaceFromItinerary } from "@/actions/itinerary.actions";
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

// seed data to test ui
const subheading = "A day in Paris";

const places = [
  { id: "1", name: "Eiffel Tower", description: "See the iconic tower." },
  { id: "2", name: "Louvre Museum", description: "Visit the Mona Lisa." },
];

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
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    setIsLoading(true);

    //call actions here
    // const result = await addPlaceToItinerary({ tripId, date, name: newPlaceName });

    //for testing
    const newPlaceFromServer: Place = {
      id: Date.now().toString(),
      name: newPlaceName.trim(),
    };

    setPlaces((currentPlaces) => [...currentPlaces, newPlaceFromServer]);
    setNewPlaceName("");
    setIsAddingPlace(false);
    setIsLoading(false);
  };

  const handleDeletePlace = (placeId: string) => {
    //call server action to delete the place
    // await deletePlaceFromItinerary(placeId);
    
    setPlaces(currentPlaces => currentPlaces.filter(p => p.id !== placeId));
  }

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
              <span className="text-gray-800 font-medium">{place.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDeletePlace(place.id)}
              className="p-2 hover:bg-red-50 rounded text-red-400"
              title="Delete place"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {isAddingPlace ? (
        <form onSubmit={handleAddPlace} className="bg-gray-50 rounded-lg p-4">
          <input
            type="text"
            value={newPlaceName}
            onChange={(e) => setNewPlaceName(e.target.value)}
            placeholder="Enter place name (e.g., Louvre Museum)"
            className="w-full bg-transparent border-b border-gray-300 outline-none pb-2 mb-4 focus:border-blue-500"
            autoFocus
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
              onClick={() => setIsAddingPlace(false)}
              className="text-gray-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200"
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