export default function TripLoading() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="h-10 w-1/3 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
              <div className="h-5 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-2">
          <div className="h-[600px] bg-gray-100 border rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
