import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, User } from 'lucide-react';
import weekendClassService from '../../services/weekendClassService';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">My Classes</h1>
          <p className="mt-2 text-gray-600">View your upcoming teaching schedule.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.length > 0 ? (
            classes.map(cls => (
              <div key={cls._id} className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${cls.mode === 'Online' ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'}`}>
                    {cls.mode}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-800`}>
                    {cls.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.topic.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{cls.subject.name}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(cls.date), 'EEEE, MMMM do, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {cls.startTime} - {cls.endTime}
                  </div>
                  {cls.mode === 'Online' ? (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                        {cls.meetingLink || 'No link provided'}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {cls.location || 'No location provided'}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-300 border-dashed">
              <p className="text-gray-500">No classes scheduled yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
