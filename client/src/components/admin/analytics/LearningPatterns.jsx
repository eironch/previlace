import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity } from 'lucide-react';

export default function LearningPatterns({ stats }) {
  const activityByHour = stats?.learningPatterns?.activityByHour || Array(24).fill(0);
  
  const chartData = activityByHour.map((count, hour) => ({
    hour: `${hour}:00`,
    activity: count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Learning Patterns</h3>
        <p className="text-sm text-gray-500">Analysis of when and how students engage with the platform.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-black">Hourly Activity</h3>
                <p className="text-sm text-gray-500">User activity distribution throughout the day</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="hour" 
                interval={3} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="activity" 
                stroke="#000000" 
                fillOpacity={1} 
                fill="url(#colorActivity)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 rounded-md bg-gray-50 p-4">
            <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-gray-900">Activity Trend</p>
                    <p className="text-sm text-gray-600">Peak activity is observed during evening hours (6 PM - 10 PM), suggesting most users study after work/school.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
