"use client";

import { Member } from "@/types/member";
import { useState } from "react";

interface MembersTableProps {
  members: Member[];
  onAddMember?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500";
    case "expiring-soon":
      return "bg-amber-500/10 text-amber-500";
    case "inactive":
      return "bg-slate-500/10 text-slate-500";
    case "pending":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-slate-500/10 text-slate-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "expiring-soon":
      return "Expiring Soon";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const MembersTable = ({ members, onAddMember }: MembersTableProps) => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = ["All Members", "Active", "Inactive", "Pending"];

  return (
    <div className="bg-white dark:bg-[#1a1d23] rounded-xl border border-slate-200 dark:border-[#2d333d] overflow-hidden flex flex-col shadow-sm">
      {/* Table Header/Tabs */}
      <div className="px-6 pt-6 flex items-center justify-between border-b border-slate-200 dark:border-[#2d333d]">
        <div className="flex gap-8">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-4 border-b-2 text-sm font-bold transition-all ${
                (index === 0 && activeTab === "all") ||
                activeTab === tab.toLowerCase()
                  ? "border-primary text-[#0d6cf2]"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="pb-4 flex gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2d333d] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d333d] transition-colors">
            <span>🔍</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2d333d] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d333d] transition-colors">
            <span>⬇️</span>
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-[#0a0a0a]/50">
            <tr>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Member
              </th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Membership Plan
              </th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Expiry Date
              </th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-slate-50 dark:hover:bg-background-dark/30 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full border border-slate-200 dark:border-[#2d333d] overflow-hidden bg-slate-100 dark:bg-[#2d333d]\">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500">
                        ID: {member.memberId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {member.membershipPlan}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {member.membershipCost}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      member.status,
                    )}`}
                  >
                    {member.status === "active" && (
                      <span className="size-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    )}
                    {getStatusLabel(member.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {member.expiryDate}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-border-dark text-slate-400 hover:text-primary transition-all">
                      👁️
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-border-dark text-slate-400 hover:text-primary transition-all">
                      ✏️
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-border-dark text-slate-400 hover:text-primary transition-all">
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a]/50 border-t border-slate-200 dark:border-[#2d333d] flex items-center justify-between\">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 font-medium">Showing</p>
          <select className="bg-white dark:bg-[#1a1d23] border border-slate-200 dark:border-[#2d333d] rounded-md text-xs py-1 pl-2 pr-8 font-bold focus:ring-primary focus:border-primary transition-all\">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <p className="text-xs text-slate-500 font-medium">of 2,842 members</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2d333d] text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2d333d] transition-all disabled:opacity-50\"
            disabled
          >
            ❮
          </button>
          <button className="size-8 flex items-center justify-center rounded-lg bg-[#0d6cf2] text-white text-xs font-extrabold transition-all">
            1
          </button>
          <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2d333d] text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#2d333d] transition-all">
            2
          </button>
          <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2d333d] text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#2d333d] transition-all">
            3
          </button>
          <span className="text-slate-400 px-1">...</span>
          <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2d333d] text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#2d333d] transition-all">
            28
          </button>
          <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2d333d] text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2d333d] transition-all">
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};
