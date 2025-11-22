import React, { useEffect, useState } from 'react';
import { Layout, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import {
  CategoryPerformanceChart,
  WeakAreasChart,
  ProgressChart,
  ReadinessGauge,
} from '../components/analytics/PerformanceCharts';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getStudentAnalytics();
        setData(result);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-500">Track your progress and identify areas for improvement</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Questions</h3>
            <Layout className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data?.totalQuestions?.totalQuestions || 0}</div>
          <div className="text-sm text-green-600 mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            <span>+12 this week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Overall Accuracy</h3>
            <Target className="text-purple-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data?.totalQuestions?.accuracy || 0}%</div>
          <div className="text-sm text-gray-500 mt-2">Across all subjects</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Exam Readiness</h3>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data?.totalQuestions?.readiness || 'Low'}</div>
          <div className="text-sm text-gray-500 mt-2">Based on recent performance</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Weak Areas</h3>
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data?.weakAreas?.length || 0}</div>
          <div className="text-sm text-red-600 mt-2">Topics needing attention</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance by Subject</h3>
          <CategoryPerformanceChart data={data?.categories} />
        </div>

        {/* Progress Over Time */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Learning Progress</h3>
          <ProgressChart data={data?.recentProgress} />
        </div>

        {/* Weak Areas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Areas for Improvement</h3>
          <WeakAreasChart data={data?.weakAreas} />
        </div>

        {/* Readiness Gauge */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Exam Readiness Score</h3>
          <ReadinessGauge score={data?.totalQuestions?.accuracy || 0} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
