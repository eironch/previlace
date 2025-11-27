import { useEffect } from "react";
import { Calendar, CheckCircle, Circle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useActivityStore from "@/store/activityStore";

function WeeklyProgressCard() {
  const { weeklyProgress: progress, fetchWeeklyProgress, loading, error } = useActivityStore();

  useEffect(() => {
    fetchWeeklyProgress();
  }, [fetchWeeklyProgress]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
            <Calendar className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
            <p className="text-sm text-gray-500">Unable to load progress</p>
          </div>
        </div>
        <button
          onClick={fetchWeeklyProgress}
          className="mt-4 w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (progress.length === 0) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
          <Calendar className="h-6 w-6 text-gray-900" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Activities Yet</h3>
        <p className="mt-1 text-sm text-gray-500">Complete your first daily challenge</p>
      </div>
    );
  }

  const completedCount = progress.filter((p) => p.status === "completed" || p.status === "perfect").length;
  const totalCount = progress.length;
  
  // Prepare data for chart
  const chartData = progress.map(day => ({
    name: day.dayName.substring(0, 3), // Mon, Tue, etc.
    score: day.score || 0,
    status: day.status
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-300 bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
            <Calendar className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
            <p className="text-sm text-gray-500">Performance Overview</p>
          </div>
        </div>
        <div className="rounded-full bg-gray-200 px-3 py-1">
          <span className="text-sm font-semibold text-gray-900">
            {completedCount}/{totalCount} Completed
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-6 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.score >= 80 ? '#10B981' : entry.score >= 60 ? '#F59E0B' : '#E5E7EB'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {progress.map((day, index) => {
          const isCompleted = day.status === "completed" || day.status === "perfect";
          const isInProgress = day.status === "in_progress";
          const isLocked = day.status === "locked";

          return (
            <div key={index} className="flex items-center justify-between rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : isInProgress ? (
                  <Circle className="h-5 w-5 text-black" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
                <div>
                  <p className={`text-sm font-medium ${isLocked ? "text-gray-400" : "text-gray-900"}`}>
                    {day.dayName}
                  </p>
                  {day.activity && <p className="text-xs text-gray-500">{day.activity}</p>}
                </div>
              </div>

              {isCompleted && (
                <div className="flex items-center gap-4 text-sm">
                  <span className={`font-semibold ${day.score >= 80 ? 'text-green-600' : 'text-gray-900'}`}>
                    {day.score}%
                  </span>
                  {day.timeSpent && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(day.timeSpent / 60)}m</span>
                    </div>
                  )}
                </div>
              )}

              {isInProgress && <span className="text-xs font-medium text-gray-900">In Progress</span>}

              {isLocked && <span className="text-xs font-medium text-gray-400">Upcoming</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyProgressCard;
