import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import ClientTripMap from "./ClientTripMap";

export default async function PublicTripPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  const tripData = await db.query.trips.findFirst({
    where: eq(trips.shareId, shareId),
    with: {
      itineraryItems: {
        orderBy: (it, { asc }) => [asc(it.date), asc(it.order)],
      },
    },
  });

  if (!tripData || !tripData.isPublic) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Not available</h1>
        <p className="text-gray-600">This trip is private or does not exist.</p>
      </div>
    )
  }

  const points = tripData.itineraryItems
    .filter((i) => i.latitude != null && i.longitude != null)
    .map((i) => ({ id: i.id, name: i.name, lat: i.latitude as number, lng: i.longitude as number, address: i.address }));

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{tripData.destination}</h1>
        {tripData.startDate && tripData.endDate && (
          <p className="text-gray-600">
            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(tripData.startDate))}
            {" – "}
            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(tripData.endDate))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-6">
          {tripData.itineraryItems.map((it) => (
            <div key={it.id} className="bg-white border rounded-lg p-4">
              <div className="font-semibold">{it.name}</div>
              {it.description && <div className="text-gray-600 text-sm">{it.description}</div>}
              <div className="text-xs text-gray-500 mt-1">{new Date(it.date).toDateString()}</div>
            </div>
          ))}
        </div>
        <div className="md:col-span-2">
          <ClientTripMap points={points} />
        </div>
      </div>
    </div>
  );
}
