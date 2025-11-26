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
} from '../components/analytics/PerformanceCharts';

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <SkeletonLoader className="h-8 w-64" />
          <SkeletonLoader className="h-4 w-48" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <SkeletonLoader className="h-4 w-24" />
                <SkeletonLoader variant="circle" className="h-4 w-4" />
              </div>
              <SkeletonLoader className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Weekly Progress Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <SkeletonLoader className="h-6 w-48" />
          <SkeletonLoader className="h-64 w-full" />
        </div>

        {/* Subject Progress Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
              <SkeletonLoader className="h-6 w-32" />
              <SkeletonLoader className="h-48 w-full" />
            </div>
          ))}
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
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
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-600">Total Questions</h3>
              <Layout className="text-gray-600" size={16} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{data?.totalQuestions || 0}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-600">Overall Accuracy</h3>
              <Target className="text-gray-600" size={16} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{data?.accuracy || 0}%</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-600">Exam Readiness</h3>
              <CheckCircle className={`${data?.accuracy >= 70 ? 'text-green-600' : 'text-gray-600'}`} size={16} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{data?.readiness || 'Low'}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-600">Weak Areas</h3>
              <AlertCircle className="text-gray-600" size={16} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{data?.weakAreas?.length || 0}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Overall Progress</h3>
              <p className="text-sm text-gray-500">Your journey from the beginning of the review program.</p>
          </div>
          <div className="h-72">
              <WeeklyProgressChart data={weeklyData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(subjectData).map(([subject, progressData]) => (
            <div key={subject} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{subject} Progress</h3>
                  <p className="text-sm text-gray-500">Weekly performance tracking.</p>
              </div>
              <div className="h-72">
                  <SubjectProgressChart data={progressData} subjectName={subject} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Performance by Subject</h3>
                <p className="text-sm text-gray-500">Average scores across different topics.</p>
            </div>
            <div className="h-72">
                <CategoryPerformanceChart data={data?.categories} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Learning Progress</h3>
                <p className="text-sm text-gray-500">Recent activity and improvement.</p>
            </div>
            <div className="h-72">
                <ProgressChart data={data?.recentProgress} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Areas for Improvement</h3>
                <p className="text-sm text-gray-500">Topics that need more attention.</p>
            </div>
            <div className="h-72">
                <WeakAreasChart data={data?.weakAreas} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Exam Readiness Score</h3>
                <p className="text-sm text-gray-500">Based on your overall performance and consistency.</p>
            </div>
            <div className="h-72 flex items-center justify-center">
                <ReadinessGauge score={data?.accuracy || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
