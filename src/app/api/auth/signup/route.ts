import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create Supabase admin client (server-side)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface SignupRequest {
  email?: string;
  phone?: string;
  password: string;
  gymName: string;
}

export async function POST(request: Request) {
  try {
    const body: SignupRequest = await request.json();
    const { email, phone, password, gymName } = body;

    if (!password || !gymName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Sign up user with Supabase Auth
    console.log("[SIGNUP_API] Creating auth user:", email || phone);
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        phone: phone,
        password: password,
        user_metadata: {
          gym_name: gymName,
          phone: phone || null,
        },
        email_confirm: true, // Auto-confirm (skip email verification)
      });

    if (authError || !authData.user) {
      console.error("[SIGNUP_API] Auth error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to create user" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    console.log("[SIGNUP_API] User created:", userId);

    // 2. Create gym record
    console.log("[SIGNUP_API] Creating gym record");
    const { data: gymData, error: gymError } = await supabaseAdmin
      .from("gyms")
      .insert({
        owner_id: userId,
        gym_name: gymName,
      })
      .select()
      .single();

    if (gymError || !gymData) {
      console.error("[SIGNUP_API] Gym creation error:", gymError);
      // Clean up: delete the user if gym creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: gymError?.message || "Failed to create gym" },
        { status: 400 }
      );
    }

    const gymId = gymData.id;
    console.log("[SIGNUP_API] Gym created:", gymId);

    // 3. Update user metadata with gym_id
    console.log("[SIGNUP_API] Updating user metadata with gym_id");
    const { data: updatedUser, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          gym_name: gymName,
          gym_id: gymId,
          phone: phone || null,
        },
      });

    if (updateError) {
      console.error("[SIGNUP_API] Metadata update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update user metadata" },
        { status: 400 }
      );
    }

    console.log("[SIGNUP_API] Success! User signup complete");
    return NextResponse.json(
      {
        success: true,
        user: updatedUser.user,
        message: "Signup successful. Please verify your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SIGNUP_API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
