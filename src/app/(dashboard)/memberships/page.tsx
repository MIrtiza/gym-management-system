"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import {
  deleteMember,
  getMembers,
  updateMember,
  type Member as SupabaseMember,
} from "@/lib/member-service";
import {
  getAllPlans,
  getPlanName,
  type MembershipPlanKey,
} from "@/lib/pricing-config";

type PlanKey = MembershipPlanKey;

interface PlanDisplay {
  key: PlanKey;
  name: string;
  price: string;
  cycle: string;
  badge: string;
  features: string[];
  highlighted?: boolean;
}

interface MemberPlanRow {
  id: string;
  name: string;
  email: string;
  memberId: string;
  plan: PlanKey;
  status: string;
  expiryDate: string;
}

const PLAN_DETAILS: Record<
  PlanKey,
  Pick<PlanDisplay, "badge" | "features" | "highlighted">
> = {
  starter: {
    badge: "Entry Level",
    features: [
      "Full gym access except sohana bath and steam bath",
      "Standard coach support",
      "Cardio exercise",
      "Locker access",
      "Washroom access",
    ],
  },
  pro: {
    badge: "Most Popular",
    features: [
      "Full gym access",
      "Sohana bath access",
      "Steam bath access",
      "Clean towel",
      "Standard support",
      "Cardio, locker, and washroom access",
    ],
  },
  elite: {
    badge: "Premium Access",
    highlighted: true,
    features: [
      "Full gym access",
      "Sohana bath access",
      "Steam bath access",
      "Clean towel",
      "Standard support",
      "Personal trainer",
    ],
  },
};

const formatDate = (value: string) => {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const isPlanKey = (value: string): value is PlanKey =>
  value === "starter" || value === "pro" || value === "elite";

export default function MembershipsPage() {
  const { user } = useAuth();
  const gymId = user?.user_metadata?.gym_id;

  const [members, setMembers] = useState<MemberPlanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanKey>("starter");

  const plans = useMemo<PlanDisplay[]>(
    () =>
      getAllPlans().map((plan) => ({
        key: plan.key,
        name: plan.name,
        price: `$${plan.monthlyPrice}`,
        cycle: "/month",
        ...PLAN_DETAILS[plan.key],
      })),
    [],
  );

  const fetchMembers = useCallback(async () => {
    if (!gymId) return;

    setLoading(true);
    try {
      const result = await getMembers(gymId);
      if (result.success) {
        const rows = result.members.map((member: SupabaseMember) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          memberId: `#${member.id.slice(0, 8).toUpperCase()}`,
          plan: isPlanKey(member.membership_type)
            ? member.membership_type
            : "starter",
          status: member.status,
          expiryDate: formatDate(member.membership_expiry),
        }));

        setMembers(rows);
      }
    } catch (error) {
      console.error("Error loading membership members:", error);
      toast.error("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    if (gymId) {
      fetchMembers();
    }
  }, [fetchMembers, gymId]);

  const editingMember = useMemo(
    () => members.find((member) => member.id === editingMemberId) ?? null,
    [editingMemberId, members],
  );

  const planCounts = useMemo(
    () =>
      members.reduce(
        (counts, member) => ({
          ...counts,
          [member.plan]: counts[member.plan] + 1,
        }),
        { starter: 0, pro: 0, elite: 0 } as Record<PlanKey, number>,
      ),
    [members],
  );

  const openEditPlan = (member: MemberPlanRow) => {
    setEditingMemberId(member.id);
    setEditingPlan(member.plan);
  };

  const saveEditedPlan = async () => {
    if (!editingMemberId) return;

    setSavingMemberId(editingMemberId);
    try {
      await updateMember(editingMemberId, { membership_type: editingPlan });
      setMembers((current) =>
        current.map((member) =>
          member.id === editingMemberId
            ? { ...member, plan: editingPlan }
            : member,
        ),
      );
      toast.success("Member plan updated");
      setEditingMemberId(null);
    } catch (error) {
      console.error("Error updating member plan:", error);
      toast.error("Failed to update member plan");
    } finally {
      setSavingMemberId(null);
    }
  };

  const removeMember = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Remove ${name} from this gym? This deletes the member record.`,
    );
    if (!confirmed) return;

    setSavingMemberId(id);
    try {
      await deleteMember(id);
      setMembers((current) => current.filter((member) => member.id !== id));
      toast.success("Member removed");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setSavingMemberId(null);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight">
            Membership Plans
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage plan assignments from live Supabase member records.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMembers}
          disabled={loading || !gymId}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`flex flex-col rounded-xl overflow-hidden transition-all duration-300 ${
              plan.highlighted
                ? "bg-white dark:bg-[#1b2027] border-2 border-primary/50 shadow-[0_0_20px_rgba(13,108,242,0.15)]"
                : "bg-white dark:bg-[#1b2027] border border-slate-200 dark:border-[#3b4554]"
            }`}
          >
            <div className="p-8 pb-4">
              <div
                className={`flex items-center gap-2 mb-4 ${
                  plan.highlighted
                    ? "text-primary"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {plan.highlighted
                    ? "workspace_premium"
                    : plan.key === "pro"
                      ? "fitness_center"
                      : "bolt"}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {plan.badge}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span
                  className={`text-4xl font-black tracking-tight ${
                    plan.highlighted
                      ? "text-primary"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {plan.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {plan.cycle}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-4">
                {planCounts[plan.key]} members assigned
              </p>
            </div>

            <div
              className={`px-8 py-6 flex flex-col gap-3 border-y border-slate-100 dark:border-[#3b4554] ${
                plan.highlighted
                  ? "bg-primary/10"
                  : "bg-slate-50/30 dark:bg-black/10"
              }`}
            >
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[18px] leading-5">
                    check_circle
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Member Plan Management
            </h3>
            <p className="text-xs text-slate-500">
              These rows come from the Supabase members table.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Total members: {members.length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1b2027] border border-slate-200 dark:border-[#3b4554] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-[#0a0a0a]/40">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Member
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Current Plan
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Expiry
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#2d333d]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      Loading memberships...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No members found for this gym.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#222831]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-sm">{member.name}</p>
                          <p className="text-xs text-slate-500">
                            {member.memberId} | {member.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold">
                          {getPlanName(member.plan)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {member.expiryDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            member.status === "active"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : member.status === "pending"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-slate-500/10 text-slate-500"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditPlan(member)}
                            disabled={savingMemberId === member.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-[#3b4554] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2b3340] disabled:opacity-50"
                          >
                            Edit Plan
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeMember(member.id, member.name)
                            }
                            disabled={savingMemberId === member.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1b2027] rounded-xl border border-slate-200 dark:border-[#3b4554] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#3b4554] flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold">Edit Member Plan</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingMember.name} ({editingMember.memberId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMemberId(null)}
                className="text-slate-400 hover:text-white"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Select Plan
              </label>
              <select
                value={editingPlan}
                onChange={(event) =>
                  setEditingPlan(event.target.value as PlanKey)
                }
                className="w-full bg-slate-50 dark:bg-[#282f39] border border-slate-200 dark:border-[#3b4554] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
              >
                {plans.map((plan) => (
                  <option key={plan.key} value={plan.key}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingMemberId(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedPlan}
                disabled={savingMemberId === editingMember.id}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-[#0d6cf2] text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {savingMemberId === editingMember.id
                  ? "Saving..."
                  : "Save Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
