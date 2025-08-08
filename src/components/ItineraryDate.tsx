"use client";

import { useState } from "react";
import { addPlaceToItinerary } from "@/app/actions/addPlaceToItinerary";
import { deletePlaceFromItinerary } from "@/app/actions/deletePlaceFromItinerary";
import { Trash2, MapPin } from "lucide-react";


interface ItineraryDateProps {
  tripId: string;
  date: Date;
  dayName: string;
  month: string;
  dayNumber: number;
  initialPlaces?: Place[];
  onPlaceAdded?: (place: Place) => void;
  onPlaceDeleted?: (placeId: string) => void;
}

interface Place {
  id: string;
  name: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

export default function ItineraryDate({
  tripId,
  date,
  dayName,
  month,
  dayNumber,
  initialPlaces = [],
  onPlaceAdded,
  onPlaceDeleted,
}: ItineraryDateProps) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceDescription, setNewPlaceDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [picked, setPicked] = useState<{ lat: number; lon: number; address: string } | null>(null);

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Prefer picked coords if available
      let lat: number | undefined;
      let lon: number | undefined;
      let address: string | undefined;

      if (picked) {
        lat = picked.lat;
        lon = picked.lon;
        address = picked.address;
      } else {
        const coordsMatch = /\|(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.exec(newPlaceName);
        if (coordsMatch) {
          lat = parseFloat(coordsMatch[1]);
          lon = parseFloat(coordsMatch[2]);
        }
      }

      const result = await addPlaceToItinerary({
        tripId,
        date,
        name: newPlaceName,
        description: newPlaceDescription || undefined,
        latitude: lat,
        longitude: lon,
        address,
      });

      if (result.success) {
        const newPlace: Place = {
          id: result.placeId!,
          name: newPlaceName.trim(),
          description: newPlaceDescription.trim() || null,
          latitude: lat ?? null,
          longitude: lon ?? null,
          address: address ?? null,
        };

        setPlaces((currentPlaces) => [...currentPlaces, newPlace]);
        onPlaceAdded?.(newPlace);
        setNewPlaceName("");
        setNewPlaceDescription("");
        setIsAddingPlace(false);
        setSearchResults(null);
        setSearchQuery("");
        setPicked(null);
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
        setPlaces((currentPlaces) => currentPlaces.filter((p) => p.id !== placeId));
        onPlaceDeleted?.(placeId);
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

  const searchPlaces = async () => {
    const query = searchQuery.trim() || newPlaceName.trim();
    if (!query) return;
    setIsSearching(true);
    setError(null);
    try {
      // Use Nominatim (OpenStreetMap) for free geocoding. Be mindful of rate limits.
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");

      const res = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent": "TripScript/1.0 (demo)",
        },
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error(e);
      setError("Failed to search places");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePickResult = (r: { display_name: string; lat: string; lon: string }) => {
    setNewPlaceName(r.display_name);
    setPicked({ lat: parseFloat(r.lat), lon: parseFloat(r.lon), address: r.display_name });
    setSearchResults(null);
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
                <Trash2 />)
              }
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
        <form onSubmit={handleAddPlace} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlaceName}
              onChange={(e) => setNewPlaceName(e.target.value)}
              placeholder="Enter place name or pick from search"
              className="flex-1 bg-transparent border-b border-gray-300 outline-none pb-2 focus:border-blue-500"
              autoFocus
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={searchPlaces}
              disabled={isSearching}
              className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded bg-white border hover:bg-gray-50"
            >
              <MapPin className="w-4 h-4" />
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {searchResults && (
            <div className="bg-white border rounded max-h-48 overflow-auto">
              {searchResults.map((r, idx) => (
                <button
                  type="button"
                  key={`${r.display_name}-${idx}`}
                  onClick={() => handlePickResult(r)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  <div className="font-medium text-sm">{r.display_name}</div>
                  <div className="text-xs text-gray-500">
                    {parseFloat(r.lat).toFixed(5)}, {parseFloat(r.lon).toFixed(5)}
                  </div>
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={newPlaceDescription}
            onChange={(e) => setNewPlaceDescription(e.target.value)}
            placeholder="Add description (optional)"
            className="w-full bg-transparent border-b border-gray-300 outline-none pb-2 focus:border-blue-500"
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
                setPicked(null);
                setSearchResults(null);
                setSearchQuery("");
              }}
              className="text-gray-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a place to add (optional)"
              className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={searchPlaces}
              className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50"
            >
              Search
            </button>
          </div>

          {searchResults && (
            <div className="bg-white border rounded max-h-48 overflow-auto">
              {searchResults.map((r, idx) => (
                <button
                  type="button"
                  key={`${r.display_name}-${idx}`}
                  onClick={() => handlePickResult(r)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  <div className="font-medium text-sm">{r.display_name}</div>
                  <div className="text-xs text-gray-500">
                    {parseFloat(r.lat).toFixed(5)}, {parseFloat(r.lon).toFixed(5)}
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsAddingPlace(true)}
            className="w-full bg-gray-50 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors text-gray-500"
          >
            <span>📍</span>
            <span>Add a place</span>
          </button>
        </div>
      )}
    </div>
  );
}
