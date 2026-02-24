"use client";

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
  accentColor?: "blue" | "primary" | "indigo" | "amber";
}

export const StatCard = ({
  icon,
  title,
  value,
  trend,
  accentColor = "blue",
}: StatCardProps) => {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500",
    primary: "bg-primary/10 text-primary",
    indigo: "bg-indigo-500/10 text-indigo-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  const trendColor = trend?.isPositive
    ? "bg-green-500/10 text-green-500"
    : "bg-red-500/10 text-red-500";

  const trendIcon = trend?.isPositive ? "📈" : "📉";

  return (
    <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-2xl border border-slate-200 dark:border-[#2d333d] shadow-sm group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`size-10 ${colorMap[accentColor]} rounded-xl flex items-center justify-center`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-1 ${trendColor} rounded-full flex items-center gap-1`}
          >
            <span>{trendIcon}</span>
            {Math.abs(trend.percentage)}%
          </span>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
        {title}
      </p>
      <p className="text-3xl font-800 mt-1">{value}</p>
    </div>
  );
};
