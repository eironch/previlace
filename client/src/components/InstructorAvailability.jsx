import React from "react";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import SkeletonLoader from "./ui/SkeletonLoader";

const InstructorAvailability = ({ availability, onToggleDate, onModeChange, loading }) => {
  
  // Helper to generate upcoming weekends (12 weeks)
  const getUpcomingWeekends = () => {
    const dates = [];
    let d = new Date();
    // Find next Saturday
    d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
    
    for (let i = 0; i < 24; i++) { // Next 12 weekends (24 days)
        dates.push(new Date(d)); // Sat
        const sun = new Date(d);
        sun.setDate(sun.getDate() + 1);
        dates.push(sun); // Sun
        d.setDate(d.getDate() + 7);
    }
    return dates;
  };

  const weekends = getUpcomingWeekends();

  const handleButtonClick = (dateStr, type, currentMode, isAvailable, e) => {
    e.stopPropagation();
    
    if (!isAvailable) {
      // If not available, clicking any button makes it available with that mode
      onToggleDate(dateStr);
      onModeChange(dateStr, type);
      return;
    }

    // If already available
    if (currentMode === 'Both') {
      // If Both, clicking one removes it (sets to the other)
      onModeChange(dateStr, type === 'Online' ? 'Offline' : 'Online');
    } else if (currentMode === type) {
      // If clicking the active one, toggle availability off (or could enforce at least one)
      // Let's toggle off for intuitive "deselect" behavior
      onToggleDate(dateStr);
    } else {
      // If clicking the inactive one, set to Both
      onModeChange(dateStr, 'Both');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
        <div className="flex items-center gap-2 mb-6">
          <SkeletonLoader variant="circle" className="w-6 h-6" />
          <SkeletonLoader variant="title" className="w-48" />
        </div>
        <SkeletonLoader className="w-full mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-black" />
          <h2 className="text-xl font-bold text-gray-900">Weekend Availability</h2>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6">
        Select the weekends you are available to teach. Click "Online" or "Offline" to toggle specific modes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weekends.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const data = availability[dateStr] || { isAvailable: false, mode: 'Online' };
          const isAvailable = data.isAvailable;
          const mode = data.mode;

          const isOnline = isAvailable && (mode === 'Online' || mode === 'Both');
          const isOffline = isAvailable && (mode === 'Offline' || mode === 'Both');

          return (
            <div
              key={dateStr}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all group
                ${isAvailable 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-300 bg-white hover:border-gray-400'}
              `}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold text-gray-900 my-1">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              
              <div className={`mt-2 mb-3 flex items-center gap-1 text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                {isAvailable ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {isAvailable ? 'Available' : 'Unavailable'}
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={(e) => handleButtonClick(dateStr, 'Online', mode, isAvailable, e)}
                  className={`
                    flex-1 py-1 px-2 text-xs font-semibold rounded border transition-colors
                    ${isOnline 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}
                  `}
                >
                  Online
                </button>
                <button
                  onClick={(e) => handleButtonClick(dateStr, 'Offline', mode, isAvailable, e)}
                  className={`
                    flex-1 py-1 px-2 text-xs font-semibold rounded border transition-colors
                    ${isOffline 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}
                  `}
                >
                  Offline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstructorAvailability;
