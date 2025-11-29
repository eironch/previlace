import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Save } from 'lucide-react';
import InstructorAvailability from '../../components/InstructorAvailability';
import StandardHeader from '../../components/ui/StandardHeader';
import instructorService from '../../services/instructorService';
import { useAuthStore } from '../../store/authStore';

export default function InstructorAvailabilityPage() {
  const { user } = useAuthStore();
  const [localAvailability, setLocalAvailability] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // SWR Fetcher
  const fetcher = () => instructorService.getAvailability(user._id);
  
  const { data, error, isLoading } = useSWR(
    user?._id ? `/api/instructor-availability/${user._id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        // Transform backend data to frontend map on load
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
        setLocalAvailability(availMap);
        setIsDirty(false);
      }
    }
  );

  const handleToggleDate = (dateStr) => {
    setLocalAvailability((prev) => {
      const current = prev[dateStr];
      const newState = { ...prev };
      
      if (current && current.isAvailable) {
        // Toggle to unavailable
        newState[dateStr] = { isAvailable: false, mode: 'Online' };
      } else {
        // Toggle to available
        newState[dateStr] = { isAvailable: true, mode: 'Online' };
      }
      return newState;
    });
    setIsDirty(true);
  };

  const handleModeChange = (dateStr, mode) => {
    setLocalAvailability(prev => ({
      ...prev,
      [dateStr]: { ...prev[dateStr], mode }
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isDirty) return;
    
    setIsSaving(true);
    try {
      // Transform frontend state to backend format
      const specificDates = Object.entries(localAvailability).map(([dateStr, data]) => ({
        date: new Date(dateStr),
        isAvailable: data.isAvailable,
        mode: data.mode
      }));

      await instructorService.setAvailability({ specificDates });
      
      // Revalidate SWR
      mutate(`/api/instructor-availability/${user._id}`);
      setIsDirty(false);
      // Optional: Show success toast
    } catch (error) {
      console.error("Error saving availability:", error);
      // Optional: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader
        title="Availability Settings"
        description="Set your availability for the next 10-12 weeks."
        endContent={
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <InstructorAvailability 
          availability={localAvailability}
          onToggleDate={handleToggleDate}
          onModeChange={handleModeChange}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
