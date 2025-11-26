import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AnalyticsCard = ({ title, value, icon: Icon, subtext, color = "text-black" }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-2xl font-bold text-black">{value}</p>
      </div>
      <div className={`rounded-full p-3 bg-gray-50`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
    {subtext && <p className="mt-4 text-sm text-gray-500">{subtext}</p>}
  </div>
);

export default function PerformanceAnalytics({ stats }) {
  const { avgScore, avgTime, passRate } = stats?.performance || {};
  
  // Placeholder data for category performance if not available
  const categoryData = [
    { name: 'Math', score: 65 },
    { name: 'Science', score: 78 },
    { name: 'English', score: 82 },
    { name: 'History', score: 70 },
    { name: 'Logic', score: 55 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">System Performance</h3>
        <p className="text-sm text-gray-500">Key metrics indicating overall student success and engagement.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <AnalyticsCard 
          title="Average Score" 
          value={`${avgScore || 0}%`} 
          icon={TrendingUp} 
          subtext="System-wide average"
          color="text-blue-600"
        />
        <AnalyticsCard 
          title="Pass Rate" 
          value={`${passRate || 0}%`} 
          icon={CheckCircle} 
          subtext="Sessions with score ≥ 75%"
          color="text-green-600"
        />
        <AnalyticsCard 
          title="Avg. Time per Quiz" 
          value={`${avgTime || 0} min`} 
          icon={Clock} 
          subtext="Average completion time"
          color="text-orange-600"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-black">Category Performance (Estimated)</h3>
            <p className="text-sm text-gray-500">Average scores across different subject areas.</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 rounded-md bg-gray-50 p-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-gray-900">Insight</p>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const sorted = [...categoryData].sort((a, b) => b.score - a.score);
                        const top = sorted[0];
                        const bottom = sorted[sorted.length - 1];
                        return `${top.name} shows strong performance (${top.score}%), while ${bottom.name} may require additional resources (${bottom.score}%).`;
                      })()}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
