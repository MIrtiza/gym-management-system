"use client";

interface AttendanceData {
  day: string;
  count: number;
}

interface AttendanceChartProps {
  title?: string;
  subtitle?: string;
  data?: AttendanceData[];
  isLoading?: boolean;
}

export const AttendanceChart = ({
  title = "Weekly Attendance",
  subtitle = "total this week",
  data = [],
  isLoading = false,
}: AttendanceChartProps) => {
  // Calculate total and average
  const totalAttendance = data.reduce(
    (sum, item) => sum + (item.count || 0),
    0,
  );
  const avgAttendance =
    data.length > 0 ? Math.round(totalAttendance / data.length) : 0;
  const maxCount = Math.max(...data.map((d) => d.count || 0), 1);
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-2xl border border-slate-200 dark:border-[#2d333d] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-2xl font-800 text-indigo-500 mt-1">
              <span className="animate-pulse">Loading...</span>{" "}
              <span className="text-xs font-medium text-slate-500 ml-1">
                {subtitle}
              </span>
            </p>
          </div>
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  const points = data.map((item, idx) => ({
    label: item.day?.slice(0, 3).toUpperCase() || "--",
    count: item.count || 0,
    x: ((idx + 1) / (data.length + 1)) * 400,
    y: 150 - (item.count / maxCount) * 120,
  }));

  return (
    <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-2xl border border-slate-200 dark:border-[#2d333d] shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-2xl font-800 text-indigo-500 mt-1">
            {data.length === 0 ? "0" : avgAttendance}{" "}
            <span className="text-xs font-medium text-slate-500 ml-1">
              {subtitle}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-indigo-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Check-ins
            </span>
          </div>
        </div>
      </div>
      <div className=" relative h-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No attendance data available
          </div>
        ) : (
          <>
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 150"
            >
              <defs>
                <linearGradient id="gradient-line" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              {points.length > 1 && (
                <>
                  <path
                    d={`M${points.map((p) => `${p.x},${p.y}`).join(" L")}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      fill="#6366f1"
                      r="3"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  ))}
                </>
              )}
            </svg>
            <div className="relative bottom-0 left-0 right-0 flex justify-between px-2 py-4">
              {points.map((point, index) => (
                <span
                  key={index}
                  className="text-[10px] font-bold text-slate-500"
                >
                  {point.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
