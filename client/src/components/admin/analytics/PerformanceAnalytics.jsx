import { TrendingUp, Clock, CheckCircle } from 'lucide-react';

const AnalyticsCard = ({ title, value, icon: Icon, subtext, color = "text-black" }) => (
  <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
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
  
  // Use real category stats if available, otherwise empty array
  const categoryData = stats?.categoryStats?.map(cat => ({
    name: cat._id,
    score: Math.round(cat.avgScore || 0)
  })) || [];

  return (
    <div className="space-y-6">
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
    </div>
  );
}
