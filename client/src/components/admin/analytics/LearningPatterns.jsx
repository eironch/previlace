import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity } from 'lucide-react';

import ChartCard from '@/components/ui/ChartCard';

export default function LearningPatterns({ stats }) {
  const activityByHour = stats?.learningPatterns?.activityByHour || Array(24).fill(0);
  
  const chartData = activityByHour.map((count, hour) => ({
    hour: `${hour}:00`,
    activity: count,
  }));

  const getInsight = () => {
    const totalActivity = activityByHour.reduce((a, b) => a + b, 0);
    if (totalActivity === 0) return "No activity recorded yet.";
    
    // Find peak hour range (morning: 6-12, afternoon: 12-18, evening: 18-24, night: 0-6)
    const ranges = {
      morning: activityByHour.slice(6, 12).reduce((a, b) => a + b, 0),
      afternoon: activityByHour.slice(12, 18).reduce((a, b) => a + b, 0),
      evening: activityByHour.slice(18, 24).reduce((a, b) => a + b, 0),
      night: activityByHour.slice(0, 6).reduce((a, b) => a + b, 0),
    };
    
    const peak = Object.keys(ranges).reduce((a, b) => ranges[a] > ranges[b] ? a : b);
    
    const messages = {
      morning: "Users are most active in the morning (6 AM - 12 PM).",
      afternoon: "Peak activity is in the afternoon (12 PM - 6 PM).",
      evening: "Most users study in the evening (6 PM - 12 AM).",
      night: "Significant activity observed during late night hours (12 AM - 6 AM).",
    };
    
    return messages[peak];
  };

  return (
    <ChartCard
      title="Hourly Activity"
      description="User activity distribution throughout the day"
      insight={getInsight()}
      icon={Activity}
    >
      <div className="h-80 w-full">
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
    </ChartCard>
  );
}
