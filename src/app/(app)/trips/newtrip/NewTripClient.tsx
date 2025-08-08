"use client";

import { useEffect, useRef, useState } from "react";
import { createTrip } from "@/app/actions/tripActions";
import { Calendar, MapPin } from "lucide-react";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function NewTripClient() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // search state
  const [results, setResults] = useState<NominatimResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [picked, setPicked] = useState<{ address: string; lat?: number; lon?: number } | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Debounced search on destination
  useEffect(() => {
    const q = destination.trim();

    // Pause search when a suggestion has been picked until cleared
    if (picked) return;

    if (q.length < 3) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (controllerRef.current) controllerRef.current.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setIsSearching(true);
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", q);
        url.searchParams.set("format", "json");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "5");

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data: NominatimResult[] = await res.json();
        setResults(data);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
          // ignore
        } else {
          console.error(e);
        }
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination, picked]);

  const searchNow = async () => {
    const q = destination.trim();
    if (picked) return;
    if (q.length < 3) {
      setResults(null);
      return;
    }
    try {
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsSearching(true);
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("search failed");
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // ignore
      } else {
        console.error(e);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handlePick = (r: NominatimResult) => {
    setDestination(r.display_name);
    setPicked({ address: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
    setResults(null);
  };

  return (
    <form action={createTrip} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label htmlFor="destination" className="block text-lg font-semibold text-gray-900 mb-2">
          Where to?
        </label>
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              id="destination"
              name="destination"
              required
              placeholder="e.g. Paris, Hawaii, Japan"
              className="w-full text-lg text-gray-700 placeholder-gray-400 border-none outline-none bg-transparent"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Enter should submit the form by default; do not block.
                  // But if user wants to force search instead, uncomment below
                  // e.preventDefault();
                  // void searchNow();
                }
              }}
            />
            <button
              type="button"
              onClick={searchNow}
              disabled={isSearching}
              className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded bg-white border hover:bg-gray-50"
            >
              <MapPin className="w-4 h-4" />
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {picked && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <span className="px-2 py-1 bg-white border rounded">Selected: {picked.address}</span>
              <button type="button" className="underline" onClick={() => setPicked(null)}>
                Clear
              </button>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-white border rounded max-h-56 overflow-auto shadow-sm">
              {results.map((r, idx) => (
                <button
                  key={`${r.display_name}-${idx}`}
                  type="button"
                  onClick={() => handlePick(r)}
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
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates (optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="text-gray-600 border-none outline-none bg-transparent"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="text-gray-600 border-none outline-none bg-transparent"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <button
          type="submit"
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-12 rounded-full text-lg transition-colors duration-200"
        >
          Start planning
        </button>
      </div>
    </form>
  );
}
