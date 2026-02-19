"use client";

interface BarData {
  month: string;
  percentage: number;
}

interface RevenueChartProps {
  title?: string;
  value?: string;
  subtitle?: string;
  data?: BarData[];
}

export const RevenueChart = ({
  title = "Monthly Revenue",
  value = "$45,200",
  subtitle = "total this month",
  data = [
    { month: "JAN", percentage: 60 },
    { month: "FEB", percentage: 40 },
    { month: "MAR", percentage: 75 },
    { month: "APR", percentage: 90 },
    { month: "MAY", percentage: 55 },
    { month: "JUN", percentage: 65 },
  ],
}: RevenueChartProps) => {
  return (
    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-2xl font-800 text-primary mt-1">
            {value}{" "}
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
        {data.map((item, index) => (
          <div
            key={index}
            className="w-full flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-full bg-slate-100 dark:bg-background-dark rounded-lg overflow-hidden flex flex-col justify-end h-full">
              <div
                className="bg-primary/40 group-hover:bg-primary transition-all rounded-t-lg"
                style={{ height: `${item.percentage}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
