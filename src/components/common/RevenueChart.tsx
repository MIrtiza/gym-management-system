"use client";

interface RevenueData {
  day?: string;
  week?: string;
  label?: string;
  amount: number;
}

interface RevenueChartProps {
  title?: string;
  subtitle?: string;
  data?: RevenueData[];
  isLoading?: boolean;
}

export const RevenueChart = ({
  title = "Weekly Revenue Trends",
  subtitle = "Weekly revenue performance over the last 4 weeks",
  data = [],
  isLoading = false,
}: RevenueChartProps) => {
  const totalRevenue = data.reduce((sum, item) => sum + (item.amount || 0), 0);
  const maxAmount = Math.max(...data.map((d) => d.amount || 0), 1);
  const displayValue = `$${totalRevenue.toLocaleString()}`;

  const normalizedData = data.map((item, index) => ({
    label: item.label
      ? item.label.toUpperCase()
      : item.day
        ? item.day.toUpperCase()
        : item.week
          ? item.week.slice(0, 3).toUpperCase()
          : "--",
    amount: item.amount,
    percentage: (item.amount / maxAmount) * 100,
    x: index,
  }));

  const latestIndex = Math.max(normalizedData.length - 1, 0);
  const hasData = normalizedData.length > 0;

  return (
    <div className="bg-[#1a1d23] p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-[#0d6cf2] rounded-full" />
            {title}
          </h4>
          <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#0d6cf2]/40" />
          <div className="w-3 h-3 rounded-full bg-[#0d6cf2]" />
        </div>
      </div>

      <div className="mb-4 px-2 flex items-center justify-between text-[11px] text-slate-500">
        <span className="text-3xl">Total</span>
        <span className="font-bold text-3xl text-white ">{displayValue}</span>
      </div>

      <div className="flex-1 flex items-end justify-between gap-6 px-4 pb-4">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
            Loading chart...
          </div>
        ) : !hasData ? (
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
            No revenue data available
          </div>
        ) : (
          normalizedData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-1 group h-full justify-end"
            >
              <div
                className={`w-full rounded-t-lg transition-all duration-300 relative ${
                  index === latestIndex
                    ? "bg-[#0d6cf2] shadow-lg shadow-[#0d6cf2]/20"
                    : "bg-[#0d6cf2]/20 group-hover:bg-[#0d6cf2]/40"
                }`}
                style={{ height: `${Math.max(item.percentage, 8)}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/95 text-xs text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ${item.amount.toLocaleString()}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase mt-4 ${index === latestIndex ? "text-white" : "text-slate-500"}`}
              >
                {item.label}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
