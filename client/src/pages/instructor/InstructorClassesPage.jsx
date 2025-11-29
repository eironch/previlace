import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import weekendClassService from '../../services/weekendClassService';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import StandardHeader from '../../components/ui/StandardHeader';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

export default function InstructorClassesPage() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // Fetch classes where instructor is current user
      const data = await weekendClassService.getAllClasses({ instructorId: user._id });
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader
        title="My Classes"
        description="View your upcoming teaching schedule."
        onRefresh={fetchClasses}
        isRefreshing={loading}
      />

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-300 p-6">
                <div className="flex justify-between items-start mb-4">
                  <SkeletonLoader className="h-6 w-16" />
                  <SkeletonLoader className="h-6 w-16" />
                </div>
                <SkeletonLoader variant="title" className="mb-2" />
                <SkeletonLoader className="w-1/2 mb-4" />
                <div className="space-y-2">
                  <SkeletonLoader className="w-full" />
                  <SkeletonLoader className="w-3/4" />
                  <SkeletonLoader className="w-1/2" />
                </div>
              </div>
            ))
          ) : classes.length > 0 ? (
            classes.map(cls => (
              <div key={cls._id} className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls.mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {cls.mode}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800`}>
                    {cls.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.topic.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{cls.subject.name}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {format(new Date(cls.date), 'EEEE, MMMM do, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {cls.startTime} - {cls.endTime}
                  </div>
                  {cls.mode === 'Online' ? (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-gray-400" />
                      <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                        {cls.meetingLink || 'No link provided'}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {cls.location || 'No location provided'}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-300 border-dashed">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No classes scheduled</h3>
              <p className="text-gray-500 mt-1">You don't have any classes scheduled yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
