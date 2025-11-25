import { useEffect, useState } from 'react';
import { Layout, TrendingUp, AlertCircle, CheckCircle, Target, ArrowLeft } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import useAnalyticsStore from '../store/analyticsStore';
import SkeletonLoader from '../components/ui/SkeletonLoader';
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <SkeletonLoader className="h-8 w-64" />
        <SkeletonLoader className="h-4 w-48" />
      </div>

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>

          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-500">Track your progress from Week 0 to now</p>
        </div>
      </div>

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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Progress: Week 0 to Now</h3>
        <WeeklyProgressChart data={weeklyData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(subjectData).map(([subject, progressData]) => (
          <div key={subject} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <SubjectProgressChart data={progressData} subjectName={subject} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance by Subject</h3>
          <CategoryPerformanceChart data={data?.categories} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Learning Progress</h3>
          <ProgressChart data={data?.recentProgress} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Areas for Improvement</h3>
          <WeakAreasChart data={data?.weakAreas} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Exam Readiness Score</h3>
          <ReadinessGauge score={data?.accuracy || 0} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
