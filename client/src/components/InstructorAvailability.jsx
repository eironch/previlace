import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Check, X, Save } from "lucide-react";
import instructorService from "../services/instructorService";
import { useAuthStore } from "../store/authStore";

const InstructorAvailability = () => {
  const { user } = useAuthStore();
  const [availability, setAvailability] = useState({}); // { "YYYY-MM-DD": { isAvailable: boolean, mode: string } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, [user._id]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await instructorService.getAvailability(user._id);
      
      // Transform backend data to frontend state
      // Backend: weekendAvailability: [{ date: Date, isAvailable: Boolean, mode: String }]
      const availMap = {};
      if (data && data.weekendAvailability) {
        data.weekendAvailability.forEach(item => {
          const dateStr = new Date(item.date).toISOString().split('T')[0];
          availMap[dateStr] = {
            isAvailable: item.isAvailable,
            mode: item.mode || 'Online'
          };
        });
      }
      setAvailability(availMap);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDate = (dateStr) => {
    setAvailability((prev) => {
      const current = prev[dateStr];
      if (current && current.isAvailable) {
        // If available, toggle to unavailable
        return { ...prev, [dateStr]: { isAvailable: false, mode: 'Online' } };
      } else {
        // If unavailable or not set, toggle to available
        return { ...prev, [dateStr]: { isAvailable: true, mode: 'Online' } };
      }
    });
  };

  const handleModeChange = (dateStr, mode, e) => {
    e.stopPropagation();
    setAvailability(prev => ({
      ...prev,
      [dateStr]: { ...prev[dateStr], mode }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Transform frontend state to backend format
      const specificDates = Object.entries(availability).map(([dateStr, data]) => ({
        date: new Date(dateStr),
        isAvailable: data.isAvailable,
        mode: data.mode
      }));

      await instructorService.setAvailability({
        specificDates // This maps to weekendAvailability in controller as per my fix
      });
      setMessage({ type: 'success', text: 'Availability saved successfully!' });
    } catch (error) {
      console.error("Error saving availability:", error);
      setMessage({ type: 'error', text: 'Failed to save availability.' });
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) return <div className="p-8 text-center">Loading availability...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-black" />
          <h2 className="text-xl font-bold text-gray-900">Weekend Availability</h2>
        </div>
        {message && (
          <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </span>
        )}
      </div>
      
      <p className="text-gray-600 mb-6">
        Select the weekends you are available to teach. You can also specify if you prefer Online or Offline for each day.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weekends.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const data = availability[dateStr] || { isAvailable: false, mode: 'Online' }; // Default unavailable if not set
          const isAvailable = data.isAvailable;

          return (
            <div
              key={dateStr}
              onClick={() => toggleDate(dateStr)}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer group
                ${isAvailable 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-300 bg-white hover:border-gray-300'}
              `}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold text-gray-900 my-1">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              
              <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                {isAvailable ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {isAvailable ? 'Available' : 'Unavailable'}
              </div>

              {isAvailable && (
                <div className="mt-3 w-full" onClick={e => e.stopPropagation()}>
                  <select
                    value={data.mode}
                    onChange={(e) => handleModeChange(dateStr, e.target.value, e)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
};

export default InstructorAvailability;
