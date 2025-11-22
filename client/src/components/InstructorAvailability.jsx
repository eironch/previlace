import React, { useState } from "react";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";

const InstructorAvailability = () => {
  // Mock data for now. In real app, fetch from API.
  // We assume the backend stores availability as a list of dates or a pattern.
  const [availability, setAvailability] = useState({
    "2024-10-05": true, // Saturday
    "2024-10-06": true, // Sunday
    "2024-10-12": false,
    "2024-10-13": true,
  });

  const toggleDate = (date) => {
    setAvailability((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
    // TODO: Sync with backend
  };

  // Helper to generate upcoming weekends
  const getUpcomingWeekends = () => {
    const dates = [];
    let d = new Date();
    // Find next Saturday
    d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
    
    for (let i = 0; i < 8; i++) { // Next 4 weekends
        dates.push(new Date(d)); // Sat
        const sun = new Date(d);
        sun.setDate(sun.getDate() + 1);
        dates.push(sun); // Sun
        d.setDate(d.getDate() + 7);
    }
    return dates;
  };

  const weekends = getUpcomingWeekends();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Weekend Availability</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Please mark the weekends you are available to teach. This will be used to generate the Master Schedule.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {weekends.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const isAvailable = availability[dateStr] !== false; // Default to true if not set

          return (
            <button
              key={dateStr}
              onClick={() => toggleDate(dateStr)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${isAvailable 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-red-200 bg-red-50 text-red-400'}
              `}
            >
              <span className="text-sm font-medium uppercase tracking-wider">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className="mt-2">
                {isAvailable ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          Save Availability
        </button>
      </div>
    </div>
  );
};

export default InstructorAvailability;
