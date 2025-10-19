"use client";

export default function OrganizationsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold text-red-600">Failed to load organizations</h2>
      <p className="text-gray-500">{error.message}</p>
      <button
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
