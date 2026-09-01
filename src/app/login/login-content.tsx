"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/auth-service";
import { useAuth } from "@/lib/auth-context";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Show success message if coming from signup
  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      setSuccess(
        "Signup successful! Please verify your email before logging in.",
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email");
        setIsLoading(false);
        return;
      }

      const result = await loginUser({ email, password });

      // Redirect to dashboard on successful login
      router.push("/");
    } catch (err: any) {
      const errorMessage =
        err?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      console.error("Login error:", err);
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
      {/* Login Container */}
      <div className="w-full max-w-[480px] px-6 py-12">
        {/* Brand Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d6cf2] rounded-xl mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-4xl">💪</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            IRONCORE
          </h1>
          <p className="text-slate-400 font-medium">Gym Management System</p>
        </div>

        {/* Login Card */}
        <div
          className="glass-effect rounded-xl p-8 shadow-2xl"
          style={{
            background: "rgba(16, 23, 34, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Email Field */}
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

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-300"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-[#0d6cf2] hover:text-blue-400 transition-colors uppercase tracking-tight"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-lg">🔒</span>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0d6cf2] hover:bg-blue-600 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>
                {isLoading ? "SIGNING IN..." : "SIGN IN TO ADMIN CONSOLE"}
              </span>
              <span>{isLoading ? "⏳" : "→"}</span>
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#0d6cf2] font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
          <p className="text-slate-500 text-xs">
            Get{" "}
            <span className="text-blue-400 font-semibold">30 days free</span>{" "}
            when you sign up
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
