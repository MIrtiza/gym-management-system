import { supabase } from "./supabase";

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
  membership_plan?: "basic" | "premium" | "vip";
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
  membership_plan?: "basic" | "premium" | "vip";
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
export async function getPayments(gymId: string, limit: number = 50) {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, payments: payments as Payment[] };
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
