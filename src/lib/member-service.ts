import { supabase } from "./supabase";

export interface Member {
  id: string;
  gym_id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: "basic" | "premium" | "vip";
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
  membership_type: "basic" | "premium" | "vip";
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
      status: "active",
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
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;

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
