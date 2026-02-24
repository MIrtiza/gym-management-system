"use client";

import { MembersStats } from "@/types/member";

interface MembersStatsCardsProps {
  stats: MembersStats;
}

export const MembersStatsCards = ({ stats }: MembersStatsCardsProps) => {
  const statItems = [
    {
      label: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      change: "+12%",
      changeColor: "text-emerald-500",
    },
    {
      label: "Active Now",
      value: stats.activeNow,
      change: "+5%",
      changeColor: "text-emerald-500",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      change: "New",
      changeColor: "text-amber-500",
    },
    {
      label: "Expiring Soon",
      value: stats.expiringSoon,
      change: "-2%",
      changeColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-[#1a1d23] p-6 rounded-xl border border-slate-200 dark:border-[#2d333d]"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
            {item.label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold tracking-tight">
              {item.value}
            </h3>
            <span className={`${item.changeColor} text-xs font-bold`}>
              {item.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
