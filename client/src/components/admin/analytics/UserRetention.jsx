import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { Users } from 'lucide-react';

import ChartCard from '@/components/ui/ChartCard';

export default function UserRetention({ data = [] }) {
  // Format data for chart
  const chartData = data.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    activeUsers: item.count,
  }));

  // Calculate insight
  const calculateInsight = () => {
    if (data.length < 2) return "Not enough data to determine retention trend.";
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const avgFirst = firstHalf.reduce((acc, curr) => acc + curr.count, 0) / (firstHalf.length || 1);
    const avgSecond = secondHalf.reduce((acc, curr) => acc + curr.count, 0) / (secondHalf.length || 1);
    
    if (avgSecond > avgFirst * 1.1) return "User retention is trending upwards over the last 30 days.";
    if (avgSecond < avgFirst * 0.9) return "User retention shows a slight decline. Consider re-engagement campaigns.";
    return "User retention remains stable over the last 30 days.";
  };

  return (
    <ChartCard
      title="User Retention & Growth"
      description="Active users trend over the last 30 days"
      insight={calculateInsight()}
      icon={Users}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
                dataKey="day" 
                interval={Math.ceil(data.length / 5)} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
            />
            <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#000000" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={2}
                name="Active Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
