import { supabase } from "./supabase";
import { activateMember } from "./member-service";
import { sendFeesPaymentMessage, sendFeesReminderMessage } from "./whatsapp-service";

export interface Payment {
  id: string;
  gym_id: string;
  member_id?: string;
  amount: number;
  currency: string;
  payment_method: "credit_card" | "debit_card" | "bank_transfer" | "cash";
  status: "pending" | "completed" | "failed" | "refunded";
  description: string;
  transaction_id?: string;
  payment_type?: "membership" | "training" | "day_pass" | "other";
  membership_plan?: "starter" | "pro" | "elite";
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  gym_id: string;
  plan: "basic" | "premium" | "elite" | "free_trial";
  billing_cycle: "monthly" | "annual";
  amount: number;
  status: "active" | "canceled" | "expired";
  start_date: string;
  end_date: string;
  renewal_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  member_id?: string;
  amount: number;
  payment_method: "credit_card" | "debit_card" | "bank_transfer" | "cash";
  description: string;
  payment_type?: "membership" | "training" | "day_pass" | "other";
  membership_plan?: "starter" | "pro" | "elite";
  payment_date?: string;
  notes?: string;
}

export interface SubscriptionPlans {
  basic: { monthly: number; annual: number };
  premium: { monthly: number; annual: number };
  elite: { monthly: number; annual: number };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlans = {
  basic: { monthly: 99, annual: 990 },
  premium: { monthly: 149, annual: 1490 },
  elite: { monthly: 199, annual: 1990 },
};

function formatPaymentMonth(dateString?: string): string {
  const date = dateString
    ? new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`)
    : new Date();

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Record a payment for the gym or a member
 */
export async function recordPayment(
  gymId: string,
  data: CreatePaymentData
) {
  try {
    // First try with payment_date field
    const paymentData: any = {
      gym_id: gymId,
      member_id: data.member_id || null,
      amount: data.amount,
      currency: "USD",
      payment_method: data.payment_method,
      status: "completed",
      description: data.description,
      payment_type: data.payment_type || "other",
      membership_plan: data.membership_plan || null,
      notes: data.notes || null,
    };

    // Add payment_date if provided
    if (data.payment_date) {
      paymentData.payment_date = data.payment_date;
    }

    let { data: payment, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    // If error is about payment_date column not existing, retry without it
    if (
      error &&
      error.message &&
      error.message.includes("payment_date")
    ) {
      console.warn("payment_date column not found, retrying without it:", error.message);
      delete paymentData.payment_date;

      const result = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();

      if (result.error) {
        console.error("Record payment retry error:", result.error?.message || JSON.stringify(result.error));
        return {
          success: false,
          payment: null,
          error: result.error?.message || "Failed to record payment",
        };
      }
      payment = result.data;
      error = null;
    }

    if (error) {
      console.error("Record payment Supabase error:", error?.message || JSON.stringify(error));
      return {
        success: false,
        payment: null,
        error: error?.message || "Failed to record payment",
      };
    }

    // If payment was recorded for a member, activate them (change status from pending to active)
    if (payment && data.member_id) {
      try {
        await activateMember(data.member_id);
        console.log("[RECORD_PAYMENT] Member activated after payment:", data.member_id);
      } catch (activateError) {
        console.warn("[RECORD_PAYMENT] Could not activate member after payment:", activateError);
        // Don't fail the payment recording if activation fails
      }

      // Send WhatsApp payment confirmation if enabled
      try {
        const { data: gym, error: gymError } = await supabase
          .from("gyms")
          .select("is_whatsapp_enabled")
          .eq("id", gymId)
          .single();

        const { data: member, error: memberError } = await supabase
          .from("members")
          .select("name")
          .eq("id", data.member_id)
          .single();

        if (
          gym?.is_whatsapp_enabled &&
          !gymError &&
          member &&
          !memberError
        ) {
          console.log("[RECORD_PAYMENT] Sending WhatsApp payment confirmation...");
          await sendFeesPaymentMessage(
            gymId,
            data.member_id,
            member.name,
            formatPaymentMonth(payment.payment_date || payment.created_at),
            payment.amount.toString(),
            payment.transaction_id ?? payment.id,
          );
        }
      } catch (whatsappError) {
        // Log WhatsApp error but don't fail payment recording
        console.warn("[RECORD_PAYMENT] WhatsApp message failed (non-critical):", whatsappError);
      }
    }

    return { success: true, payment, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Record payment error:", errorMessage, error);
    return {
      success: false,
      payment: null,
      error: errorMessage,
    };
  }
}

/**
 * Get all payments for a gym
 */
export async function getPayments(gymId: string, page = 1, pageSize: number = 50) {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: payments, count, error } = await supabase
      .from("payments")
      .select("*", { count: "exact" })
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      payments: payments as Payment[],
      count: count ?? (payments?.length || 0),
    };
  } catch (error) {
    console.error("Get payments error:", error);
    throw error;
  }
}

/**
 * Get payments for a specific member
 */
export async function getMemberPayments(memberId: string, limit: number = 30) {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, payments: payments as Payment[] };
  } catch (error) {
    console.error("Get member payments error:", error);
    throw error;
  }
}

/**
 * Get gym subscription
 */
export async function getGymSubscription(gymId: string) {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("gym_id", gymId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

    return { success: true, subscription: subscription as Subscription | null };
  } catch (error) {
    console.error("Get gym subscription error:", error);
    throw error;
  }
}

/**
 * Create or upgrade gym subscription
 */
export async function updateSubscription(
  gymId: string,
  plan: "basic" | "premium" | "elite",
  billingCycle: "monthly" | "annual"
) {
  try {
    const amount = SUBSCRIPTION_PLANS[plan][billingCycle];
    const startDate = new Date();
    const endDate = new Date();

    if (billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // First, try to get existing subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("gym_id", gymId)
      .single();

    let subscription;
    let error;

    if (existingSubscription) {
      // Update existing subscription
      const updateResult = await supabase
        .from("subscriptions")
        .update({
          plan,
          billing_cycle: billingCycle,
          amount,
          status: "active",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          renewal_date: endDate.toISOString(),
        })
        .eq("gym_id", gymId)
        .select()
        .single();

      subscription = updateResult.data;
      error = updateResult.error;
    } else {
      // Create new subscription
      const insertResult = await supabase
        .from("subscriptions")
        .insert({
          gym_id: gymId,
          plan,
          billing_cycle: billingCycle,
          amount,
          status: "active",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          renewal_date: endDate.toISOString(),
        })
        .select()
        .single();

      subscription = insertResult.data;
      error = insertResult.error;
    }

    if (error) throw error;

    return { success: true, subscription };
  } catch (error) {
    console.error("Update subscription error:", error);
    throw error;
  }
}

/**
 * Get payment statistics for a gym
 */
export async function getPaymentStats(gymId: string, days: number = 30) {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("gym_id", gymId)
      .eq("status", "completed")
      .gte("created_at", dateFrom.toISOString());

    if (error) throw error;

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const averagePayment =
      payments && payments.length > 0 ? totalRevenue / payments.length : 0;

    const stats = {
      total_payments: payments?.length || 0,
      total_revenue: totalRevenue,
      average_payment: Math.round(averagePayment * 100) / 100,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Get payment stats error:", error);
    throw error;
  }
}

/**
 * Cancel gym subscription
 */
export async function cancelSubscription(gymId: string) {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("gym_id", gymId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, subscription };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    throw error;
  }
}

/**
 * Check if member already paid for a specific month (or current month if not specified)
 */
export async function checkMemberMonthlyPayment(
  memberId: string,
  gymId: string,
  dateString?: string
) {
  try {
    const checkDate = dateString ? new Date(dateString) : new Date();
    const startOfMonth = new Date(checkDate.getFullYear(), checkDate.getMonth(), 1);
    const endOfMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);

    const startDateStr = startOfMonth.toISOString().split("T")[0];
    const endDateStr = endOfMonth.toISOString().split("T")[0];

    // Try to check using payment_date field first
    let { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("member_id", memberId)
      .eq("gym_id", gymId)
      .eq("status", "completed")
      .eq("payment_type", "membership")
      .gte("payment_date", startDateStr)
      .lte("payment_date", endDateStr);

    // If payment_date field doesn't exist, fallback to created_at
    if (error && error.message.includes("payment_date")) {
      const { data: fallbackPayments, error: fallbackError } = await supabase
        .from("payments")
        .select("*")
        .eq("member_id", memberId)
        .eq("gym_id", gymId)
        .eq("status", "completed")
        .eq("payment_type", "membership")
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (fallbackError) {
        console.error("Check member monthly payment error:", fallbackError);
        return {
          success: false,
          hasPaidThisMonth: false,
          lastPaymentDate: null,
        };
      }
      payments = fallbackPayments;
    } else if (error) {
      console.error("Check member monthly payment error:", error);
      return {
        success: false,
        hasPaidThisMonth: false,
        lastPaymentDate: null,
      };
    }

    const hasPaid = payments && payments.length > 0;
    const lastPayment = payments && payments.length > 0 ? payments[0] : null;

    return {
      success: true,
      hasPaidThisMonth: hasPaid,
      lastPaymentDate: lastPayment?.payment_date || lastPayment?.created_at || null,
    };
  } catch (error) {
    console.error("Check member monthly payment error:", error);
    return {
      success: false,
      hasPaidThisMonth: false,
      lastPaymentDate: null,
    };
  }
}

/**
 * Send fees reminder to a member
 */
export async function sendFeesReminder(
  gymId: string,
  memberId: string,
  outstandingAmount: number,
  dueDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("name")
      .eq("id", memberId)
      .single();

    if (memberError || !member) {
      return { success: false, error: "Member not found" };
    }

    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .select("is_whatsapp_enabled")
      .eq("id", gymId)
      .single();

    if (gymError || !gym?.is_whatsapp_enabled) {
      return { success: false, error: "WhatsApp not enabled for this gym" };
    }

    const result = await sendFeesReminderMessage(
      gymId,
      memberId,
      member.name,
      outstandingAmount.toString(),
      dueDate
    );

    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error("Send fees reminder error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send fees overdue warning to a member
 */
export async function sendOverdueWarning(
  gymId: string,
  memberId: string,
  overdueAmount: number,
  daysOverdue: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("name")
      .eq("id", memberId)
      .single();

    if (memberError || !member) {
      return { success: false, error: "Member not found" };
    }

    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .select("is_whatsapp_enabled")
      .eq("id", gymId)
      .single();

    if (gymError || !gym?.is_whatsapp_enabled) {
      return { success: false, error: "WhatsApp not enabled for this gym" };
    }

    const { sendFeesOverdueMessage } = await import("./whatsapp-service");
    const result = await sendFeesOverdueMessage(
      gymId,
      memberId,
      member.name,
      overdueAmount.toString(),
      daysOverdue.toString()
    );

    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error("Send overdue warning error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send fees reminders to all members who haven't paid this month
 */
export async function sendMonthlyFeesReminders(
  gymId: string,
  outstandingAmount: number,
  dueDate: string
): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  error?: string;
}> {
  try {
    // Get all active members
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("id, name")
      .eq("gym_id", gymId)
      .eq("status", "active");

    if (membersError || !members) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        error: "Failed to fetch members",
      };
    }

    let sentCount = 0;
    let failedCount = 0;

    // Check each member and send reminder if they haven't paid
    for (const member of members) {
      try {
        const paymentCheck = await checkMemberMonthlyPayment(member.id, gymId);

        if (!paymentCheck.hasPaidThisMonth) {
          const result = await sendFeesReminder(
            gymId,
            member.id,
            outstandingAmount,
            dueDate
          );

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        }
      } catch (error) {
        console.error(`Error checking payment for member ${member.id}:`, error);
        failedCount++;
      }
    }

    return {
      success: failedCount === 0,
      sentCount,
      failedCount,
    };
  } catch (error) {
    console.error("Send monthly fees reminders error:", error);
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
