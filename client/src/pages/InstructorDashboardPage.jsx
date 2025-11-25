import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Calendar, Clock, Video, MapPin } from "lucide-react";
import weekendClassService from "../services/weekendClassService";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const InstructorDashboardPage = () => {
  const { user } = useAuthStore();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        // Fetch all classes for instructor, filter for upcoming in frontend or backend
        // For now, let's just fetch all and take the first few upcoming
        const all = await weekendClassService.getAllClasses({ instructorId: user._id });
        const upcoming = all
          .filter(c => new Date(c.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        setUpcomingClasses(upcoming);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, [user._id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}</h1>
          <p className="text-gray-600">Here's what's happening with your schedule.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Classes Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Classes</h2>
              <Link to="/instructor/classes" className="text-sm font-medium text-black hover:underline">View All</Link>
            </div>
            
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map(cls => (
                  <div key={cls._id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs font-bold uppercase">{format(new Date(cls.date), 'MMM')}</span>
                      <span className="text-lg font-bold">{format(new Date(cls.date), 'd')}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{cls.topic.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cls.startTime}</span>
                        <span className={`flex items-center gap-1 ${cls.mode === 'Online' ? 'text-green-600' : 'text-orange-600'}`}>
                          {cls.mode === 'Online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {cls.mode}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming classes scheduled.</p>
            )}
          </div>

          {/* Quick Actions / Stats */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/instructor/availability" className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors border border-gray-100">
                <Calendar className="w-6 h-6 text-gray-900 mb-2" />
                <span className="text-sm font-medium text-gray-900">Update Availability</span>
              </Link>
              <Link to="/dashboard/inbox" className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors border border-gray-100">
                <div className="relative">
                  {/* Badge could go here */}
                </div>
                {/* Mail icon isn't imported but we can use something else or import it */}
                <span className="text-sm font-medium text-gray-900">Check Messages</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
