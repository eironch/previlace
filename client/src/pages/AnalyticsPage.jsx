import { useEffect, useState } from 'react';
import { Layout, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import useAnalyticsStore from '../store/analyticsStore';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import StandardHeader from "@/components/ui/StandardHeader";
import {
  CategoryPerformanceChart,
  WeakAreasChart,
  ProgressChart,
  ReadinessGauge,
  WeeklyProgressChart,
  SubjectProgressChart,
  getFunSubjectSummary,
} from '../components/analytics/PerformanceCharts';
import ChartCard from "@/components/ui/ChartCard";

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="border-b border-gray-300 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <SkeletonLoader className="h-8 w-64" />
          <SkeletonLoader className="h-4 w-48" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-300 space-y-3">
              <div className="flex justify-between items-center">
                <SkeletonLoader className="h-4 w-24" />
                <SkeletonLoader variant="circle" className="h-4 w-4" />
              </div>
              <SkeletonLoader className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Weekly Progress Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 space-y-4">
          <SkeletonLoader className="h-6 w-48" />
          <SkeletonLoader className="h-64 w-full" />
        </div>

        {/* Subject Progress Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 space-y-4">
              <SkeletonLoader className="h-6 w-32" />
              <SkeletonLoader className="h-48 w-full" />
            </div>
          ))}
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 space-y-4">
              <SkeletonLoader className="h-6 w-40" />
              <SkeletonLoader className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const { 
    analyticsData: data, 
    overallProgress: weeklyData, 
    subjectWeeklyProgress: subjectData, 
    isLoading: loading, 
    fetchAnalytics 
  } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <StandardHeader 
        title="Performance Analytics" 
        description="Track your progress from Week 0 to now"
        onRefresh={fetchAnalytics}
        isRefreshing={loading}
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Row: Exam Readiness & Areas for Improvement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Exam Readiness Score"
            description="Based on your overall performance and consistency."
            insight={data?.accuracy >= 75 
              ? "You are demonstrating strong exam readiness. Keep maintaining your consistency." 
              : "Focus on your weak areas to improve your overall readiness score."}
            icon={Target}
          >
            <div className="h-72 flex items-center justify-center">
                <ReadinessGauge score={data?.accuracy || 0} />
            </div>
          </ChartCard>

          <ChartCard
            title="Areas for Improvement"
            description="Topics that need more attention."
            insight={data?.weakAreas?.length > 0
              ? `Prioritize reviewing ${data.weakAreas[0].topicName} to boost your score.`
              : "Great job! You have no critical weak areas at the moment."}
            icon={AlertCircle}
          >
            <div className="h-72">
                <WeakAreasChart data={data?.weakAreas} />
            </div>
          </ChartCard>
        </div>

        {/* Second Row: Performance by Subject & Learning Progress */}
        {/* Second Row: Performance by Subject & Learning Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Performance by Subject"
            description="Average scores across different topics."
            insight={(() => {
              const sorted = [...(data?.categories || [])].sort((a, b) => b.accuracy - a.accuracy);
              const top = sorted[0];
              const bottom = sorted[sorted.length - 1];
              return top && bottom 
                ? `${top.category} shows strong performance (${Math.round(top.accuracy)}%), while ${bottom.category} may require additional resources (${Math.round(bottom.accuracy)}%).` 
                : "Complete more quizzes to generate insights.";
            })()}
            icon={Layout}
          >
            <div className="h-72">
                <CategoryPerformanceChart data={data?.categories} />
            </div>
          </ChartCard>

          <ChartCard
            title="Learning Progress"
            description="Recent activity and improvement."
            insight="Consistent practice is key to improvement. Keep tracking your daily progress."
            icon={TrendingUp}
          >
            <div className="h-72">
                <ProgressChart data={data?.recentProgress} />
            </div>
          </ChartCard>
        </div>

        {/* Third Row: Overall Progress */}
        <ChartCard
          title="Overall Progress"
          description="Your journey from the beginning of the review program."
          insight="Track your weekly improvements to stay on target."
          icon={TrendingUp}
        >
          <div className="h-72">
              <WeeklyProgressChart data={weeklyData} />
          </div>
        </ChartCard>

        {/* Fourth Row: Subject Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(subjectData).map(([subject, progressData]) => {
             const improvement = progressData.length >= 2 ? progressData[progressData.length - 1].score - progressData[0].score : 0;
             const avgScore = progressData.reduce((sum, item) => sum + item.score, 0) / (progressData.length || 1);
             
             return (
              <ChartCard
                key={subject}
                title={`${subject} Progress`}
                description="Weekly performance tracking."
                insight={getFunSubjectSummary(improvement, avgScore, subject)}
                icon={CheckCircle}
              >
                <div className="h-72">
                    <SubjectProgressChart data={progressData} subjectName={subject} />
                </div>
              </ChartCard>
             );
          })}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
