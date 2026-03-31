"use client";

import { useState } from "react";
import type { Member, MembersStats } from "@/types/member";
import { MembersStatsCards } from "@/components/members/MembersStatsCards";
import { MembersTable } from "@/components/members/MembersTable";
import { AddMemberModal } from "@/components/members/AddMemberModal";
import type { NewMemberFormState } from "@/components/members/AddMemberModal";
import { mockMembers } from "@/lib/data/members";

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>(mockMembers);

  const defaultAvatar =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="#0d6cf2" /><text x="40" y="48" text-anchor="middle" font-size="22" font-family="Arial" fill="#ffffff">M</text></svg>`,
    );

  const computeStats = (list: Member[]): MembersStats => ({
    totalMembers: list.length,
    activeNow: list.filter((m) => m.status === "active").length,
    pendingRequests: list.filter((m) => m.status === "pending").length,
    expiringSoon: list.filter((m) => m.status === "expiring-soon").length,
  });

  const stats = computeStats(members);

  const formatExpiryDateFromStart = (startDate: string) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    if (Number.isNaN(date.getTime())) return "";
    // Default to ~1 month membership period for new members
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleAddMember = (data: NewMemberFormState) => {
    const name = String(data?.fullName ?? "").trim();
    if (!name) return;

    const planKey = String(data?.membershipPlan ?? "");
    const planMap: Record<string, { plan: string; cost: string }> = {
      starter: { plan: "Starter Plan", cost: "$29 / month" },
      pro: { plan: "Pro Plan", cost: "$59 / month" },
      elite: { plan: "Elite Plan", cost: "$99 / month" },
    };

    const plan = planMap[planKey] ?? { plan: "Standard", cost: "" };
    const startDate = String(data?.startDate ?? "");

    const baseMemberId = `#IC-${Math.floor(1000 + Math.random() * 9000)}`;
    const uniqueMemberId =
      members.some((m) => m.memberId === baseMemberId)
        ? `#IC-${Date.now()}`
        : baseMemberId;

    const newMember: Member = {
      id: uniqueMemberId,
      name,
      email: String(data?.email ?? "").trim(),
      memberId: uniqueMemberId,
      avatar: defaultAvatar,
      membershipPlan: plan.plan,
      membershipCost: plan.cost,
      status: "active",
      expiryDate: formatExpiryDateFromStart(startDate),
    };

    setMembers((prev) => [newMember, ...prev]);
  };

  const handleImportMembers = (imported: Member[]) => {
    setMembers((prev) => {
      const byId = new Map(prev.map((m) => [m.memberId, m] as const));
      for (const m of imported) {
        if (m.memberId && byId.has(m.memberId)) {
          const existing = byId.get(m.memberId)!;
          byId.set(m.memberId, { ...existing, ...m, id: existing.id });
        } else {
          byId.set(m.memberId, m);
        }
      }
      return Array.from(byId.values());
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-800 tracking-tight">
            Members Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage gym members, memberships, and check-ins.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0d6cf2] hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/20 w-fit"
        >
          <span>✓</span>
          Add New Member
        </button>
      </div>

      {/* Stats Cards */}
      <MembersStatsCards stats={stats} />

      {/* Members Table */}
      <MembersTable
        members={members}
        onAddMember={() => setIsModalOpen(true)}
        onImportMembers={handleImportMembers}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
}
