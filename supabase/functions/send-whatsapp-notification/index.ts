import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface SendWhatsAppRequest {
  gym_id: string;
  member_id: string;
  template_name: string;
  template_data: string[];
  pdf_url?: string;
}

interface WhatsAppTemplate {
  name: string;
  language_code: string;
  components?: Array<{
    type: string;
    parameters?: Array<{ type: string; text?: string; image?: { link: string } }>;
  }>;
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Security: Only allow POST requests from app service role
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify authorization header
    const authHeader = req.headers.get("Authorization");
    const expectedToken = Deno.env.get("WHATSAPP_SERVICE_TOKEN");

    if (!authHeader?.startsWith("Bearer ") || authHeader.slice(7) !== expectedToken) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: SendWhatsAppRequest = await req.json();

    // Validate required fields
    if (!payload.gym_id || !payload.member_id || !payload.template_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch gym WhatsApp credentials
    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .select("whatsapp_phone_number_id, whatsapp_waba_id, whatsapp_access_token, is_whatsapp_enabled")
      .eq("id", payload.gym_id)
      .single();

    if (gymError || !gym || !gym.is_whatsapp_enabled) {
      throw new Error("WhatsApp not configured or enabled for this gym");
    }

    // 2. Fetch member phone number
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("phone")
      .eq("id", payload.member_id)
      .single();

    if (memberError || !member?.phone) {
      throw new Error("Member not found or missing phone number");
    }

    // 3. Format phone number to E.164 format
    const formattedPhone = formatPhoneToE164(member.phone);

    // 4. Build WhatsApp API request
    const whatsappApiEndpoint = `https://graph.instagram.com/v19.0/${gym.whatsapp_phone_number_id}/messages`;

    const messagePayload = buildMessagePayload(
      formattedPhone,
      payload.template_name,
      payload.template_data,
      payload.pdf_url
    );

    // 5. Send to Meta WhatsApp Cloud API
    const metaResponse = await fetch(whatsappApiEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${gym.whatsapp_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });

    const metaResponseData = await metaResponse.json();

    // 6. Log the result
    if (metaResponse.ok && metaResponseData.messages?.[0]) {
      const { error: logError } = await supabase.from("whatsapp_logs").insert({
        gym_id: payload.gym_id,
        member_id: payload.member_id,
        status: "sent",
        message_type: extractMessageType(payload.template_name),
        meta_message_id: metaResponseData.messages[0].id,
        template_name: payload.template_name,
        template_data: payload.template_data,
      });

      if (logError) {
        console.error("Error logging WhatsApp message:", logError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message_id: metaResponseData.messages[0].id,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Log failure
      const errorMessage = metaResponseData.error?.message || "Unknown error from Meta API";

      await supabase.from("whatsapp_logs").insert({
        gym_id: payload.gym_id,
        member_id: payload.member_id,
        status: "failed",
        message_type: extractMessageType(payload.template_name),
        template_name: payload.template_name,
        template_data: payload.template_data,
        error_message: errorMessage,
        retry_count: 0,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("WhatsApp notification error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Format phone number to E.164 standard (e.g., +923001234567 for Pakistan)
 */
function formatPhoneToE164(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // If it starts with 0 (local format), replace with country code 92 for Pakistan
  if (cleaned.startsWith("0")) {
    return `+92${cleaned.slice(1)}`;
  }

  // If it doesn't start with +, assume it's a local number and add +92
  if (!cleaned.startsWith("92")) {
    return `+92${cleaned}`;
  }

  // Otherwise, add + if not present
  return `+${cleaned}`;
}

/**
 * Build message payload for Meta WhatsApp Cloud API
 */
function buildMessagePayload(
  recipientPhone: string,
  templateName: string,
  templateData: string[],
  pdfUrl?: string
): Record<string, unknown> {
  const basePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
  };

  // If PDF URL is provided, use document template
  if (pdfUrl) {
    return {
      ...basePayload,
      type: "document",
      document: {
        link: pdfUrl,
        filename: `payment_slip_${Date.now()}.pdf`,
      },
    };
  }

  // Otherwise, use template-based message
  return {
    ...basePayload,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en",
      },
      components: [
        {
          type: "body",
          parameters: templateData.map((text) => ({
            type: "text",
            text: text,
          })),
        },
      ],
    },
  };
}

/**
 * Extract message type from template name
 */
function extractMessageType(templateName: string): string {
  if (templateName.includes("receipt") || templateName.includes("fees_paid")) return "receipt";
  if (templateName.includes("reminder") || templateName.includes("fees_reminder")) return "reminder";
  if (templateName.includes("welcome") || templateName.includes("admission")) return "welcome";
  if (templateName.includes("expiry")) return "expiry_warning";
  if (templateName.includes("overdue")) return "fees_overdue";
  if (templateName.includes("cancellation")) return "cancellation";
  if (templateName.includes("maintenance")) return "maintenance";
  return "reminder";
}
