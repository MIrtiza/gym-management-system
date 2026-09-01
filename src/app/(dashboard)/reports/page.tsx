"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { useAuth } from "@/lib/auth-context";
import {
  getReportData,
  type ReportRow,
  type ReportSummary,
} from "@/lib/report-service";

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const emptySummary: ReportSummary = {
  totalRevenue: 0,
  newMembers: 0,
  activeMemberships: 0,
  totalCheckins: 0,
  averageAttendanceRate: 0,
};

const exportReportToExcel = (rows: ReportRow[], start: string, end: string) => {
  if (!rows.length) return;

  const exportRows = rows.map((row) => ({
    Date: row.date,
    Revenue: row.revenue,
    "New Members": row.newMembers,
    "Total Check-ins": row.checkins,
    "Attendance Rate (%)": row.attendanceRate,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${start}_to_${end}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const { user, gymName } = useAuth();
  const gymId = user?.user_metadata?.gym_id;

  const today = new Date();
  const defaultEnd = toISODate(today);
  const defaultStart = toISODate(addDays(today, -29));

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [loading, setLoading] = useState(false);

  const loadReport = useCallback(async () => {
    if (!gymId) return;

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setLoading(true);
    try {
      const result = await getReportData(gymId, startDate, endDate);
      if (!result.success) {
        toast.error(result.error || "Failed to load report");
        return;
      }

      setRows(result.data.rows);
      setSummary(result.data.summary);
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [endDate, gymId, startDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleLast30Days = () => {
    const now = new Date();
    setEndDate(toISODate(now));
    setStartDate(toISODate(addDays(now, -29)));
  };

  const handleGenerateReport = () => {
    if (!rows.length) {
      toast.error("No report rows available to export");
      return;
    }

    exportReportToExcel(rows, startDate, endDate);
    toast.success("Report exported");
  };

  const revenueBars = useMemo(() => {
    const monthTotals = rows.reduce(
      (totals, row) => {
        const date = new Date(`${row.date}T00:00:00`);
        const label = date.toLocaleDateString("en-US", { month: "short" });
        totals[label] = (totals[label] ?? 0) + row.revenue;
        return totals;
      },
      {} as Record<string, number>,
    );

    const entries = Object.entries(monthTotals).slice(-6);
    const maxValue = Math.max(...entries.map(([, value]) => value), 1);

    return entries.map(([label, value]) => ({
      label,
      value,
      height: Math.max(8, Math.round((value / maxValue) * 100)),
    }));
  }, [rows]);

  const weeklyCheckins = useMemo(() => rows.slice(-7), [rows]);
  const maxWeeklyCheckins = Math.max(
    ...weeklyCheckins.map((row) => row.checkins),
    1,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight uppercase">
            Reports &amp; Analytics
          </h2>
          <p className="text-slate-500 mt-1">
            Live Supabase performance metrics for {gymName || "your gym"}.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-[0.7rem] uppercase tracking-widest">
                Start Date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 scheme-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-[0.7rem] uppercase tracking-widest">
                End Date
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 scheme-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLast30Days}
              className="flex items-center gap-2 bg-slate-900/80 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-slate-700 hover:bg-slate-800 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                calendar_month
              </span>
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={loadReport}
              disabled={loading || !gymId}
              className="flex items-center gap-2 bg-slate-900/80 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                sync
              </span>
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={!rows.length}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon="payments"
          label="Total Revenue"
          value={currencyFormatter.format(summary.totalRevenue)}
          note={`${startDate} to ${endDate}`}
        />
        <SummaryCard
          icon="person_add"
          label="New Member Signups"
          value={summary.newMembers.toString()}
          note="Selected range"
        />
        <SummaryCard
          icon="groups"
          label="Active Memberships"
          value={summary.activeMemberships.toString()}
          note="Current total"
        />
        <SummaryCard
          icon="fact_check"
          label="Attendance Rate"
          value={`${summary.averageAttendanceRate}%`}
          note={`${summary.totalCheckins} check-ins`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[420px]">
        <div className="bg-slate-900/70 p-8 rounded-xl border border-primary/10 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full" />
              Revenue by Month
            </h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Live payments
            </span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-6 px-4 pb-4">
            {revenueBars.length === 0 ? (
              <EmptyChartText>No revenue in this range.</EmptyChartText>
            ) : (
              revenueBars.map((bar) => (
                <div
                  key={bar.label}
                  className="flex flex-col items-center flex-1 group h-full justify-end"
                >
                  <div
                    className="w-full rounded-t-lg transition-all relative bg-primary/40 group-hover:bg-primary"
                    style={{ height: `${bar.height}%` }}
                  >
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-slate-800 text-white opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {currencyFormatter.format(bar.value)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase mt-4 text-slate-500">
                    {bar.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/70 p-8 rounded-xl border border-primary/10 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full" />
              Recent Check-ins
            </h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Last 7 rows
            </span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-4">
            {weeklyCheckins.length === 0 ? (
              <EmptyChartText>No check-ins in this range.</EmptyChartText>
            ) : (
              weeklyCheckins.map((row) => {
                const height = Math.max(
                  8,
                  Math.round((row.checkins / maxWeeklyCheckins) * 100),
                );
                const label = new Date(`${row.date}T00:00:00`).toLocaleDateString(
                  "en-US",
                  { weekday: "short" },
                );

                return (
                  <div
                    key={row.date}
                    className="flex flex-col items-center flex-1 group h-full justify-end"
                  >
                    <div
                      className="w-full rounded-t-lg transition-all relative bg-orange-500/35 group-hover:bg-orange-500"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-slate-800 text-white opacity-0 group-hover:opacity-100">
                        {row.checkins}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase mt-4 text-slate-500">
                      {label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-primary/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Daily Report Rows
          </h3>
          <span className="text-xs text-slate-500">{rows.length} days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20">
              <tr>
                {[
                  "Date",
                  "Revenue",
                  "New Members",
                  "Check-ins",
                  "Attendance Rate",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.slice(-10).map((row) => (
                <tr key={row.date} className="hover:bg-white/5">
                  <td className="px-6 py-3 text-sm font-semibold text-white">
                    {row.date}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-300">
                    {currencyFormatter.format(row.revenue)}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-300">
                    {row.newMembers}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-300">
                    {row.checkins}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-300">
                    {row.attendanceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-slate-900/70 p-6 rounded-xl border border-primary/10 shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <span className="text-slate-400 text-xs font-bold flex items-center bg-slate-400/10 px-2 py-1 rounded-full">
          {note}
        </span>
      </div>
      <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
    </div>
  );
}

function EmptyChartText({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full min-h-56 flex items-center justify-center text-sm text-slate-500">
      {children}
    </div>
  );
}
