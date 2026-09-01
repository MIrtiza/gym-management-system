"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordReset } from "@/lib/auth-service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [useEmail, setUseEmail] = useState(true);
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (useEmail && !email) {
      setError("Please enter an email address");
      return;
    }
    if (!useEmail && !phone) {
      setError("Please enter a phone number");
      return;
    }
    if (useEmail && !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      if (useEmail) {
        await sendPasswordReset(email);
      } else {
        // TODO: Implement phone-based password reset
        // For now, show an error
        setError(
          "Phone-based password reset is not yet available. Please use email.",
        );
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect after delay
      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (err: any) {
      const errorMessage =
        err?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMhgd9M4__4IJhNmZhO1-KRnnhc_I7ahSStDkMZGvue0eujtLE0aKsg_exIZ5iVuOVpsQtoFPRSavgWizyb-y8pXYBLfOB_1xqcTFrXdroMxYrQMLn--z8g5djkgHyvNYqfihLrimldamtqHUZiZ7sx_5gxjyddlmtUKh-9puqvp-FGHgDXqTEg19h7VJ7TL7J4PjoMNfy9yCI-BgJeN0PdqYP0tdY-5tQIM6yCzMNLJoaQD5sxkiIHLZmY9dMcNGIP_cyMvm0gG3U')`,
      }}
    >
      {/* Forgot Password Container */}
      <div className="w-full max-w-[480px] px-6 py-12">
        {/* Brand Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d6cf2] rounded-xl mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-4xl">🔑</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Reset Password
          </h1>
          <p className="text-slate-400 font-medium">
            We'll send you a link to reset your password
          </p>
        </div>

        {/* Forgot Password Card */}
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

              {/* Toggle Email/Phone */}
              <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setUseEmail(true)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                    useEmail
                      ? "bg-[#0d6cf2] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setUseEmail(false)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                    !useEmail
                      ? "bg-[#0d6cf2] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Phone
                </button>
              </div>

              {/* Email or Phone Field */}
              {useEmail ? (
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-300"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-lg">✉️</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ironcore.com"
                      className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-slate-300"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-lg">📱</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-slate-300">
                  We'll send a password reset link to your{" "}
                  {useEmail ? "email" : "phone number"}. Check your{" "}
                  {useEmail ? "email" : "messages"} within 5 minutes.
                </p>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0d6cf2] hover:bg-blue-600 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "SENDING..." : "SEND RESET LINK"}</span>
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
                  Check Your {useEmail ? "Email" : "Messages"}
                </h2>
                <p className="text-slate-400">
                  We've sent a password reset link to{" "}
                  <span className="text-white font-semibold">
                    {useEmail ? email : phone}
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400">
                  Click the link in the message to reset your password.
                  Redirecting to login in 5 seconds...
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block bg-[#0d6cf2] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
              >
                Back to Login
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
          <p className="text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#0d6cf2] font-bold hover:underline"
            >
              Create One
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
