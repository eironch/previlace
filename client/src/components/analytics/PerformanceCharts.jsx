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
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const CategoryPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center p-4 text-gray-500">No data available</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subjectName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WeakAreasChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center p-4 text-gray-500">No weak areas identified yet!</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="topicName" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="accuracy" fill="#FF8042" name="Accuracy (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProgressChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center p-4 text-gray-500">No progress data available</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="questionsAnswered" stroke="#8884d8" name="Questions Answered" />
          <Line type="monotone" dataKey="correctAnswers" stroke="#82ca9d" name="Correct Answers" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ReadinessGauge = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <div className="h-48 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            startAngle={180}
            endAngle={0}
          >
            <Cell key="cell-0" fill={score >= 80 ? '#00C49F' : score >= 60 ? '#FFBB28' : '#FF8042'} />
            <Cell key="cell-1" fill="#f3f4f6" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-[-20px]">
        <div className="text-2xl font-bold">{score}%</div>
        <div className="text-sm text-gray-500">Readiness</div>
      </div>
    </div>
  );
};
