/**
 * Centralized configuration for membership plans and pricing
 * Update prices here and they'll automatically sync across the entire app
 */

export const MEMBERSHIP_PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 29,
    displayPrice: "$29/month",
  },
  pro: {
    name: "Pro",
    monthlyPrice: 59,
    displayPrice: "$59/month",
  },
  elite: {
    name: "Elite",
    monthlyPrice: 99,
    displayPrice: "$99/month",
  },
} as const;

export type MembershipPlanKey = keyof typeof MEMBERSHIP_PLANS;

/**
 * Get plan price by key
 * Usage: getPlanPrice("pro") => 59
 */
export function getPlanPrice(planKey: MembershipPlanKey): number {
  return MEMBERSHIP_PLANS[planKey]?.monthlyPrice || 0;
}

/**
 * Get plan display price (formatted string)
 * Usage: getPlanDisplayPrice("pro") => "$59/month"
 */
export function getPlanDisplayPrice(planKey: MembershipPlanKey): string {
  return MEMBERSHIP_PLANS[planKey]?.displayPrice || "$0/month";
}

/**
 * Get plan name
 * Usage: getPlanName("pro") => "Pro"
 */
export function getPlanName(planKey: MembershipPlanKey): string {
  return MEMBERSHIP_PLANS[planKey]?.name || "Unknown";
}

/**
 * Get all plans as array for dropdowns/selects
 * Usage: getAllPlans() => [{key: "starter", name: "Starter", price: "$29/month"}, ...]
 */
export function getAllPlans() {
  return Object.entries(MEMBERSHIP_PLANS).map(([key, value]) => ({
    key: key as MembershipPlanKey,
    name: value.name,
    displayPrice: value.displayPrice,
    monthlyPrice: value.monthlyPrice,
  }));
}

/**
 * Verify if a plan key is valid
 * Usage: isValidPlan("pro") => true
 */
export function isValidPlan(planKey: string): planKey is MembershipPlanKey {
  return planKey in MEMBERSHIP_PLANS;
}
