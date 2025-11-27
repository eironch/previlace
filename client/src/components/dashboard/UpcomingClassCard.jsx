import { useEffect, useState } from "react";
import { Calendar, Video } from "lucide-react";
import weekendClassService from "@/services/weekendClassService";

function UpcomingClassCard() {
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const data = await weekendClassService.getUpcomingClass();
        setUpcomingClass(data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch upcoming class", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, []);

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-300"></div>;
  if (!upcomingClass) return null;

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
          <Calendar className="h-6 w-6 text-black" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Class</h3>
          <p className="text-sm text-gray-500">Don't miss your next session</p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="font-bold text-gray-900">{upcomingClass.topic?.name || upcomingClass.topic}</h4>
        <p className="mb-2 text-sm text-gray-600">{upcomingClass.description}</p>
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{new Date(upcomingClass.date).toLocaleDateString()} • {upcomingClass.startTime} - {upcomingClass.endTime}</span>
        </div>
        
        {upcomingClass.meetingLink && (
          <a 
            href={upcomingClass.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
          >
            <Video className="h-4 w-4" />
            Join Zoom Meeting
          </a>
        )}
      </div>
    </div>
  );
}

export default UpcomingClassCard;
