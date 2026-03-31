"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface ReportRow {
  date: string;
  revenue: number;
  newMembers: number;
  checkins: number;
  attendanceRate: number;
}

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const buildReportRows = (start: string, end: string): ReportRow[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [];
  }

  const rows: ReportRow[] = [];
  let i = 0;
  for (
    let d = new Date(startDate.getTime());
    d <= endDate;
    d = addDays(d, 1), i++
  ) {
    const dayOfWeek = d.getDay(); // 0-6
    const baseRevenue = 1200 + (i % 10) * 50;
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : 1;
    const revenue = Math.round(baseRevenue * weekendBoost);

    const baseNewMembers = 2 + (i % 3);
    const newMembers =
      dayOfWeek === 5 || dayOfWeek === 6 ? baseNewMembers + 3 : baseNewMembers;

    const baseCheckins = 80 + (i % 15) * 3;
    const checkins = dayOfWeek === 1 ? baseCheckins + 40 : baseCheckins;

    const attendanceRate =
      60 + ((checkins / 160) * 40 + (dayOfWeek === 1 ? 5 : 0));

    rows.push({
      date: toISODate(d),
      revenue,
      newMembers,
      checkins,
      attendanceRate: Number(attendanceRate.toFixed(1)),
    });
  }

  return rows;
};

const exportReportToExcel = (rows: ReportRow[], start: string, end: string) => {
  if (!rows.length) return;

  const exportRows = rows.map((r) => ({
    Date: r.date,
    Revenue: r.revenue,
    "New Members": r.newMembers,
    "Total Check-ins": r.checkins,
    "Attendance Rate (%)": r.attendanceRate,
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
  const today = new Date();
  const defaultEnd = toISODate(today);
  const defaultStart = toISODate(addDays(today, -29));

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);

  const handleLast30Days = () => {
    const now = new Date();
    setEndDate(toISODate(now));
    setStartDate(toISODate(addDays(now, -29)));
  };

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    const rows = buildReportRows(startDate, endDate);
    if (!rows.length) {
      alert("No data available for the selected range.");
      return;
    }

    exportReportToExcel(rows, startDate, endDate);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight uppercase">
            Reports &amp; Analytics
          </h2>
          <p className="text-slate-500 mt-1">
            Real-time performance metrics for Iron Obsidian Gym.
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
                onChange={(e) => setStartDate(e.target.value)}
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
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 scheme-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLast30Days}
              className="flex items-center gap-2 bg-slate-900/80 dark:bg-slate-900/80 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-slate-700 hover:bg-slate-800 transition-all"
            >
              <span>📅</span>
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
            >
              <span>⬇️</span>
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-slate-900/70 dark:bg-slate-900/70 p-6 rounded-xl border border-primary/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 -mr-8 -mt-8 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span>💳</span>
            </div>
            <span className="text-emerald-400 text-xs font-bold flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
              <span className="mr-1">📈</span> +12.5%
            </span>
          </div>
          <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
            Total Revenue (Monthly)
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-1">
            $42,850.00
          </h3>
        </div>

        {/* New Members */}
        <div className="bg-slate-900/70 dark:bg-slate-900/70 p-6 rounded-xl border border-primary/10 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span>➕</span>
            </div>
            <span className="text-primary text-xs font-bold flex items-center bg-primary/10 px-2 py-1 rounded-full">
              This Month
            </span>
          </div>
          <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
            New Member Signups
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-1">128</h3>
        </div>

        {/* Active Memberships */}
        <div className="bg-slate-900/70 dark:bg-slate-900/70 p-6 rounded-xl border border-primary/10 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span>👥</span>
            </div>
            <span className="text-slate-400 text-xs font-bold flex items-center bg-slate-400/10 px-2 py-1 rounded-full">
              94% Active
            </span>
          </div>
          <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
            Active Memberships
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-1">1,402</h3>
        </div>

        {/* Attendance Rate */}
        <div className="bg-slate-900/70 dark:bg-slate-900/70 p-6 rounded-xl border border-primary/10 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span>✅</span>
            </div>
            <span className="text-orange-400 text-xs font-bold flex items-center bg-orange-400/10 px-2 py-1 rounded-full">
              <span className="mr-1">⏱</span> Avg. Daily
            </span>
          </div>
          <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
            Attendance Rate
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-1">78.4%</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[420px]">
        {/* Monthly Revenue Trends - bar chart mock */}
        <div className="bg-slate-900/70 dark:bg-slate-900/70 p-8 rounded-xl border border-primary/10 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full" />
              Monthly Revenue Trends
            </h4>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/40" />
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-6 px-4 pb-4">
            {[
              { label: "Jan", height: "40%", value: "$28k" },
              { label: "Feb", height: "55%", value: "$32k" },
              { label: "Mar", height: "48%", value: "" },
              { label: "Apr", height: "72%", value: "" },
              { label: "May", height: "85%", value: "" },
              { label: "Jun", height: "95%", value: "$42k", highlight: true },
            ].map((bar) => (
              <div
                key={bar.label}
                className="flex flex-col items-center flex-1 group h-full justify-end"
              >
                <div
                  className={`w-full rounded-t-lg transition-all relative ${
                    bar.highlight ? "bg-primary shadow-lg shadow-primary/20" : "bg-primary/20 group-hover:bg-primary/40"
                  }`}
                  style={{ height: bar.height }}
                >
                  {bar.value && (
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded ${
                        bar.highlight
                          ? "bg-primary text-white shadow-lg"
                          : "bg-slate-800 text-white opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {bar.value}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase mt-4 ${
                    bar.highlight ? "text-white" : "text-slate-500"
                  }`}
                >
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Member Check-ins (Weekly) - line chart mock */}
        <div className="bg-slate-900/70 dark:bg-slate-900/70 p-8 rounded-xl border border-primary/10 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full" />
              Member Check-ins (Weekly)
            </h4>
            <select className="bg-transparent border-none text-[10px] font-bold text-slate-400 uppercase tracking-widest focus:ring-0 cursor-pointer">
              <option>Current Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 400 200"
            >
              <defs>
                <linearGradient
                  id="reportsLineGradient"
                  x1="0%"
                  x2="0%"
                  y1="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "rgba(13,108,242,0.4)" }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "rgba(13,108,242,0)" }}
                  />
                </linearGradient>
              </defs>
              {/* grid */}
              <line
                x1="0"
                y1="50"
                x2="400"
                y2="50"
                stroke="#2d3846"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="100"
                x2="400"
                y2="100"
                stroke="#2d3846"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="150"
                x2="400"
                y2="150"
                stroke="#2d3846"
                strokeWidth="0.5"
              />
              {/* area */}
              <path
                d="M0,180 L50,140 L100,160 L150,100 L200,120 L250,60 L300,90 L350,40 L400,70 L400,200 L0,200 Z"
                fill="url(#reportsLineGradient)"
              />
              {/* line */}
              <path
                d="M0,180 L50,140 L100,160 L150,100 L200,120 L250,60 L300,90 L350,40 L400,70"
                fill="none"
                stroke="#0d6cf2"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* key points */}
              <circle cx="250" cy="60" r="4" fill="#0d6cf2" />
              <circle cx="350" cy="40" r="4" fill="#0d6cf2" />
            </svg>
            <div className="flex justify-between mt-6">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span
                  key={d}
                  className="text-[10px] font-bold text-slate-500 uppercase"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest flex justify-between items-center">
        <span>© 2024 IRON OBSIDIAN CORE SYSTEMS</span>
        <div className="flex gap-6">
          <button className="hover:text-primary transition-colors">
            Privacy
          </button>
          <button className="hover:text-primary transition-colors">
            Audit Logs
          </button>
          <button className="hover:text-primary transition-colors">
            Support ID: 0922-XR
          </button>
        </div>
      </div>
    </div>
  );
}

