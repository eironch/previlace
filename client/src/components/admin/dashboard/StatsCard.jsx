import React from 'react';

export default function StatsCard({ title, value, icon: Icon, change }) {
  function formatChange(changeValue) {
    if (changeValue === 0) return "0%";
    const sign = changeValue > 0 ? "+" : "";
    return `${sign}${changeValue}%`;
  }

  function getChangeColor(changeValue) {
    if (changeValue > 0) return "text-green-600";
    if (changeValue < 0) return "text-red-600";
    return "text-gray-600";
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="rounded-full bg-black p-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${getChangeColor(change)}`}>
          {formatChange(change)}
        </span>
        <span className="ml-2 text-sm text-gray-500">from last month</span>
      </div>
    </div>
  );
}
