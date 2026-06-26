import { supabase } from "./supabase";
import { sendAdmissionWelcomeMessage } from "./whatsapp-service";

export interface Member {
  id: string;
  gym_id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: "starter" | "pro" | "elite";
  status: "active" | "inactive" | "paused";
  joined_date: string;
  membership_expiry: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMemberData {
  name: string;
  email: string;
  phone: string;
  membership_type: "starter" | "pro" | "elite";
}

/**
 * Add a new member to the gym
 */
export async function createMember(gymId: string, data: CreateMemberData) {
  try {
    console.log("[CREATE_MEMBER] Starting member creation for gym:", gymId);
    console.log("[CREATE_MEMBER] Member data:", data);
    
    const joinedDate = new Date().toISOString();
    const membershipExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const insertPayload = {
      gym_id: gymId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      membership_type: data.membership_type,
      status: "pending",
      joined_date: joinedDate,
      membership_expiry: membershipExpiry,
    };

    console.log("[CREATE_MEMBER] Payload being sent to Supabase:", insertPayload);

    const { data: member, error } = await supabase
      .from("members")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("[CREATE_MEMBER] Supabase error:", error);
      throw error;
    }

    console.log("[CREATE_MEMBER] Success! Created member:", member);

    // Send WhatsApp welcome message if enabled
    try {
      const { data: gym, error: gymError } = await supabase
        .from("gyms")
        .select("name, is_whatsapp_enabled")
        .eq("id", gymId)
        .single();

      if (gym?.is_whatsapp_enabled && !gymError) {
        console.log("[CREATE_MEMBER] Sending WhatsApp welcome message...");
        await sendAdmissionWelcomeMessage(
          gymId,
          member.id,
          data.name,
          gym.name || "Gym",
          data.membership_type
        );
      }
    } catch (whatsappError) {
      // Log WhatsApp error but don't fail member creation
      console.warn("[CREATE_MEMBER] WhatsApp message failed (non-critical):", whatsappError);
    }

    return { success: true, member };
  } catch (error) {
    console.error("[CREATE_MEMBER] Error:", error);
    throw error;
  }
}

/**
 * Get all members for a gym
 */
export async function getMembers(gymId: string) {
  try {
    console.log("[GET_MEMBERS] Fetching members for gym:", gymId);
    
    const { data: members, error } = await supabase
      .from("members")
      .select("*")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_MEMBERS] Supabase error:", error);
      throw error;
    }

    console.log("[GET_MEMBERS] Success! Fetched members count:", members?.length || 0);
    console.log("[GET_MEMBERS] Members data:", members);
    return { success: true, members: members as Member[] };
  } catch (error) {
    console.error("[GET_MEMBERS] Error:", error);
    throw error;
  }
}

/**
 * Get a single member by ID
 */
export async function getMemberById(memberId: string) {
  try {
    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (error) throw error;

    return { success: true, member: member as Member };
  } catch (error) {
    console.error("Get member error:", error);
    throw error;
  }
}

/**
 * Update member information
 */
export async function updateMember(
  memberId: string,
  data: Partial<CreateMemberData>
) {
  try {
    const { data: member, error } = await supabase
      .from("members")
      .update(data)
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, member };
  } catch (error) {
    console.error("Update member error:", error);
    throw error;
  }
}

/**
 * Delete a member
 */
export async function deleteMember(memberId: string) {
  try {
    const { error, count } = await supabase
      .from("members")
      .delete({ count: 'exact' })
      .eq("id", memberId);

    if (error) throw error;
// If count is 0, it means the ID wasn't found or RLS blocked it
    console.log(`Deleted ${count} rows`);
    
    return { success: true };
  } catch (error) {
    console.error("Delete member error:", error);
    throw error;
  }
}

/**
 * Update member status
 */
export async function updateMemberStatus(
  memberId: string,
  status: "active" | "inactive" | "paused"
) {
  try {
    const { data: member, error } = await supabase
      .from("members")
      .update({ status })
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, member };
  } catch (error) {
    console.error("Update member status error:", error);
    throw error;
  }
}

/**
 * Get members count for a gym
 */
export async function getMembersCount(gymId: string) {
  try {
    const { count, error } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("gym_id", gymId);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Get members count error:", error);
    throw error;
  }
}

/**
 * Activate a member (change status from pending to active)
 * Called when first payment is recorded
 */
export async function activateMember(memberId: string) {
  try {
    const { data: member, error } = await supabase
      .from("members")
      .update({ status: "active" })
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;

    console.log("[ACTIVATE_MEMBER] Member activated:", memberId);
    return { success: true, member };
  } catch (error) {
    console.error("Activate member error:", error);
    throw error;
  }
}

/**
 * Calculate member status based on membership expiry and payment status
 * Returns: "active", "expiring-soon", or "inactive"
 */
export function calculateMemberStatus(
  currentStatus: string,
  membershipExpiry: string
): "active" | "expiring-soon" | "inactive" | "pending" {
  // If pending or inactive, return as-is
  if (currentStatus === "pending" || currentStatus === "inactive") {
    return currentStatus as "pending" | "inactive";
  }

  const expiryDate = new Date(membershipExpiry);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // If already expired, mark as inactive
  if (daysUntilExpiry < 0) {
    return "inactive";
  }

  // If less than 5 days until expiry, mark as expiring-soon
  if (daysUntilExpiry < 5) {
    return "expiring-soon";
  }

  // Otherwise, active
  return "active";
}

/**
 * Cancel a member's membership and send cancellation notification
 */
export async function cancelMembership(
  gymId: string,
  memberId: string,
  reason: string = "Membership cancelled"
) {
  try {
    // Get member details first
    const { data: member, error: fetchError } = await supabase
      .from("members")
      .select("name, phone")
      .eq("id", memberId)
      .single();

    if (fetchError || !member) {
      throw new Error("Member not found");
    }

    // Update member status to inactive
    const { error: updateError } = await supabase
      .from("members")
      .update({ status: "inactive" })
      .eq("id", memberId);

    if (updateError) {
      throw updateError;
    }

    // Send WhatsApp cancellation notification if enabled
    try {
      const { data: gym, error: gymError } = await supabase
        .from("gyms")
        .select("is_whatsapp_enabled")
        .eq("id", gymId)
        .single();

      if (gym?.is_whatsapp_enabled && !gymError) {
        console.log("[CANCEL_MEMBERSHIP] Sending WhatsApp cancellation message...");
        const { sendMembershipCancellationMessage } = await import("./whatsapp-service");
        await sendMembershipCancellationMessage(
          gymId,
          memberId,
          member.name,
          reason
        );
      }
    } catch (whatsappError) {
      // Log WhatsApp error but don't fail cancellation
      console.warn("[CANCEL_MEMBERSHIP] WhatsApp message failed (non-critical):", whatsappError);
    }

    console.log("[CANCEL_MEMBERSHIP] Membership cancelled for member:", memberId);
    return { success: true };
  } catch (error) {
    console.error("Cancel membership error:", error);
    throw error;
  }
}
