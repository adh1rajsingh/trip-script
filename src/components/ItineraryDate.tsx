interface ItineraryDateProps {
  date: Date;
  dayName: string;
  month: string;
  dayNumber: number;
}

const subheading = "A day in Paris";

const places = [
  { id: "1", name: "Eiffel Tower", description: "See the iconic tower." },
  { id: "2", name: "Louvre Museum", description: "Visit the Mona Lisa." },
];

export default function ItineraryDate(props: ItineraryDateProps) {
  return (
    <div className="border-l-4 border-blue-500 pl-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {props.dayName}, {props.month} {props.dayNumber}
        </h3>
        <div className="flex items-center gap-2"></div>
      </div>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Add subheading"
          defaultValue={subheading}
          readOnly
          className="text-gray-500 text-sm bg-transparent border-none outline-none placeholder-gray-400 w-full"
        />
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 hover:bg-red-50 rounded text-red-400"
                title="Delete place"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-gray-400">📍</span>
          <span className="text-gray-500">Add a place</span>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>
    </div>
  );
}
