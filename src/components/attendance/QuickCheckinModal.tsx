"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { getMembers, type Member } from "@/lib/member-service";
import { recordCheckIn } from "@/lib/checkin-service";

interface QuickCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: () => void;
}

export const QuickCheckinModal = ({
  isOpen,
  onClose,
  onCheckInSuccess,
}: QuickCheckinModalProps) => {
  const { user } = useAuth();
  const gymId = user?.user_metadata?.gym_id;

  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedInMembers, setCheckedInMembers] = useState<string[]>([]);

  // Fetch all members on modal open
  useEffect(() => {
    if (isOpen && gymId) {
      fetchMembers();
    } else {
      setSearchQuery("");
      setCheckedInMembers([]);
    }
  }, [isOpen, gymId]);

  const fetchMembers = async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const result = await getMembers(gymId);
      if (result.success) {
        // Filter to only active members
        const activeMembers = result.members.filter(
          (m) => m.status === "active",
        );
        setMembers(activeMembers);
        setFilteredMembers(activeMembers);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  // Filter members based on search query
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setFilteredMembers(members);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const filtered = members.filter(
        (member) =>
          member.name.toLowerCase().includes(lowerQuery) ||
          member.email.toLowerCase().includes(lowerQuery) ||
          member.phone.includes(query),
      );

      setFilteredMembers(filtered);
    },
    [members],
  );

  // Handle check-in
  const handleCheckIn = async (memberId: string, memberName: string) => {
    if (!gymId) return;

    try {
      await recordCheckIn(gymId, memberId);
      setCheckedInMembers((prev) => [...prev, memberId]);
      toast.success(`✓ ${memberName} checked in successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setCheckedInMembers((prev) => prev.filter((id) => id !== memberId));
      }, 3000);

      // Trigger parent refresh if callback provided
      onCheckInSuccess?.();
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error(`Failed to check in ${memberName}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start flex-shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-primary text-3xl">⚡</span>
              Quick Check-in
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Search and check in members
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-xl leading-none hover:bg-slate-800 p-2 rounded"
            aria-label="Close quick check-in"
          >
            ×
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 pb-2 flex-shrink-0 border-b border-slate-800">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 group-focus-within:text-primary transition-colors">
                🔍
              </span>
            </div>
            <input
              className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
              placeholder="Search members by name, email, or phone..."
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Showing {filteredMembers.length} active member(s)
          </p>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">
                {searchQuery
                  ? "No members found matching your search"
                  : "No active members available"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const isCheckedIn = checkedInMembers.includes(member.id);

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isCheckedIn
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-slate-800/30 hover:bg-slate-800/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full flex-shrink-0 overflow-hidden border-2 border-slate-700 flex items-center justify-center bg-primary/20">
                        <span className="text-lg font-bold text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Member Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-base leading-tight truncate">
                          {member.name}
                        </p>
                        <p className="text-slate-400 text-xs font-medium">
                          {member.membership_type.charAt(0).toUpperCase() +
                            member.membership_type.slice(1)}{" "}
                          • {member.email}
                        </p>
                        {member.phone && (
                          <p className="text-slate-500 text-xs">
                            {member.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Check-in Button */}
                    <button
                      onClick={() => handleCheckIn(member.id, member.name)}
                      disabled={isCheckedIn}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex-shrink-0 ml-4 ${
                        isCheckedIn
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                          : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                      }`}
                    >
                      {isCheckedIn ? "✓" : "Check In"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex-shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
