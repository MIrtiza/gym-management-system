import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verify against environment variable OR hardcoded token string for testing
  const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN || "verify-token-1234567890";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // Meta requires the challenge parameter back as plain text with HTTP 200
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  // Simple receiver for webhook events (no replies expected). Log body for debugging.
  try {
    const body = await request.json().catch(() => null);
    // You can process or route messages here if needed. For now just return 200.
    console.log("[WHATSAPP WEBHOOK] Received POST", JSON.stringify(body));
    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("[WHATSAPP WEBHOOK] Error parsing POST", err);
    return new NextResponse("Bad Request", { status: 400 });
  }
}
