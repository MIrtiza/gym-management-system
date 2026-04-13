"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { getMembers, type Member } from "@/lib/member-service";
import {
  recordPayment,
  checkMemberMonthlyPayment,
} from "@/lib/payment-service";
import {
  downloadPaymentSlip,
  type PaymentSlipData,
} from "@/lib/slip-generator";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PaymentFormState {
  memberId: string;
  membershipPlan: "basic" | "premium" | "vip";
  amount: string;
  notes: string;
  paymentDate: string;
}

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) => {
  const { user } = useAuth();
  const gymId = user?.user_metadata?.gym_id;

  const [form, setForm] = useState<PaymentFormState>({
    memberId: "",
    membershipPlan: "basic",
    amount: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [monthlyPaymentStatus, setMonthlyPaymentStatus] = useState<{
    hasPaid: boolean;
    lastPaymentDate: string | null;
  } | null>(null);

  // Membership plan prices
  const PLAN_PRICES: Record<string, number> = {
    basic: 99,
    premium: 149,
    vip: 199,
  };

  useEffect(() => {
    if (isOpen && gymId) {
      fetchMembers();
    }
  }, [isOpen, gymId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query),
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  // Check monthly payment when payment date changes
  useEffect(() => {
    if (form.memberId && gymId) {
      checkPaymentStatusForMonth();
    }
  }, [form.paymentDate, form.memberId, gymId]);

  const checkPaymentStatusForMonth = async () => {
    if (!form.memberId || !gymId) return;

    try {
      const result = await checkMemberMonthlyPayment(
        form.memberId,
        gymId,
        form.paymentDate,
      );
      if (result.success !== false) {
        setMonthlyPaymentStatus({
          hasPaid: !!result.hasPaidThisMonth,
          lastPaymentDate: result.lastPaymentDate,
        });
      } else {
        // If check failed, clear the status to allow payment
        setMonthlyPaymentStatus(null);
      }
    } catch (error) {
      console.error("Error checking payment for month:", error);
      setMonthlyPaymentStatus(null);
    }
  };

  const fetchMembers = async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const result = await getMembers(gymId);
      if (result.success) {
        setMembers(result.members);
        setFilteredMembers(result.members);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = async (member: Member) => {
    setForm((prev) => ({
      ...prev,
      memberId: member.id,
      amount: PLAN_PRICES[prev.membershipPlan].toString(),
    }));
    setSearchQuery(member.name);

    // Check if member already paid this month
    if (gymId) {
      try {
        const result = await checkMemberMonthlyPayment(member.id, gymId);
        if (result.success !== false) {
          setMonthlyPaymentStatus({
            hasPaid: !!result.hasPaidThisMonth,
            lastPaymentDate: result.lastPaymentDate,
          });
        } else {
          setMonthlyPaymentStatus(null);
        }
      } catch (error) {
        console.error("Error checking monthly payment:", error);
        setMonthlyPaymentStatus(null);
      }
    }
  };

  const handlePlanChange = (plan: "basic" | "premium" | "vip") => {
    setForm((prev) => ({
      ...prev,
      membershipPlan: plan,
      amount: PLAN_PRICES[plan].toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.memberId) {
      toast.error("Please select a member");
      return;
    }

    if (monthlyPaymentStatus?.hasPaid) {
      toast.error("This member already paid for the current month");
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!gymId) {
      toast.error("Gym information not found");
      return;
    }

    setProcessing(true);
    try {
      const selectedMember = members.find((m) => m.id === form.memberId);

      const result = await recordPayment(gymId, {
        member_id: form.memberId,
        amount: parseFloat(form.amount),
        payment_method: "cash",
        description: `${form.membershipPlan.toUpperCase()} Membership - ${selectedMember?.name || "Member"}`,
        payment_type: "membership",
        membership_plan: form.membershipPlan,
        payment_date: form.paymentDate,
      });

      if (result.success) {
        // Generate and download slip
        const slipData: PaymentSlipData = {
          paymentId: result.payment.id,
          memberName: selectedMember?.name || "Member",
          memberEmail: selectedMember?.email || "",
          memberPhone: selectedMember?.phone,
          gymName: "Gym Management System",
          amount: parseFloat(form.amount),
          currency: "USD",
          paymentMethod: "Cash",
          paymentDate: form.paymentDate,
          membershipPlan: form.membershipPlan,
          description: result.payment.description,
          transactionId: result.payment.transaction_id,
        };

        // Auto-download the slip
        downloadPaymentSlip(
          slipData,
          `payment-receipt-${selectedMember?.name?.replace(/\s+/g, "-")}-${new Date().getTime()}.pdf`,
        );

        toast.success("Payment recorded successfully! Receipt downloaded. ✅");

        setForm({
          memberId: "",
          membershipPlan: "basic",
          amount: "",
          notes: "",
          paymentDate: new Date().toISOString().split("T")[0],
        });
        setSearchQuery("");
        setMonthlyPaymentStatus(null);

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(result.error || "Failed to record payment");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to record payment";
      console.error("Error recording payment:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === form.memberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-blur bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-[600px] bg-[#1A1B1F] rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Record New Payment
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
            aria-label="Close payment modal"
          >
            ✕
          </button>
        </div>

        {/* Body with Scrolling */}
        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Member Search */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Select Member
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="text-[20px]">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-slate-500 transition-all outline-none"
                  placeholder="Search by name or email..."
                />

                {/* Member dropdown */}
                {searchQuery && filteredMembers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#282f39] border border-white/10 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelectMember(member)}
                        className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-sm border-b border-white/5 last:border-b-0"
                      >
                        <div className="font-semibold text-white">
                          {member.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {member.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected member badge */}
                {selectedMember && (
                  <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-semibold text-primary">
                      ✓ {selectedMember.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedMember.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Payment Warning */}
            {monthlyPaymentStatus?.hasPaid && (
              <div className="p-4 bg-green-500/15 border border-green-500/40 rounded-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-bold text-green-400">
                      Payment Already Recorded
                    </div>
                    <div className="text-sm text-green-300/80">
                      This member already paid for the current month on{" "}
                      {monthlyPaymentStatus.lastPaymentDate
                        ? new Date(
                            monthlyPaymentStatus.lastPaymentDate,
                          ).toLocaleDateString()
                        : "recently"}
                      . To record another payment, select a different month.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Payment Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="text-[20px]">📅</span>
                </div>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      paymentDate: e.target.value,
                    }))
                  }
                  className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-slate-500 transition-all outline-none"
                />
              </div>
              <p className="text-xs text-slate-400">
                Select the date when the payment was received
              </p>
            </div>

            {/* Membership Plan Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Membership Plan
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["basic", "premium", "vip"] as const).map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => handlePlanChange(plan)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      form.membershipPlan === plan
                        ? "border-primary bg-primary/10 text-white"
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="font-bold capitalize text-sm">{plan}</div>
                    <div className="text-xs mt-1">${PLAN_PRICES[plan]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Amount (USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <span className="text-lg font-medium">$</span>
                </div>
                <input
                  type="number"
                  value={form.amount}
                  readOnly
                  className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-8 pr-4 text-white placeholder:text-slate-500 font-bold text-lg outline-none cursor-not-allowed opacity-75"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Payment Method
              </label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💵</span>
                  <div>
                    <div className="font-bold text-white">Cash</div>
                    <div className="text-xs text-slate-400">
                      Soon: Credit Card, Bank Transfer, Digital Wallet
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Internal Note
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg p-4 text-white placeholder:text-slate-500 h-20 resize-none outline-none"
                placeholder="Add a note about this transaction..."
              />
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={
                  processing ||
                  !form.memberId ||
                  monthlyPaymentStatus?.hasPaid === true
                }
                className="flex-1 bg-[#0d6cf2] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span>✔</span>
                {processing
                  ? "Processing..."
                  : monthlyPaymentStatus?.hasPaid
                    ? "Payment Already Recorded"
                    : "Process Payment"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
