import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-3 shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CategoryPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No subject data available</p>
      </div>
    );
  }

  if (data.length >= 3) {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#D1D5DB" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#4b5563', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Accuracy"
              dataKey="accuracy"
              stroke="#000000"
              fill="#000000"
              fillOpacity={0.2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="accuracy" name="Accuracy" radius={[0, 4, 4, 0]} barSize={20}>
             {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.accuracy >= 70 ? '#10B981' : entry.accuracy >= 50 ? '#F59E0B' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WeakAreasChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center p-4 text-gray-500">No weak areas identified yet</div>;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="topicName" type="category" width={120} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="accuracy" name="Accuracy" radius={[0, 4, 4, 0]} barSize={20} fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProgressChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center p-4 text-gray-500">No progress data available</div>;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B7280" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6B7280" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="_id" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="questionsAnswered" stroke="#6B7280" fillOpacity={1} fill="url(#colorTotal)" name="Total Questions" />
          <Area type="monotone" dataKey="correctAnswers" stroke="#10B981" fillOpacity={1} fill="url(#colorCorrect)" name="Correct Answers" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WeeklyProgressChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">Complete Week 0 pretest to track your progress</div>;
  }


  
  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#000000" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#000000' }} 
              activeDot={{ r: 6, fill: '#000000' }} 
              name="Average Score" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SubjectProgressChart = ({ data, subjectName }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No data for {subjectName}. Complete quizzes to see progress
      </div>
    );
  }


  
  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#000000" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#000000' }} 
              activeDot={{ r: 6, fill: '#000000' }} 
              name="Score" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const getFunProgressSummary = (improvement) => {
  if (improvement > 20) return "Incredible! You're on fire with a massive improvement.";
  if (improvement > 10) return "Great job! You're showing strong growth week over week.";
  if (improvement > 5) return "You're making steady progress. Keep it up!";
  if (improvement > 0) return "You're moving in the right direction. Consistency is key.";
  if (improvement === 0) return "You're maintaining your score. Try to push a bit harder next week.";
  if (improvement > -5) return "A small dip, but don't worry. Review your weak areas and bounce back.";
  return "It looks like you're struggling a bit. Focus on the basics and try again.";
};

export const getFunSubjectSummary = (improvement, avgScore, subjectName) => {
  if (avgScore >= 80 && improvement > 0) return `You're mastering ${subjectName}! Keep maintaining this high standard.`;
  if (avgScore >= 80) return `You have a strong command of ${subjectName}. Excellent work!`;
  if (avgScore >= 70 && improvement > 0) return `You're improving in ${subjectName}. You're getting better every day.`;
  if (avgScore >= 70) return `You have a good grasp of ${subjectName}. Keep practicing to reach the next level.`;
  if (avgScore >= 60 && improvement > 0) return `You're getting there with ${subjectName}. Your hard work is paying off.`;
  if (avgScore >= 60) return `You need a bit more work on ${subjectName}. Don't give up!`;
  if (improvement > 5) return `You're growing in ${subjectName}. Keep this momentum going.`;
  return `Focus more on ${subjectName} to boost your overall score.`;
};

export const ReadinessGauge = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  function getFunReadinessSummary(score) {
    if (score >= 85) return "Exam ready";
    if (score >= 75) return "Almost there";
    if (score >= 65) return "Keep pushing";
    if (score >= 50) return "Getting closer";
    return "More practice needed";
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-0" fill={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'} />
            <Cell key="cell-1" fill="#F3F4F6" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center mt-4">
        <div className="text-3xl font-bold text-gray-900">{score}%</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">Readiness</div>
        <div className="mt-2 text-xs font-medium text-gray-600">{getFunReadinessSummary(score)}</div>
      </div>
    </div>
  );
};
