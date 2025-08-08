"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600 text-sm mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
