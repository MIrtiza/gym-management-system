"use client";

import { useState } from "react";
import { MembersStatsCards } from "@/components/members/MembersStatsCards";
import { MembersTable } from "@/components/members/MembersTable";
import { AddMemberModal } from "@/components/members/AddMemberModal";
import { mockMembers, mockMembersStats } from "@/lib/data/members";

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMember = (data: any) => {
    console.log("Processing member:", data);
    // Handle member addition here
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
      <MembersStatsCards stats={mockMembersStats} />

      {/* Members Table */}
      <MembersTable
        members={mockMembers}
        onAddMember={() => setIsModalOpen(true)}
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
