import { supabase } from "./supabase";

export interface WhatsAppNotificationPayload {
  gym_id: string;
  member_id: string;
  template_name: string;
  template_data: string[];
  pdf_url?: string;
}

export interface BusinessHourSlot {
  label: string;
  from: string;
  to: string;
}

export interface WhatsAppLogEntry {
  id: string;
  gym_id: string;
  member_id: string;
  status: "sent" | "failed" | "pending" | "delivered";
  message_type: "reminder" | "receipt" | "welcome" | "expiry_warning" | "fees_paid" | "fees_overdue" | "cancellation" | "maintenance";
  meta_message_id?: string;
  template_name?: string;
  error_message?: string;
  retry_count?: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppGymConfig {
  id: string;
  // whatsapp_phone_number_id: string;
  // whatsapp_waba_id: string;
  is_whatsapp_enabled: boolean;
  gym_display_name: string;
  // whatsapp_access_token: string;
  business_hours?: string | BusinessHourSlot[];
}

/**
 * Send a WhatsApp notification via the Edge Function
 * @param payload The notification payload
 * @returns Success status and message ID
 */
export async function sendWhatsAppNotification(
  payload: WhatsAppNotificationPayload
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    // Get the service token from environment
    const serviceToken = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_TOKEN;

    if (!serviceToken) {
      console.error("WhatsApp service token not configured");
      return {
        success: false,
        error: "WhatsApp service not configured",
      };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return {
        success: false,
        error: "Supabase URL not configured",
      };
    }

    // Call the Edge Function
    console.log("[WHATSAPP] Sending template payload:", payload);

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-whatsapp-notification`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const responseText = await response.text();
    let data: { success?: boolean; message_id?: string; error?: string; details?: string } = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { error: responseText };
      }
    }

    const hasError = !response.ok || data.success === false || Boolean(data.error);
    console.log("[WHATSAPP] send response:", response.status, response.statusText, data, { hasError });

    if (hasError) {
      console.error("WhatsApp API error:", {
        status: response.status,
        statusText: response.statusText,
        body: data,
      });
      return {
        success: false,
        error: data.error || data.details || `Failed to send message (${response.status} ${response.statusText})`,
      };
    }

    return {
      success: true,
      message_id: data.message_id,
    };
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a payment receipt via WhatsApp
 */
export async function sendPaymentReceipt(
  gymId: string,
  memberId: string,
  pdfUrl: string,
  recipientName: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "payment_receipt",
    template_data: [recipientName],
    pdf_url: pdfUrl,
  });
}

/**
 * Send a membership expiry reminder
 */
export async function sendMembershipExpiryReminder(
  gymId: string,
  memberId: string,
  memberName: string,
  expiryDate: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "membership_expiry_reminder",
    template_data: [memberName, expiryDate],
  });
}

/**
 * Send a welcome message to new member
 */
export async function sendWelcomeMessage(
  gymId: string,
  memberId: string,
  memberName: string,
  gymName: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "irongraph_welcome",
    template_data: [memberName, gymName],
  });
}

/**
 * Send a payment confirmation message
 */
export async function sendPaymentConfirmation(
  gymId: string,
  memberId: string,
  memberName: string,
  paymentMonth: string,
  fees: string,
  transactionId: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "irongraph_payment_confirmation ",
    template_data: [memberName, paymentMonth, fees, transactionId.slice(0, 8)], // Send only first 8 chars of transaction ID for brevity
  });
}

/**
 * Get WhatsApp configuration for a gym
 */
export async function getGymWhatsAppConfig(
  gymId: string
): Promise<{ success: boolean; config?: WhatsAppGymConfig; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("gyms")
      .select("id, is_whatsapp_enabled, gym_display_name, business_hours")
      .eq("id", gymId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, config: data as WhatsAppGymConfig };
  } catch (error) {
    console.error("Error fetching WhatsApp config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update WhatsApp configuration for a gym
 */
export async function updateGymWhatsAppConfig(
  gymId: string,
  config: Partial<WhatsAppGymConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("gyms")
      .update({
        is_whatsapp_enabled: config.is_whatsapp_enabled,
        gym_display_name: config.gym_display_name,
        business_hours: config.business_hours,
      })
      .eq("id", gymId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating WhatsApp config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get WhatsApp logs for a gym
 */
export async function getWhatsAppLogs(
  gymId: string,
  memberId?: string,
  limit = 50
): Promise<{ success: boolean; logs?: WhatsAppLogEntry[]; error?: string }> {
  try {
    let query = supabase
      .from("whatsapp_logs")
      .select("*")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (memberId) {
      query = query.eq("member_id", memberId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, logs: data as WhatsAppLogEntry[] };
  } catch (error) {
    console.error("Error fetching WhatsApp logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Retry a failed WhatsApp message
 */
export async function retryFailedMessage(
  logId: string,
  gymId: string,
  memberId: string,
  templateName: string,
  templateData: string[]
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    // Get the log entry to check retry count
    const { data: logEntry, error: fetchError } = await supabase
      .from("whatsapp_logs")
      .select("retry_count, max_retries")
      .eq("id", logId)
      .single();

    if (fetchError || !logEntry) {
      return { success: false, error: "Log entry not found" };
    }

    if ((logEntry.retry_count || 0) >= (logEntry.max_retries || 3)) {
      return { success: false, error: "Maximum retries exceeded" };
    }

    // Attempt to resend
    const result = await sendWhatsAppNotification({
      gym_id: gymId,
      member_id: memberId,
      template_name: templateName,
      template_data: templateData,
    });

    if (result.success) {
      // Update the log entry
      await supabase
        .from("whatsapp_logs")
        .update({
          status: "sent",
          retry_count: (logEntry.retry_count || 0) + 1,
          meta_message_id: result.message_id,
        })
        .eq("id", logId);
    } else {
      // Update with failure info
      await supabase
        .from("whatsapp_logs")
        .update({
          status: "failed",
          retry_count: (logEntry.retry_count || 0) + 1,
          error_message: result.error,
        })
        .eq("id", logId);
    }

    return result;
  } catch (error) {
    console.error("Error retrying WhatsApp message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send membership admission/welcome message to new member
 */
export async function sendAdmissionWelcomeMessage(
  gymId: string,
  memberId: string,
  memberName: string,
  gymName: string,
  membershipType: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "irongraph_welcome",
    template_data: [memberName, gymName, membershipType],
  });
}

/**
 * Send fees payment reminder message
 */
export async function sendFeesReminderMessage(
  gymId: string,
  memberId: string,
  memberName: string,
  outstandingAmount: string,
  dueDate: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "irongraph_fees_reminder",
    template_data: [memberName, outstandingAmount, dueDate],
  });
}

/**
 * Send fees payment confirmation message
 */
export async function sendFeesPaymentMessage(
  gymId: string,
  memberId: string,
  memberName: string,
  paymentMonth: string,
  fees: string,
  transactionId: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "irongraph_fees_paid_confirmation",
    template_data: [memberName, paymentMonth, fees, transactionId],
  });
}

/**
 * Send fees overdue warning message
 */
export async function sendFeesOverdueMessage(
  gymId: string,
  memberId: string,
  memberName: string,
  overdueAmount: string,
  daysOverdue: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "irongraph_fees_overdue_warning",
    template_data: [memberName, overdueAmount, daysOverdue],
  });
}

/**
 * Send membership cancellation notification
 */
export async function sendMembershipCancellationMessage(
  gymId: string,
  memberId: string,
  memberName: string,
  cancellationReason: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "irongraph_membership_cancellation",
    template_data: [memberName, cancellationReason],
  });
}

/**
 * Send gym maintenance or holiday announcement to all members
 */
export async function sendMaintenanceAnnouncementMessage(
  gymId: string,
  memberId: string,
  gymName: string,
  maintenanceType: string,
  maintenanceDate: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  return sendWhatsAppNotification({
    gym_id: gymId,
    member_id: memberId,
    template_name: "gym_maintenance_announcement",
    template_data: [gymName, maintenanceType, maintenanceDate],
  });
}

/**
 * Broadcast maintenance message to all members of a gym
 */
export async function broadcastMaintenanceToAllMembers(
  gymId: string,
  gymName: string,
  maintenanceType: string,
  maintenanceDate: string
): Promise<{ success: boolean; sentCount: number; failedCount: number; error?: string }> {
  try {
    // Fetch all active members for the gym
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
        error: "Failed to fetch members: " + membersError?.message,
      };
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send message to each member
    for (const member of members) {
      const result = await sendMaintenanceAnnouncementMessage(
        gymId,
        member.id,
        gymName,
        maintenanceType,
        maintenanceDate
      );

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        console.error(
          `Failed to send maintenance message to member ${member.id}:`,
          result.error
        );
      }
    }

    return {
      success: failedCount === 0,
      sentCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error broadcasting maintenance message:", error);
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
