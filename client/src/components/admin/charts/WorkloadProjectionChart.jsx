import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function WorkloadProjectionChart({ data }) {
  if (!data?.projection?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No workload data available
      </div>
    );
  }

  function getBarColor(load) {
    if (load === "high") return "#111827";
    if (load === "medium") return "#6B7280";
    return "#D1D5DB";
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data.projection} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="dayName"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => [`${value} reviews`, "Due"]}
          labelFormatter={(label, payload) => {
            const item = payload?.[0]?.payload;
            return item?.date || label;
          }}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="dueReviews" radius={[4, 4, 0, 0]}>
          {data.projection.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.load)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default WorkloadProjectionChart;
