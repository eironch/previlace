import React from "react";

export default function AdminSkeleton({ showHeader = false }) {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header Skeleton */}
      {showHeader && (
      <div className="flex items-center justify-between border-b border-gray-300 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="h-10 w-24 rounded bg-gray-200"></div>
      </div>
      )}

      {/* Content Skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
