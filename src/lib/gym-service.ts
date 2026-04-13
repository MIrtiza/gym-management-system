import { supabase } from "./supabase";

export interface GymData {
  id: string;
  owner_id: string;
  gym_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

export interface TrialStatus {
  daysRemaining: number;
  daysUsed: number;
  trialDays: number;
  isTrialExpired: boolean;
  trialEndDate: string;
  percentageUsed: number;
}

/**
 * Get gym information for the current user
 */
export async function getGymInfo(gymId: string) {
  try {
    const { data: gym, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("id", gymId)
      .single();

    if (error) throw error;

    return { success: true, gym: gym as GymData };
  } catch (error) {
    console.error("Get gym info error:", error);
    throw error;
  }
}

/**
 * Calculate trial status (30 days free trial)
 */
export function calculateTrialStatus(createdAt: string, trialDays: number = 30): TrialStatus {
  const createdDate = new Date(createdAt);
  const trialEndDate = new Date(createdDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialDays);

  const now = new Date();
  const daysUsed = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, trialDays - daysUsed);
  const isTrialExpired = now > trialEndDate;
  const percentageUsed = Math.min(100, Math.round((daysUsed / trialDays) * 100));

  return {
    daysRemaining,
    daysUsed: Math.min(daysUsed, trialDays),
    trialDays,
    isTrialExpired,
    trialEndDate: trialEndDate.toISOString(),
    percentageUsed,
  };
}

/**
 * Update gym subscription (upgrade from trial)
 */
export async function upgradeGymSubscription(
  gymId: string,
  plan: "basic" | "premium" | "enterprise"
) {
  try {
    const { data: gym, error } = await supabase
      .from("gyms")
      .update({
        subscription_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gymId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, gym: gym as GymData };
  } catch (error) {
    console.error("Upgrade gym subscription error:", error);
    throw error;
  }
}
