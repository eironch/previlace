function BehaviorHeatmap({ data, maxValue }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No activity data available
      </div>
    );
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  function getIntensity(sessions) {
    if (!maxValue || maxValue === 0) return 0;
    return Math.min(sessions / maxValue, 1);
  }

  function getColor(intensity) {
    if (intensity === 0) return "bg-gray-100";
    if (intensity < 0.25) return "bg-gray-200";
    if (intensity < 0.5) return "bg-gray-400";
    if (intensity < 0.75) return "bg-gray-600";
    return "bg-gray-900";
  }

  function formatHour(hour) {
    if (hour === 0) return "12a";
    if (hour === 12) return "12p";
    return hour > 12 ? `${hour - 12}p` : `${hour}a`;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="mb-2 flex">
          <div className="w-12" />
          {hours.filter((_, i) => i % 3 === 0).map((hour) => (
            <div key={hour} className="flex-1 text-center text-xs text-gray-500">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div key={day} className="mb-1 flex items-center">
            <div className="w-12 text-xs text-gray-500">{day}</div>
            <div className="flex flex-1 gap-0.5">
              {hours.map((hour) => {
                const cellData = data.find(
                  (d) => d.day === day && d.hour === hour
                );
                const sessions = cellData?.sessions || 0;
                const intensity = getIntensity(sessions);

                return (
                  <div
                    key={hour}
                    className={`h-4 flex-1 rounded-sm ${getColor(intensity)} transition-colors hover:ring-1 hover:ring-black`}
                    title={`${day} ${formatHour(hour)}: ${sessions} sessions`}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500">Less</span>
          <div className="flex gap-0.5">
            {["bg-gray-100", "bg-gray-200", "bg-gray-400", "bg-gray-600", "bg-gray-900"].map(
              (color, i) => (
                <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
              )
            )}
          </div>
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
}

export default BehaviorHeatmap;
