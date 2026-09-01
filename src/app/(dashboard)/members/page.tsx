"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Member, MembersStats } from "@/types/member";
import { MembersStatsCards } from "@/components/members/MembersStatsCards";
import { MembersTable } from "@/components/members/MembersTable";
import { AddMemberModal } from "@/components/members/AddMemberModal";
import type { NewMemberFormState } from "@/components/members/AddMemberModal";
import { useAuth } from "@/lib/auth-context";
import {
  getMembers,
  createMember,
  calculateMemberStatus,
} from "@/lib/member-service";
import { getPlanDisplayPrice, getPlanPrice } from "@/lib/pricing-config";
import type { Member as SupabaseMember } from "@/lib/member-service";

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const { user } = useAuth();
  const gymId = user?.user_metadata?.gym_id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "inactive" | "expiring"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const defaultAvatar =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="#0d6cf2" /><text x="40" y="48" text-anchor="middle" font-size="22" font-family="Arial" fill="#ffffff">M</text></svg>`,
    );

  // Load members from Supabase on mount
  useEffect(() => {
    if (gymId) {
      fetchMembers();
    }
  }, [gymId]);

  // Apply filters when tab or search changes
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page
  }, [activeTab, searchQuery, allMembers]);

  const fetchMembers = async () => {
    if (!gymId) {
      console.error("[FETCH_MEMBERS] No gymId available");
      return;
    }

    setLoading(true);
    try {
      const result = await getMembers(gymId);
      if (result.success) {
        // Map Supabase members to UI format
        const mappedMembers: Member[] = result.members.map(
          (m: SupabaseMember) => {
            // Calculate proper status based on expiry date
            const calculatedStatus = calculateMemberStatus(
              m.status,
              m.membership_expiry,
            );

            return {
              id: m.id,
              name: m.name,
              email: m.email,
              phone: m.phone,
              memberId: m.id.slice(0, 8).toUpperCase(),
              avatar: defaultAvatar,
              membershipPlan:
                m.membership_type.charAt(0).toUpperCase() +
                m.membership_type.slice(1),
              membershipCost: `$${getPlanPrice(
                m.membership_type as "starter" | "pro" | "elite",
              )} / month`,
              status: calculatedStatus,
              expiryDate: new Date(m.membership_expiry).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                },
              ),
            };
          },
        );
        setAllMembers(mappedMembers);
      }
    } catch (error) {
      console.error("[FETCH_MEMBERS] Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allMembers];

    // Apply tab filter
    if (activeTab === "active") {
      filtered = filtered.filter((m) => m.status === "active");
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((m) => m.status === "inactive");
    } else if (activeTab === "expiring") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = filtered.filter((m) => {
        const expiryDate = new Date(m.expiryDate);
        return expiryDate <= thirtyDaysFromNow && m.status === "active";
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.phone?.toLowerCase().includes(query) ||
          m.memberId.toLowerCase().includes(query),
      );
    }

    setFilteredMembers(filtered);
  };

  const handleAddMember = async (formData: NewMemberFormState) => {
    if (!gymId) return;

    try {
      // Map modal form data to service format
      const name = formData.fullName || "";
      const email = formData.email || "";
      const phone = formData.phone || "";
      const membershipType = (
        formData.membershipPlan || "starter"
      ).toLowerCase() as "starter" | "pro" | "elite";

      await createMember(gymId, {
        name,
        email,
        phone,
        membership_type: membershipType,
      });
      toast.success("Member added successfully! ✅");
      setIsModalOpen(false);
      await fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const stats: MembersStats = {
    totalMembers: allMembers.length,
    activeNow: allMembers.filter((m) => m.status === "active").length,
    pendingRequests: allMembers.filter((m) => m.status === "pending").length,
    expiringSoon: allMembers.filter((m) => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiryDate = new Date(m.expiryDate);
      return expiryDate <= thirtyDaysFromNow && m.status === "active";
    }).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Members</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your gym members and memberships
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0d6cf2] hover:bg-[#0d6cf2]/90 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#0d6cf2]/20"
        >
          <span>➕</span>
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <MembersStatsCards stats={stats} />

      {/* Members Table */}
      <MembersTable
        members={paginatedMembers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
        allMembersCount={allMembers.length}
        onRefresh={fetchMembers}
        isLoading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredMembers.length)} of{" "}
            {filteredMembers.length} members
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-sm font-bold"
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-sm font-bold"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
}
