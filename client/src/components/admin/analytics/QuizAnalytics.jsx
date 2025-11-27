import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

import ChartCard from '@/components/ui/ChartCard';

export default function QuizAnalytics({ data = { completion: [], duration: [] } }) {
  // Process Completion Data
  const completedCount = data.completion.find(c => c._id === 'completed')?.count || 0;
  const abandonedCount = data.completion.find(c => c._id === 'abandoned')?.count || 0;
  const totalSessions = completedCount + abandonedCount;
  
  const completionData = [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Abandoned', value: abandonedCount, color: '#ef4444' },
  ];

  // Process Duration Data
  const durationData = [
    { range: '0-5m', count: data.duration.find(d => d._id === 0)?.count || 0 },
    { range: '5-10m', count: data.duration.find(d => d._id === 300000)?.count || 0 },
    { range: '10-20m', count: data.duration.find(d => d._id === 600000)?.count || 0 },
    { range: '20m+', count: data.duration.find(d => d._id === 1200001)?.count || 0 },
  ];

  const calculateCompletionInsight = () => {
    if (totalSessions === 0) return "No quiz sessions recorded yet.";
    const rate = (completedCount / totalSessions) * 100;
    if (rate > 80) return `High completion rate of ${Math.round(rate)}%. Students are engaged.`;
    if (rate < 50) return `Low completion rate of ${Math.round(rate)}%. Investigate quiz difficulty or length.`;
    return `Moderate completion rate of ${Math.round(rate)}%.`;
  };

  const getDurationInsight = () => {
    const max = durationData.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    return `Most students spend ${max.range} on quizzes.`;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Completion Rate */}
      <ChartCard
        title="Quiz Completion"
        description="Completion vs Abandonment Rate"
        insight={calculateCompletionInsight()}
        icon={CheckCircle2}
      >
        <div className="flex items-center justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {completionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Completed ({totalSessions > 0 ? Math.round((completedCount/totalSessions)*100) : 0}%)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Abandoned ({totalSessions > 0 ? Math.round((abandonedCount/totalSessions)*100) : 0}%)</span>
            </div>
        </div>
      </ChartCard>

      {/* Session Duration */}
      <ChartCard
        title="Session Duration"
        description="Time spent per quiz session"
        insight={getDurationInsight()}
        icon={Clock}
      >
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="range" 
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
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
