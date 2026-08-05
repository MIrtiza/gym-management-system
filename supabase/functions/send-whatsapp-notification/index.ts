import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface SendWhatsAppRequest {
  gym_id: string;
  member_id: string;
  template_name: string;
  template_data: string[];
  pdf_url?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization");
    const expectedToken = Deno.env.get("WHATSAPP_SERVICE_TOKEN");

    if (!authHeader?.startsWith("Bearer ") || authHeader.slice(7) !== expectedToken) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const payload: SendWhatsAppRequest = await req.json();

    if (!payload.gym_id || !payload.member_id || !payload.template_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Force strict fallback if Deno env fails to parse on Windows shell environment
    const masterPhoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID") || "1103321039530877";
    const masterAccessToken = Deno.env.get("META_ACCESS_TOKEN");

    if (!masterPhoneNumberId || !masterAccessToken) {
      throw new Error("Platform master Meta credentials are not configured.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .select("is_whatsapp_enabled")
      .eq("id", payload.gym_id)
      .single();

    if (gymError || !gym) {
      throw new Error("Gym profile not found");
    }

    if (!gym.is_whatsapp_enabled) {
      return new Response(JSON.stringify({ success: false, message: "WhatsApp notifications disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("phone")
      .eq("id", payload.member_id)
      .single();

    if (memberError || !member?.phone) {
      throw new Error("Member not found or missing phone information");
    }

    const formattedPhone = formatPhoneToE164(member.phone);
    const whatsappApiEndpoint = `https://graph.facebook.com/v25.0/${masterPhoneNumberId}/messages`;

    // Dynamic language router: hello_world and fees confirmation use en_US
    const finalLanguageCode = "en_US"; // Default to English for now, can be extended to fetch from gym settings

    console.log("[WHATSAPP FUNC] finalLanguageCode:", finalLanguageCode);

    const messagePayload = buildMessagePayload(
      formattedPhone,
      payload.template_name,
      payload.template_data,
      finalLanguageCode,
      payload.pdf_url
    );

    console.log("[WHATSAPP FUNC] messagePayload:", JSON.stringify(messagePayload, null, 2));

    const metaResponse = await fetch(whatsappApiEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${masterAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });

    const metaResponseData = await metaResponse.json();
    console.log("[WHATSAPP FUNC] metaResponse status:", metaResponse.status, metaResponse.statusText);
    console.log("[WHATSAPP FUNC] metaResponseData:", JSON.stringify(metaResponseData, null, 2));

    if (metaResponse.ok && metaResponseData.messages?.[0]) {
      await supabase.from("whatsapp_logs").insert({
        gym_id: payload.gym_id,
        member_id: payload.member_id,
        status: "sent",
        message_type: extractMessageType(payload.template_name),
        meta_message_id: metaResponseData.messages[0].id,
        template_name: payload.template_name,
        template_data: payload.template_data,
      });

      return new Response(JSON.stringify({ success: true, message_id: metaResponseData.messages[0].id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const errorMessage = metaResponseData.error?.message || "Meta API Error";
      
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

      return new Response(JSON.stringify({ success: false, error: errorMessage }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatPhoneToE164(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = `92${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("0092")) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
}

function buildMessagePayload(
  recipientPhone: string,
  templateName: string,
  templateData: string[],
  languageCode: string,
  pdfUrl?: string
): Record<string, unknown> {
  const basePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
  };

  if (pdfUrl) {
    return {
      ...basePayload,
      type: "document",
      document: { link: pdfUrl, filename: `receipt_${Date.now()}.pdf` },
    };
  }

  const payload: Record<string, unknown> = {
    ...basePayload,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  // Only append components if array has items (prevents breaking hello_world)
  if (templateData && templateData.length > 0) {
    payload.template.components = [
      {
        type: "body",
        parameters: templateData.map((text) => ({
          type: "text",
          text: String(text),
        })),
      },
    ];
  }

  return payload;
}

function extractMessageType(templateName: string): string {
  if (templateName.includes("receipt") || templateName.includes("fees_paid")) return "receipt";
  return "reminder";
}