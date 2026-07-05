"use client";

import { Member } from "@/types/member";
import type { MembersStats } from "@/types/member";
import * as XLSX from "xlsx";
import { useRef, useState } from "react";
import { updateMember, deleteMember } from "@/lib/member-service";
import toast from "react-hot-toast";

interface MembersTableProps {
  members: Member[];
  onAddMember?: () => void;
  onImportMembers?: (imported: Member[]) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeTab?: "all" | "active" | "inactive" | "expiring";
  onTabChange?: (tab: "all" | "active" | "inactive" | "expiring") => void;
  stats?: MembersStats;
  allMembersCount?: number;
  onRefresh?: () => void;
  isLoading?: boolean;
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
  searchQuery = "",
  onSearchChange,
  activeTab = "all",
  onTabChange,
  stats,
  allMembersCount = 0,
  onRefresh,
  isLoading = false,
}: MembersTableProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Member>>({});
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handlers
  const handleViewMember = (member: Member) => {
    setViewingMember(member);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setEditFormData({ ...member });
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;

    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {};

      if (editFormData.name !== editingMember.name)
        updateData.name = editFormData.name;
      if (editFormData.email !== editingMember.email)
        updateData.email = editFormData.email;
      if (editFormData.membershipPlan !== editingMember.membershipPlan)
        updateData.membership_type = editFormData.membershipPlan;
      if (editFormData.status !== editingMember.status)
        updateData.status = editFormData.status;
      if (editFormData.expiryDate !== editingMember.expiryDate)
        updateData.membership_expiry = editFormData.expiryDate;

      await updateMember(editingMember.id, updateData as any);

      toast.success("Member updated successfully!");
      setEditingMember(null);
      setEditFormData({});
      onImportMembers?.([...members]); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to update member: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    setDeletingMemberId(memberId);
  };

  const confirmDelete = async () => {
    if (!deletingMemberId) return;

    setIsDeleting(true);
    try {
      await deleteMember(deletingMemberId);
      toast.success("Member deleted successfully!");
      setDeletingMemberId(null);
      onImportMembers?.([...members.filter((m) => m.id !== deletingMemberId)]); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to delete member: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

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
      const ssf = (
        XLSX as unknown as {
          SSF?: { parse_date_code?: (x: number) => ParseDateCodeResult };
        }
      ).SSF;
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
        const memberId = String(
          keyMap[normalizeKey("Member ID")] ??
            keyMap[normalizeKey("MemberId")] ??
            keyMap[normalizeKey("MemberID")] ??
            "",
        );
        const avatar = String(
          keyMap[normalizeKey("Avatar URL")] ??
            keyMap[normalizeKey("Avatar")] ??
            defaultAvatar,
        );
        const membershipPlan = String(
          keyMap[normalizeKey("Membership Plan")] ?? "",
        );
        const membershipCost = String(
          keyMap[normalizeKey("Membership Cost")] ?? "",
        );
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const msg = err instanceof Error ? err.message : "Unknown import error";
      alert(`Failed to import Excel: ${msg}`);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1a1d23] rounded-xl border border-slate-200 dark:border-[#2d333d] overflow-hidden flex flex-col shadow-sm mt-8">
        {/* Table Header */}
        <div className="px-6 py-4 space-y-4 border-b border-slate-200 dark:border-[#2d333d]">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {["all", "active", "inactive", "expiring"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange?.(tab as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    activeTab === tab
                      ? "bg-[#0d6cf2] text-white"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "all" && ` (${allMembersCount})`}
                  {tab === "active" && ` (${stats?.activeNow || 0})`}
                  {tab === "inactive" &&
                    ` (${(allMembersCount || 0) - (stats?.activeNow || 0)})`}
                  {tab === "expiring" && ` (${stats?.expiringSoon || 0})`}
                </button>
              ))}
            </div>

            <div className="flex">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
              >
                <span className={isLoading ? "animate-spin" : ""}>🔄</span>
                Refresh
              </button>
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
                  className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors group"
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
                        {member.phone && (
                          <p className="text-xs text-slate-500">
                            Phone: {member.phone}
                          </p>
                        )}
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewMember(member)}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-border-dark text-slate-400 hover:text-primary transition-all"
                        title="View member"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditMember(member)}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-border-dark text-slate-400 hover:text-primary transition-all"
                        title="Edit member"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all"
                        title="Delete member"
                      >
                        🗑️
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
            <p className="text-xs text-slate-500 font-medium">
              of 2,842 members
            </p>
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

      {/* View Member Modal */}
      {viewingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1d23] rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Member Details</h3>
              <button
                onClick={() => setViewingMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="size-16 rounded-full border-2 border-slate-200 dark:border-[#2d333d] overflow-hidden bg-slate-100 dark:bg-[#2d333d]">
                  <img
                    src={viewingMember.avatar}
                    alt={viewingMember.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Name
                </label>
                <p className="text-sm font-semibold">{viewingMember.name}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Email
                </label>
                <p className="text-sm">{viewingMember.email}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Member ID
                </label>
                <p className="text-sm">{viewingMember.memberId}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Membership Plan
                </label>
                <p className="text-sm">{viewingMember.membershipPlan}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Cost
                </label>
                <p className="text-sm">{viewingMember.membershipCost}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(
                    viewingMember.status,
                  )}`}
                >
                  {getStatusLabel(viewingMember.status)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Expiry Date
                </label>
                <p className="text-sm">{viewingMember.expiryDate}</p>
              </div>
            </div>

            <button
              onClick={() => setViewingMember(null)}
              className="w-full mt-6 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1d23] rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Edit Member</h3>
              <button
                onClick={() => {
                  setEditingMember(null);
                  setEditFormData({});
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-[#2d333d] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-[#2d333d] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Membership Plan
                </label>
                <select
                  value={editFormData.membershipPlan || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      membershipPlan: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-[#2d333d] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Status
                </label>
                <select
                  value={editFormData.status || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-[#2d333d] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expiring-soon">Expiring Soon</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={
                    editFormData.expiryDate
                      ? new Date(editFormData.expiryDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      expiryDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-[#2d333d] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setEditingMember(null);
                  setEditFormData({});
                }}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-[#0d6cf2] text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMemberId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1d23] rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Member?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this member? This action cannot be
              undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeletingMemberId(null)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
