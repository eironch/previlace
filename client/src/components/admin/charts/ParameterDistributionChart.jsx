import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function ParameterDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No distribution data available
      </div>
    );
  }

  const colors = ["#374151", "#4B5563", "#6B7280", "#9CA3AF", "#D1D5DB"];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, "auto"]} tickFormatter={(value) => `${value}%`} />
          <YAxis type="category" dataKey="label" width={70} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => [`${value}%`, "Users"]}
            labelFormatter={(label) => `Retention: ${label}`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ParameterDistributionChart;
