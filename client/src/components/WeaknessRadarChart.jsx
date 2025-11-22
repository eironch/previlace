import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const WeaknessRadarChart = ({ data }) => {
  // Data expected format: [{ subject: 'Math', score: 80, fullMark: 100 }, ...]
  // We want to show "Weakness" or "Strength"?
  // Usually Radar charts show "Strength" (higher is better).
  // If we want to show weakness, we can invert it or just label it "Proficiency".
  // Let's show Proficiency (0-100).

  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Accuracy %"
            dataKey="accuracy"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeaknessRadarChart;
