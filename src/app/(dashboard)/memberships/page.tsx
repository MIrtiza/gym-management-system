"use client";

import { useMemo, useState } from "react";

type PlanKey = "starter" | "pro" | "elite";

interface Plan {
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
  memberId: string;
  plan: PlanKey;
  status: "active" | "inactive";
}

const initialPlans: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    price: "$49",
    cycle: "/mo",
    badge: "Entry Level",
    features: [
      "Full gym access except sohana bath and steam bath",
      "Standard support from coach",
      "Cardio exercise",
      "Locker access",
      "Washroom access",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$129",
    cycle: "/3mo",
    badge: "Most Popular",
    features: [
      "Full gym access",
      "Sohana bath access",
      "Steam bath access",
      "Clean towel",
      "Standard support",
      "Cardio",
      "Locker",
      "Washroom",
    ],
  },
  {
    key: "elite",
    name: "Elite",
    price: "$499",
    cycle: "/year",
    badge: "Premium Access",
    highlighted: true,
    features: [
      "Full gym access",
      "Sohana bath access",
      "Steam bath access",
      "Clean towel",
      "Standard support",
      "Cardio",
      "Locker",
      "Washroom",
      "Personal trainer",
    ],
  },
];

export default function MembershipsPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [members, setMembers] = useState<MemberPlanRow[]>([
    {
      id: "1",
      name: "Marcus Thompson",
      memberId: "#IC-4820",
      plan: "starter",
      status: "active",
    },
    {
      id: "2",
      name: "Elena Rodriguez",
      memberId: "#IC-4821",
      plan: "pro",
      status: "active",
    },
    {
      id: "3",
      name: "Jordan Smith",
      memberId: "#IC-4825",
      plan: "elite",
      status: "active",
    },
    {
      id: "4",
      name: "David Miller",
      memberId: "#IC-4902",
      plan: "pro",
      status: "inactive",
    },
  ]);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanKey>("starter");

  const editingMember = useMemo(
    () => members.find((m) => m.id === editingMemberId) ?? null,
    [editingMemberId, members],
  );

  const planNameByKey = (key: PlanKey) =>
    plans.find((p) => p.key === key)?.name ?? key;

  const removePlan = (plan: Plan) => {
    if (plans.length <= 1) {
      alert("At least one plan must remain.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${plan.name} plan? Members on this plan will be moved to Starter.`,
    );
    if (!confirmed) return;

    setPlans((prev) => prev.filter((p) => p.key !== plan.key));
    setMembers((prev) =>
      prev.map((m) => (m.plan === plan.key ? { ...m, plan: "starter" } : m)),
    );

    if (editingMemberId) {
      const editing = members.find((m) => m.id === editingMemberId);
      if (editing?.plan === plan.key) {
        setEditingPlan("starter");
      }
    }
  };

  const openEditPlan = (member: MemberPlanRow) => {
    setEditingMemberId(member.id);
    setEditingPlan(member.plan);
  };

  const saveEditedPlan = () => {
    if (!editingMemberId) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === editingMemberId ? { ...m, plan: editingPlan } : m,
      ),
    );
    setEditingMemberId(null);
  };

  const removeMember = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Remove ${name} from memberships? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight">
            Membership Plans
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Configure and manage your membership tiers and pricing
          </p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <span>➕</span>
          Create Plan
        </button>
      </header>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`flex flex-col rounded-xl overflow-hidden transition-all duration-300 ${
              plan.highlighted
                ? "bg-white dark:bg-[#1b2027] border-2 border-primary/50 shadow-[0_0_20px_rgba(13,108,242,0.15)]"
                : "bg-white dark:bg-[#1b2027] border border-slate-200 dark:border-[#3b4554] hover:border-slate-300 dark:hover:border-slate-500"
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
                <span>
                  {plan.highlighted ? "🏆" : plan.key === "pro" ? "💪" : "⚡"}
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
                  <span className="text-primary text-xl leading-5">✔</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-8 space-y-2">
              <button className="w-full bg-slate-200 dark:bg-[#282f39] hover:bg-slate-300 dark:hover:bg-[#343d4a] text-slate-800 dark:text-white py-3 rounded-lg font-bold text-sm transition-all">
                Edit Plan
              </button>
              <button
                type="button"
                onClick={() => removePlan(plan)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-lg font-bold text-sm transition-all border border-red-500/20"
              >
                Delete Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Plans Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Member Plan Management
          </h3>
          <p className="text-xs text-slate-500">
            Edit member plan assignments or remove members.
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#2d333d]">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#222831]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm">{member.name}</p>
                        <p className="text-xs text-slate-500">
                          ID: {member.memberId}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">
                        {planNameByKey(member.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          member.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500"
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
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-[#3b4554] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2b3340]"
                        >
                          Edit Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id, member.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          Remove Member
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Edit Plan Modal */}
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
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Select Plan
              </label>
              <select
                value={editingPlan}
                onChange={(e) => setEditingPlan(e.target.value as PlanKey)}
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
                className="px-4 py-2 rounded-lg text-sm font-bold bg-[#0d6cf2] text-white hover:bg-primary/90"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
