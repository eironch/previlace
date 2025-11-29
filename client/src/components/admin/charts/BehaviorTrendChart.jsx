import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function BehaviorTrendChart({ data, showLegend = true }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          stroke="#6B7280"
          fontSize={12}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, ""]}
          labelFormatter={(label) => formatDate(label)}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
          }}
        />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey="integrity"
          name="Integrity"
          stroke="#000000"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="engagement"
          name="Engagement"
          stroke="#6B7280"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="focus"
          name="Focus"
          stroke="#9CA3AF"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BehaviorTrendChart;
