"use client";

import { StatCard } from "@/components/common/StatCard";
import { RevenueChart } from "@/components/common/RevenueChart";
import { AttendanceChart } from "@/components/common/AttendanceChart";
import { RecentCheckinsTable } from "@/components/common/RecentCheckinsTable";

export default function Dashboard() {
  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-800 tracking-tight">System Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back. Here's what's happening today at IronCore.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-1 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
          <button className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white">
            Daily
          </button>
          <button className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-background-dark">
            Weekly
          </button>
          <button className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-background-dark">
            Monthly
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="👥"
          title="Total Members"
          value="1,240"
          trend={{ percentage: 2.4, isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          icon="✓"
          title="Active Members"
          value="980"
          trend={{ percentage: 0.8, isPositive: false }}
          accentColor="primary"
        />
        <StatCard
          icon="📝"
          title="Today's Attendance"
          value="145"
          trend={{ percentage: 12, isPositive: true }}
          accentColor="indigo"
        />
        <StatCard
          icon="⏳"
          title="Pending Payments"
          value="12"
          trend={{ percentage: 5, isPositive: false }}
          accentColor="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart />
        <AttendanceChart />
      </div>

      {/* Recent Activity Table */}
      <RecentCheckinsTable />
    </div>
  );
}
