import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * CRON Job Endpoint for Scheduled WhatsApp Notifications
 * 
 * This endpoint should be called by an external scheduler (e.g., Vercel Cron, AWS Lambda, Supabase Cron)
 * 
 * Expected schedule:
 * - Daily at 09:00 AM for membership expiry reminders (3-day and day-of)
 * - Configure via Supabase functions or external service
 * 
 * Security: Verify the CRON_SECRET header to prevent unauthorized access
 */

const CRON_SECRET = process.env.WHATSAPP_CRON_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WHATSAPP_SERVICE_TOKEN = process.env.WHATSAPP_SERVICE_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !CRON_SECRET) {
  throw new Error("Missing required environment variables for CRON job");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("Authorization");
    const expectedToken = `Bearer ${CRON_SECRET}`;

    if (authHeader !== expectedToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const action = request.nextUrl.searchParams.get("action") || "expiry-reminders";

    let result;

    switch (action) {
      case "expiry-reminders":
        result = await sendExpiryReminders();
        break;
      case "process-pending":
        result = await processPendingLogs();
        break;
      case "retry-failed":
        result = await retryFailedLogs();
        break;
      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      ...result,
      requested_action: action,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CRON job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Send membership expiry reminders for members with expiring memberships
 */
async function sendExpiryReminders() {
  try {
    // Call the database function to create pending logs
    const { error } = await supabase.rpc("send_membership_expiry_reminder");

    if (error) {
      throw new Error(`Database function error: ${error.message}`);
    }

    // Get all pending expiry warning logs
    const { data: pendingLogs, error: fetchError } = await supabase
      .from("whatsapp_logs")
      .select("*")
      .eq("status", "pending")
      .eq("message_type", "expiry_warning")
      .order("created_at", { ascending: true })
      .limit(100);

    if (fetchError) {
      throw new Error(`Failed to fetch pending logs: ${fetchError.message}`);
    }

    let successCount = 0;
    let failureCount = 0;

    // Send each pending log
    for (const log of pendingLogs || []) {
      const sendResult = await sendWhatsAppViaEdgeFunction({
        gym_id: log.gym_id,
        member_id: log.member_id,
        template_name: log.template_name,
        template_data: log.template_data,
      });

      if (sendResult.success) {
        // Update log as sent
        await supabase
          .from("whatsapp_logs")
          .update({
            status: "sent",
            meta_message_id: sendResult.message_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", log.id);

        successCount++;
      } else {
        // Update log as failed
        await supabase
          .from("whatsapp_logs")
          .update({
            status: "failed",
            error_message: sendResult.error,
            retry_count: (log.retry_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", log.id);

        failureCount++;
      }
    }

    return {
      action: "send_expiry_reminders",
      total_processed: (pendingLogs || []).length,
      success_count: successCount,
      failure_count: failureCount,
    };
  } catch (error) {
    throw new Error(`Send expiry reminders error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Process all pending WhatsApp logs by calling the edge function
 */
async function processPendingLogs() {
  try {
    const { data: pendingLogs, error } = await supabase
      .from("whatsapp_logs")
      .select("*")
      .eq("status", "pending")
      .lt("retry_count", "max_retries")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch pending logs: ${error.message}`);
    }

    let successCount = 0;
    let failureCount = 0;

    for (const log of pendingLogs || []) {
      const sendResult = await sendWhatsAppViaEdgeFunction({
        gym_id: log.gym_id,
        member_id: log.member_id,
        template_name: log.template_name,
        template_data: log.template_data,
        pdf_url: log.template_data?.pdf_url,
      });

      if (sendResult.success) {
        await supabase
          .from("whatsapp_logs")
          .update({
            status: "sent",
            meta_message_id: sendResult.message_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", log.id);

        successCount++;
      } else {
        await supabase
          .from("whatsapp_logs")
          .update({
            status: "failed",
            error_message: sendResult.error,
            retry_count: (log.retry_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", log.id);

        failureCount++;
      }
    }

    return {
      action: "process_pending_logs",
      total_processed: (pendingLogs || []).length,
      success_count: successCount,
      failure_count: failureCount,
    };
  } catch (error) {
    throw new Error(`Process pending logs error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retry failed logs that haven't exceeded max retry count
 */
async function retryFailedLogs() {
  try {
    const { data: failedLogs, error } = await supabase
      .from("whatsapp_logs")
      .select("*")
      .eq("status", "failed")
      .lt("retry_count", "max_retries")
      .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order("retry_count", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(30);

    if (error) {
      throw new Error(`Failed to fetch failed logs: ${error.message}`);
    }

    let successCount = 0;
    let retryCount = 0;

    for (const log of failedLogs || []) {
      const sendResult = await sendWhatsAppViaEdgeFunction({
        gym_id: log.gym_id,
        member_id: log.member_id,
        template_name: log.template_name,
        template_data: log.template_data,
        pdf_url: log.template_data?.pdf_url,
      });

      if (sendResult.success) {
        await supabase
          .from("whatsapp_logs")
          .update({
            status: "sent",
            meta_message_id: sendResult.message_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", log.id);

        successCount++;
      } else {
        retryCount++;
        await supabase
          .from("whatsapp_logs")
          .update({
            retry_count: (log.retry_count || 0) + 1,
            error_message: sendResult.error,
            updated_at: new Date().toISOString(),
          })
          .eq("id", log.id);
      }
    }

    return {
      action: "retry_failed_logs",
      total_processed: (failedLogs || []).length,
      success_count: successCount,
      retry_count: retryCount,
    };
  } catch (error) {
    throw new Error(`Retry failed logs error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Call the Edge Function to send WhatsApp messages
 */
async function sendWhatsAppViaEdgeFunction(payload: {
  gym_id: string;
  member_id: string;
  template_name: string;
  template_data: string[];
  pdf_url?: string;
}) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-whatsapp-notification`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to send message",
      };
    }

    return {
      success: true,
      message_id: data.message_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
