"use client";

interface AttendanceChartProps {
  title?: string;
  value?: string;
  subtitle?: string;
}

export const AttendanceChart = ({
  title = "Weekly Attendance",
  value = "842",
  subtitle = "avg. per week",
}: AttendanceChartProps) => {
  return (
    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-2xl font-800 text-indigo-500 mt-1">
            {value}{" "}
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
      <div className="h-64 relative">
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
          <path
            d="M0,100 C50,80 100,120 150,60 C200,30 250,90 300,50 C350,20 400,40 400,40 V150 H0 Z"
            fill="url(#gradient-line)"
          />
          <path
            d="M0,100 C50,80 100,120 150,60 C200,30 250,90 300,50 C350,20 400,40 400,40"
            fill="none"
            stroke="#6366f1"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <circle
            cx="150"
            cy="60"
            fill="#6366f1"
            r="4"
            stroke="white"
            strokeWidth="2"
          />
          <circle
            cx="350"
            cy="20"
            fill="#6366f1"
            r="4"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-4">
          <span className="text-[10px] font-bold text-slate-500">MON</span>
          <span className="text-[10px] font-bold text-slate-500">TUE</span>
          <span className="text-[10px] font-bold text-slate-500">WED</span>
          <span className="text-[10px] font-bold text-slate-500">THU</span>
          <span className="text-[10px] font-bold text-slate-500">FRI</span>
          <span className="text-[10px] font-bold text-slate-500">SAT</span>
          <span className="text-[10px] font-bold text-slate-500">SUN</span>
        </div>
      </div>
    </div>
  );
};
