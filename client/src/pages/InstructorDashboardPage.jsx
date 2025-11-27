import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Calendar, Clock, Video, MapPin, Users, Star, TrendingUp, ArrowRight, Mail, CheckCircle } from "lucide-react";
import weekendClassService from "../services/weekendClassService";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import StandardHeader from "../components/ui/StandardHeader";

const StatCard = ({ title, value, icon: Icon, trend, trendLabel }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon className="w-6 h-6 text-gray-900" />
      </div>
      {trend && (
        <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-500">{title}</p>
    {trendLabel && <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>}
  </div>
);

const ActionCard = ({ title, description, icon: Icon, to, colorClass = "bg-gray-900 text-white" }) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${colorClass === "bg-gray-900 text-white" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        <Icon className="w-6 h-6" />
      </div>
      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </Link>
);

const InstructorDashboardPage = () => {
  const { user } = useAuthStore();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    studentsReached: 0, // Mocked for now
    rating: 4.9 // Mocked for now
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const all = await weekendClassService.getAllClasses({ instructorId: user._id });

        // Filter upcoming
        const upcoming = all
          .filter(c => new Date(c.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);

        setUpcomingClasses(upcoming);
        setStats(prev => ({
          ...prev,
          totalClasses: all.length,
          studentsReached: all.reduce((acc, curr) => acc + (curr.enrolledStudents?.length || 0), 0)
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader
        title="Instructor Dashboard"
        subtitle={`Welcome back, ${user?.firstName}. Here's your overview.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            icon={Calendar}
            trend="+12%"
            trendLabel="vs. last month"
          />
          <StatCard
            title="Students Reached"
            value={stats.studentsReached}
            icon={Users}
            trend="+5%"
            trendLabel="New enrollments"
          />
          <StatCard
            title="Instructor Rating"
            value={stats.rating}
            icon={Star}
            trendLabel="Consistent performance"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column: Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
              <Link to="/instructor/classes" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                View All Classes
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : upcomingClasses.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {upcomingClasses.map((cls) => (
                    <div key={cls._id} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-start gap-4">
                        {/* Date Box */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-900 text-white rounded-xl flex flex-col items-center justify-center shadow-sm">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">{format(new Date(cls.date), 'MMM')}</span>
                          <span className="text-2xl font-bold">{format(new Date(cls.date), 'd')}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-4">
                                {cls.topic?.name || "Untitled Session"}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">{cls.subject?.name}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls.mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                              {cls.mode}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{cls.startTime} - {cls.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {cls.mode === 'Online' ? <Video className="w-4 h-4 text-gray-400" /> : <MapPin className="w-4 h-4 text-gray-400" />}
                              <span>{cls.venue || "Link pending"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>{cls.enrolledStudents?.length || 0} Enrolled</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No classes scheduled</h3>
                  <p className="text-gray-500 mt-2">You don't have any upcoming classes at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Column: Actions & Notifications */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <div className="grid gap-4">
              <ActionCard
                title="Manage Availability"
                description="Update your teaching schedule and slots."
                icon={Calendar}
                to="/instructor/availability"
              />
              <ActionCard
                title="Class Management"
                description="View rosters and class details."
                icon={Users}
                to="/instructor/classes"
                colorClass="bg-white text-gray-900 border border-gray-200"
              />
              <ActionCard
                title="Student Tickets"
                description="Respond to student inquiries."
                icon={Mail}
                to="/instructor/inbox"
                colorClass="bg-white text-gray-900 border border-gray-200"
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900">Profile Status</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your instructor profile is active and visible to students.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
