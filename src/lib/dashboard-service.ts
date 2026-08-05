import { supabase } from "./supabase";

/**
 * Get weekly revenue data for the last 4 weeks
 */
export async function getMonthlyRevenue(gymId: string) {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("gym_id", gymId)
      .eq("status", "completed")
      .gte(
        "created_at",
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
      );

    if (error) throw error;

    const weeks: Record<string, number> = {
      "Week 1": 0,
      "Week 2": 0,
      "Week 3": 0,
      "Week 4": 0,
    };

    payments?.forEach((payment) => {
      const date = new Date(payment.created_at);
      const weekOfMonth = Math.min(4, Math.max(1, Math.ceil(date.getDate() / 7)));
      const weekLabel = `Week ${weekOfMonth}`;
      weeks[weekLabel] = (weeks[weekLabel] || 0) + payment.amount;
    });

    return {
      success: true,
      data: Object.entries(weeks).map(([week, amount]) => ({
        week,
        amount: Math.round(amount),
      })),
    };
  } catch (error) {
    console.error("Get monthly revenue error:", error);
    throw error;
  }
}

/**
 * Get weekly attendance data
 */
export async function getWeeklyAttendance(gymId: string) {
  try {
    const { data: checkins, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("gym_id", gymId)
      .gte(
        "check_in_time",
        new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
      );

    if (error) throw error;

    // Group by day
    const days: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    checkins?.forEach((checkin) => {
      const date = new Date(checkin.check_in_time);
      const dayName = dayNames[date.getDay()];
      days[dayName] = (days[dayName] || 0) + 1;
    });

    return {
      success: true,
      data: Object.entries(days).map(([day, count]) => ({
        day,
        count,
      })),
    };
  } catch (error) {
    console.error("Get weekly attendance error:", error);
    throw error;
  }
}

/**
 * Get recent check-ins for dashboard
 */
export async function getRecentCheckIns(gymId: string, limit: number = 10) {
  try {
    const { data: checkins, error } = await supabase
      .from("check_ins")
      .select(
        `
        id,
        check_in_time,
        check_out_time,
        duration_minutes,
        member:members(name, email)
      `
      )
      .eq("gym_id", gymId)
      .order("check_in_time", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, checkins };
  } catch (error) {
    console.error("Get recent check-ins error:", error);
    throw error;
  }
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats(gymId: string) {
  try {
    // Get all members
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("status")
      .eq("gym_id", gymId);

    if (membersError) throw membersError;

    // Get today's check-ins
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: todayCheckins, error: checkinsError } = await supabase
      .from("check_ins")
      .select("*")
      .eq("gym_id", gymId)
      .gte("check_in_time", today.toISOString())
      .lt("check_in_time", tomorrow.toISOString());

    if (checkinsError) throw checkinsError;

    // Get pending payments
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("gym_id", gymId)
      .eq("status", "pending");

    if (paymentsError) throw paymentsError;

    const totalMembers = members?.length || 0;
    const activeMembers = members?.filter((m) => m.status === "active").length || 0;
    const todayAttendance = todayCheckins?.length || 0;
    const pendingCount = pendingPayments?.length || 0;

    return {
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        todayAttendance,
        pendingCount,
      },
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    throw error;
  }
}
