import { supabase } from "./supabase";

export interface CheckIn {
  id: string;
  gym_id: string;
  member_id: string;
  check_in_time: string;
  check_out_time?: string;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface CheckInWithMember extends CheckIn {
  member?: {
    name: string;
    email: string;
    phone?: string;
  };
}

/**
 * Record a check-in for a member
 */
export async function recordCheckIn(gymId: string, memberId: string) {
  try {
    const { data: checkin, error } = await supabase
      .from("check_ins")
      .insert({
        gym_id: gymId,
        member_id: memberId,
        check_in_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, checkin };
  } catch (error) {
    console.error("Record check-in error:", error);
    throw error;
  }
}

/**
 * Record a check-out for a member
 */
export async function recordCheckOut(checkinId: string) {
  try {
    const { data: existingCheckin } = await supabase
      .from("check_ins")
      .select("check_in_time")
      .eq("id", checkinId)
      .single();

    const checkOutTime = new Date();
    const checkInTime = new Date(existingCheckin?.check_in_time);
    const durationMinutes = Math.round(
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60)
    );

    console.log("[RECORD_CHECKOUT] CheckOut:", {
      checkinId,
      checkInTime: checkInTime.toISOString(),
      checkOutTime: checkOutTime.toISOString(),
      durationMinutes,
    });

    const { data: checkin, error } = await supabase
      .from("check_ins")
      .update({
        check_out_time: checkOutTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq("id", checkinId)
      .select()
      .single();

    if (error) throw error;

    console.log("[RECORD_CHECKOUT] Success:", checkin);
    return { success: true, checkin };
  } catch (error) {
    console.error("Record check-out error:", error);
    throw error;
  }
}

/**
 * Get all check-ins for a gym
 */
export async function getCheckIns(gymId: string, limit: number = 50) {
  try {
    const { data: checkins, error } = await supabase
      .from("check_ins")
      .select(
        `
        *,
        member:members(name, email)
      `
      )
      .eq("gym_id", gymId)
      .order("check_in_time", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, checkins: checkins as CheckInWithMember[] };
  } catch (error) {
    console.error("Get check-ins error:", error);
    throw error;
  }
}

/**
 * Get check-ins for a specific member
 */
export async function getMemberCheckIns(memberId: string, limit: number = 30) {
  try {
    const { data: checkins, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("member_id", memberId)
      .order("check_in_time", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, checkins: checkins as CheckIn[] };
  } catch (error) {
    console.error("Get member check-ins error:", error);
    throw error;
  }
}

/**
 * Get today's check-ins for a gym
 */
export async function getTodayCheckIns(gymId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: checkins, error } = await supabase
      .from("check_ins")
      .select(
        `
        *,
        member:members(name, email, phone)
      `
      )
      .eq("gym_id", gymId)
      .gte("check_in_time", today.toISOString())
      .lt("check_in_time", tomorrow.toISOString())
      .order("check_in_time", { ascending: false });

    if (error) throw error;

    return { success: true, checkins: checkins as CheckInWithMember[] };
  } catch (error) {
    console.error("Get today's check-ins error:", error);
    throw error;
  }
}

/**
 * Get check-in statistics for a gym
 */
export async function getCheckInStats(gymId: string, days: number = 7) {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const { data: checkins, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("gym_id", gymId)
      .gte("check_in_time", dateFrom.toISOString());

    if (error) throw error;

    const stats = {
      total_checkins: checkins?.length || 0,
      unique_members: new Set(checkins?.map((c) => c.member_id)).size || 0,
      avg_duration: checkins && checkins.length > 0
        ? Math.round(
            checkins.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) /
              checkins.length
          )
        : 0,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Get check-in stats error:", error);
    throw error;
  }
}
