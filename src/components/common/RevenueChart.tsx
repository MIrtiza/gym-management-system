"use client";

interface RevenueData {
  week: string;
  amount: number;
}

interface RevenueChartProps {
  title?: string;
  subtitle?: string;
  data?: RevenueData[];
  isLoading?: boolean;
}

export const RevenueChart = ({
  title = "Monthly Revenue",
  subtitle = "total this month",
  data = [],
  isLoading = false,
}: RevenueChartProps) => {
  // Calculate total and max for normalization
  const totalRevenue = data.reduce((sum, item) => sum + (item.amount || 0), 0);
  const maxAmount = Math.max(...data.map((d) => d.amount || 0), 1);
  const displayValue = `$${totalRevenue.toLocaleString()}`;

  // Normalize amounts to percentages for bar chart
  const normalizedData = data.map((item) => ({
    label: item.week?.slice(0, 3).toUpperCase() || "--",
    percentage: (item.amount / maxAmount) * 100,
    amount: item.amount,
  }));
  return (
    <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-2xl border border-slate-200 dark:border-[#2d333d] shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-2xl font-800 text-primary mt-1">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              displayValue
            )}{" "}
            <span className="text-xs font-medium text-slate-500 ml-1">
              {subtitle}
            </span>
          </p>
        </div>
        <button className="text-slate-400 hover:text-primary transition-colors">
          ⋮
        </button>
      </div>
      <div className="h-64 flex items-end justify-between gap-3 px-2">
        {isLoading ? (
          <div className="w-full flex items-end justify-between gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg h-32 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500">--</span>
              </div>
            ))}
          </div>
        ) : normalizedData.length === 0 ? (
          <div className="w-full flex items-center justify-center text-slate-500 text-sm">
            No revenue data available
          </div>
        ) : (
          normalizedData.map((item, index) => (
            <div
              key={index}
              className="w-full flex flex-col items-center gap-2 group cursor-pointer"
              title={`$${item.amount.toLocaleString()}`}
            >
              <div className="w-full bg-slate-100 dark:bg-[#0a0a0a] rounded-lg overflow-hidden flex flex-col justify-end h-full">
                <div
                  className="bg-primary/40 group-hover:bg-primary transition-all rounded-t-lg"
                  style={{ height: `${Math.max(item.percentage, 10)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {item.label}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
