import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function RetentionCurveChart({ predicted, actual }) {
  if (!predicted?.length && !actual?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No retention data available
      </div>
    );
  }

  const data = predicted?.map((p, i) => ({
    day: p.day,
    predicted: p.retention,
    actual: actual?.[i]?.retention || null,
  })) || [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="day"
          tickFormatter={(value) => `Day ${value}`}
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
          labelFormatter={(label) => `Day ${label}`}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="predicted"
          name="Predicted"
          stroke="#000000"
          strokeWidth={2}
          dot={{ fill: "#000000", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke="#6B7280"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: "#6B7280", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RetentionCurveChart;
