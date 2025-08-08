export default function TripsLoading() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-6 w-1/2 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
