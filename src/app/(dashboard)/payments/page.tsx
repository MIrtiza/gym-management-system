"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { getMembers, type Member } from "@/lib/member-service";
import {
  getPayments,
  getPaymentStats,
  recordPayment,
} from "@/lib/payment-service";
import {
  downloadPaymentSlip,
  type PaymentSlipData,
} from "@/lib/slip-generator";
import { sendPaymentConfirmation } from "@/lib/whatsapp-service";
import { supabase } from "@/lib/supabase";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import type { Payment } from "@/lib/payment-service";

export default function PaymentsPage() {
  const { user } = useAuth();
  const gymId = user?.user_metadata?.gym_id;
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState({
    total_payments: 0,
    total_revenue: 0,
    average_payment: 0,
  });
  const [loading, setLoading] = useState(false);
  const [sendingMessagePaymentId, setSendingMessagePaymentId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (gymId) {
      fetchStats();
      fetchMembers();
      const unsubscribe = setupRealtimeSubscription();

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [gymId]);

  useEffect(() => {
    if (gymId) {
      fetchPayments(currentPage);
    }
  }, [gymId, currentPage]);

  const fetchPayments = async (page: number = 1) => {
    if (!gymId) return;

    setLoading(true);
    try {
      const result = await getPayments(gymId, page, pageSize);
      if (result.success) {
        setPayments(result.payments);
        setTotalPayments(result.count ?? 0);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!gymId) return;

    try {
      const result = await getPaymentStats(gymId, 30);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchMembers = async () => {
    if (!gymId) return;

    try {
      const result = await getMembers(gymId);
      if (result.success) {
        setMembers(result.members);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleDownloadSlip = (payment: Payment) => {
    const member = members.find((m) => m.id === payment.member_id);

    if (!member) {
      toast.error("Member information not found");
      return;
    }

    const slipData: PaymentSlipData = {
      paymentId: payment.id,
      memberName: member.name,
      memberEmail: member.email,
      memberPhone: member.phone,
      gymName: "Gym Management System",
      amount: payment.amount,
      currency: "USD",
      paymentMethod: getPaymentMethodLabel(payment.payment_method),
      paymentDate: payment.created_at.split("T")[0],
      membershipPlan: payment.membership_plan || "Membership",
      description: payment.description,
      transactionId: payment.transaction_id,
    };

    downloadPaymentSlip(
      slipData,
      `payment-receipt-${member.name.replace(/\s+/g, "-")}-${payment.created_at.split("T")[0]}.pdf`,
    );
    toast.success("Receipt downloaded! 📄");
  };

  const handleSendPaymentMessage = async (payment: Payment) => {
    if (!payment.member_id) {
      toast.error("Payment member information not found");
      return;
    }

    const member = members.find((m) => m.id === payment.member_id);

    if (!member) {
      toast.error("Member information not found");
      return;
    }

    if (!gymId) {
      toast.error("Gym information not found");
      return;
    }

    setSendingMessagePaymentId(payment.id);

    try {
      const result = await sendPaymentConfirmation(
        gymId,
        payment.member_id,
        member.name,
        formatMonth(payment.payment_date || payment.created_at),
        payment.amount.toString(),
        payment.transaction_id ?? payment.id,
      );

      if (result.success) {
        toast.success("Payment message sent via WhatsApp! 📲");
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending payment message");
    } finally {
      setSendingMessagePaymentId(null);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!gymId) return () => {};

    try {
      const channel = supabase
        .channel(`gym-payments-${gymId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "payments",
            filter: `gym_id=eq.${gymId}`,
          },
          () => {
            // When any payment change occurs, refresh payments and stats
            fetchPayments();
            fetchStats();
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Payment subscription active");
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error setting up payment subscription:", error);
      return () => {};
    }
  };

  const handlePaymentRecorded = async () => {
    await fetchPayments();
    await fetchStats();
  };

  const getPaymentMethodEmoji = (method: string) => {
    switch (method) {
      case "credit_card":
        return "💳";
      case "debit_card":
        return "💳";
      case "bank_transfer":
        return "🏦";
      case "cash":
        return "💵";
      default:
        return "💰";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "debit_card":
        return "Debit Card";
      case "bank_transfer":
        return "Bank Transfer";
      case "cash":
        return "Cash";
      default:
        return method;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500";
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-500";
      case "failed":
        return "bg-red-500/10 text-red-600 dark:text-red-500";
      case "refunded":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-500";
      default:
        return "bg-slate-100/10 text-slate-600 dark:text-slate-400";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor revenue, pending invoices, and payment status.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d6cf2] hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
            >
              <span>＋</span>
              Add Payment
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold">
                Total Revenue
              </span>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <span>📈</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">
              ${stats.total_revenue.toFixed(2)}
            </h3>
            <p className="text-xs text-emerald-500 font-bold">
              {stats.total_payments}{" "}
              <span className="text-slate-500 font-normal">
                payments this month
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold">
                Average Payment
              </span>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <span>💰</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">
              ${stats.average_payment.toFixed(2)}
            </h3>
            <p className="text-xs text-blue-500 font-bold">Per transaction</p>
          </div>

          <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold">
                Total Transactions
              </span>
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <span>📊</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">
              {stats.total_payments}
            </h3>
            <p className="text-xs text-purple-500 font-bold">
              In the past 30 days
            </p>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-white dark:bg-[#1a1d23] rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <p className="text-sm text-slate-500">
                Monitor and manage all recorded payments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPayments(currentPage)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-800/50">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Fee Month</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading payments...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No payments recorded yet
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">
                            {payment.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {payment.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {formatMonth(
                          payment.payment_date || payment.created_at,
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span>
                            {getPaymentMethodEmoji(payment.payment_method)}
                          </span>
                          <span>
                            {getPaymentMethodLabel(payment.payment_method)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(
                            payment.status,
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendPaymentMessage(payment)}
                            disabled={sendingMessagePaymentId === payment.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Send payment confirmation via WhatsApp"
                          >
                            <span>
                              {sendingMessagePaymentId === payment.id
                                ? "⏳"
                                : "💬"}
                            </span>
                            <span>
                              {sendingMessagePaymentId === payment.id
                                ? "Sending..."
                                : "Send Msg"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDownloadSlip(payment)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary transition-colors"
                            title="Download payment receipt"
                          >
                            <span>📄</span>
                            <span>Slip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Showing {payments.length} of {totalPayments} payments
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ◀ Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {currentPage} of{" "}
                {Math.max(1, Math.ceil(totalPayments / pageSize))}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.max(1, Math.ceil(totalPayments / pageSize)),
                    ),
                  )
                }
                disabled={
                  currentPage >= Math.ceil(totalPayments / pageSize) || loading
                }
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={handlePaymentRecorded}
      />
    </>
  );
}
