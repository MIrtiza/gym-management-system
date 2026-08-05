import { supabase } from "./supabase";

export interface SignupData {
  email?: string;
  phone?: string;
  password: string;
  gymName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email?: string;
  phone?: string;
}

/**
 * Sign up a new gym owner
 */
export async function signupUser(data: SignupData) {
  const { email, phone, password, gymName } = data;

  try {
    // Call the server-side signup API
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        phone,
        password,
        gymName,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Signup failed");
    }

    return { success: true, user: result.user, message: result.message };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(data: LoginData) {
  const { email, password } = data;

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, user: authData.user, session: authData.session };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}

/**
 * Update authenticated user's metadata
 */
export async function updateUserMetadata(metadata: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Update user metadata error:", error);
    throw error;
  }
}

/**
 * Change password with current password verification
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user?.email) {
      throw new Error("Unable to verify current user email.");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw signInError;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signoutUser() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Signout error:", error);
    throw error;
  }
}

/**
 * Get current user session
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
