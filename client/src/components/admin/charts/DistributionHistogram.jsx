import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function DistributionHistogram({ data, dataKey = "count", labelKey = "label", title = "" }) {
  if (!data?.length) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-500">
        No distribution data available
      </div>
    );
  }

  return (
    <div>
      {title && <h4 className="mb-4 text-sm font-medium text-gray-700">{title}</h4>}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey={labelKey}
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name, props) => {
              const percentage = props.payload.percentage;
              return [`${value} users (${percentage}%)`, "Count"];
            }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey={dataKey} fill="#000000" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DistributionHistogram;
