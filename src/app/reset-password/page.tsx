"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth-service";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Check if user has valid reset token from URL
  useEffect(() => {
    const checkToken = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session?.user?.recovery_sent_at) {
          setIsValidToken(true);
        } else {
          setError(
            "Invalid or expired reset link. Please request a new password reset.",
          );
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(newPassword);
      setSuccess(true);

      // Redirect after delay
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <span className="text-4xl">⏳</span>
          </div>
          <p className="text-white mt-4">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMhgd9M4__4IJhNmZhO1-KRnnhc_I7ahSStDkMZGvue0eujtLE0aKsg_exIZ5iVuOVpsQtoFPRSavgWizyb-y8pXYBLfOB_1xqcTFrXdroMxYrQMLn--z8g5djkgHyvNYqfihLrimldamtqHUZiZ7sx_5gxjyddlmtUKh-9puqvp-FGHgDXqTEg19h7VJ7TL7J4PjoMNfy9yCI-BgJeN0PdqYP0tdY-5tQIM6yCzMNLJoaQD5sxkiIHLZmY9dMcNGIP_cyMvm0gG3U')`,
      }}
    >
      {/* Reset Password Container */}
      <div className="w-full max-w-[480px] px-6 py-12">
        {/* Brand Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d6cf2] rounded-xl mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Set New Password
          </h1>
          <p className="text-slate-400 font-medium">
            Create a strong password for your account
          </p>
        </div>

        {/* Reset Password Card */}
        <div
          className="rounded-xl p-8 shadow-2xl"
          style={{
            background: "rgba(16, 23, 34, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {!isValidToken && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                  Your reset link is invalid or expired. Please request a new
                  one.
                </div>
              )}

              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-semibold text-slate-300"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-lg">🔒</span>
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
                    disabled={!isValidToken}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-slate-300"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-lg">🔒</span>
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
                    disabled={!isValidToken}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <button
                type="submit"
                disabled={isLoading || !isValidToken}
                className="w-full bg-[#0d6cf2] hover:bg-blue-600 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "RESETTING..." : "SET NEW PASSWORD"}</span>
                <span>{isLoading ? "⏳" : "→"}</span>
              </button>
            </form>
          ) : (
            // Success Message
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full">
                <span className="text-4xl">✅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Password Reset Success
                </h2>
                <p className="text-slate-400">
                  Your password has been successfully reset. You can now log in
                  with your new password.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block bg-[#0d6cf2] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-slate-500 text-sm">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-[#0d6cf2] font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .glass-effect {
          background: rgba(16, 23, 34, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
