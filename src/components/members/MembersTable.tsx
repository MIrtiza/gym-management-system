"use client";

import { Member } from "@/types/member";
import * as XLSX from "xlsx";
import { useRef, useState } from "react";

interface MembersTableProps {
  members: Member[];
  onAddMember?: () => void;
  onImportMembers?: (imported: Member[]) => void;
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

export const MembersTable = ({
  members,
  onAddMember,
  onImportMembers,
}: MembersTableProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportMembersToExcel = () => {
    const exportRows = members.map((m) => ({
      Name: m.name,
      Email: m.email,
      "Member ID": m.memberId,
      "Avatar URL": m.avatar,
      "Membership Plan": m.membershipPlan,
      "Membership Cost": m.membershipCost,
      Status: m.status,
      "Expiry Date": m.expiryDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const normalizeStatus = (raw: unknown): Member["status"] => {
    const s = String(raw ?? "")
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, " ");
    if (!s) return "pending";
    if (s === "active") return "active";
    if (s === "inactive") return "inactive";
    if (s.includes("expiring") || s.includes("expiring soon")) {
      return "expiring-soon";
    }
    if (s.includes("pending")) return "pending";
    return "pending";
  };

  const formatExpiry = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "";
    if (value instanceof Date) {
      return value.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    if (typeof value === "number") {
      // Excel serial date -> y/m/d
      type ParseDateCodeResult = { y: number; m: number; d: number };
      const ssf = (XLSX as unknown as {
        SSF?: { parse_date_code?: (x: number) => ParseDateCodeResult };
      }).SSF;
      const parsed = ssf?.parse_date_code?.(value);
      if (parsed) {
        const date = new Date(parsed.y, parsed.m - 1, parsed.d);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      }
    }
    return String(value);
  };

  const parseMembersFromExcel = (workbook: XLSX.WorkBook): Member[] => {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    const defaultAvatar =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="#0d6cf2" /><text x="40" y="48" text-anchor="middle" font-size="22" font-family="Arial" fill="#ffffff">M</text></svg>`,
      );

    return rows
      .map((row, index) => {
        const keyMap: Record<string, unknown> = {};
        Object.keys(row).forEach((k) => {
          keyMap[normalizeKey(k)] = row[k];
        });

        const name = String(keyMap[normalizeKey("Name")] ?? "");
        const email = String(keyMap[normalizeKey("Email")] ?? "");
        const memberId =
          String(
            keyMap[normalizeKey("Member ID")] ??
              keyMap[normalizeKey("MemberId")] ??
              keyMap[normalizeKey("MemberID")] ??
              "",
          );
        const avatar =
          String(
            keyMap[normalizeKey("Avatar URL")] ??
              keyMap[normalizeKey("Avatar")] ??
              defaultAvatar,
          );
        const membershipPlan =
          String(keyMap[normalizeKey("Membership Plan")] ?? "");
        const membershipCost =
          String(keyMap[normalizeKey("Membership Cost")] ?? "");
        const status = normalizeStatus(keyMap[normalizeKey("Status")] ?? "");
        const expiryDate = formatExpiry(
          keyMap[normalizeKey("Expiry Date")] ?? "",
        );

        if (!name && !memberId) return null;

        return {
          id: memberId ? memberId : `m_${Date.now()}_${index}`,
          name: String(name || "").trim() || `Member ${index + 1}`,
          email: String(email || "").trim(),
          memberId: String(memberId || `#IC-NEW-${Date.now()}-${index}`),
          avatar: String(avatar || defaultAvatar),
          membershipPlan: String(membershipPlan || "Standard"),
          membershipCost: String(membershipCost || ""),
          status,
          expiryDate: String(expiryDate || ""),
        } as Member;
      })
      .filter(Boolean) as Member[];
  };

  const importMembersFromExcelFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const imported = parseMembersFromExcel(workbook);
    onImportMembers?.(imported);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel =
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls");

    if (!isExcel) {
      alert("Please upload an .xlsx or .xls Excel file.");
      e.target.value = "";
      return;
    }

    try {
      await importMembersFromExcelFile(file);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unknown import error";
      alert(`Failed to import Excel: ${msg}`);
    } finally {
      e.target.value = "";
    }
  };

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2d333d] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d333d] transition-colors"
          >
            <span>⬆️</span>
            Import (.xlsx)
          </button>
          <button
            type="button"
            onClick={exportMembersToExcel}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2d333d] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d333d] transition-colors"
          >
            <span>⬇️</span>
            Export (.xlsx)
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
                    <div className="size-10 rounded-full border border-slate-200 dark:border-[#2d333d] overflow-hidden bg-slate-100 dark:bg-[#2d333d]">
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
      <div className="px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a]/50 border-t border-slate-200 dark:border-[#2d333d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 font-medium">Showing</p>
          <select className="bg-white dark:bg-[#1a1d23] border border-slate-200 dark:border-[#2d333d] rounded-md text-xs py-1 pl-2 pr-8 font-bold focus:ring-primary focus:border-primary transition-all">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <p className="text-xs text-slate-500 font-medium">of 2,842 members</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2d333d] text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2d333d] transition-all disabled:opacity-50"
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
