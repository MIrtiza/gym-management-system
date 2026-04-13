"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signupUser } from "@/lib/auth-service";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gymName: "",
    agreeToTrial: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useEmail, setUseEmail] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (useEmail && !formData.email) {
      return false;
    }
    if (!useEmail && !formData.phone) {
      return false;
    }
    if (!formData.password) {
      return false;
    }
    if (formData.password.length < 6) {
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      return false;
    }
    if (!formData.gymName) {
      return false;
    }
    if (useEmail && !formData.email.includes("@")) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signupUser({
        email: useEmail ? formData.email : undefined,
        phone: !useEmail ? formData.phone : undefined,
        password: formData.password,
        gymName: formData.gymName,
      });

      // Show success toast and redirect
      toast.success(
        `Welcome to IRONCORE, ${formData.gymName}! 🎉\nVerify your email to login.`,
        {
          duration: 3000,
        },
      );

      setTimeout(() => {
        router.push("/login?signup=success");
      }, 2000);
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err?.message || "Failed to create account", {
        duration: 4000,
      });
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
      {/* Signup Container */}
      <div className="w-full max-w-md px-6 py-8">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d6cf2] rounded-xl mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-4xl">💪</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            IRONCORE
          </h1>
          <p className="text-slate-400 font-medium">
            Start Your 30-Day Free Trial
          </p>
        </div>

        {/* Signup Card */}
        <div
          className="rounded-xl p-8 shadow-2xl"
          style={{
            background: "rgba(16, 23, 34, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@ironcore.com"
                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Gym Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="gymName"
                className="text-sm font-semibold text-slate-300"
              >
                Gym Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-lg">🏋️</span>
                </div>
                <input
                  id="gymName"
                  type="text"
                  name="gymName"
                  value={formData.gymName}
                  onChange={handleChange}
                  placeholder="Your Gym Name"
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-lg">🔒</span>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d6cf2] focus:border-transparent transition-all"
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

            {/* Free Trial Checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <input
                id="agreeToTrial"
                type="checkbox"
                name="agreeToTrial"
                checked={formData.agreeToTrial}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded-sm bg-white/10 border border-white/20 text-[#0d6cf2] focus:ring-2 focus:ring-[#0d6cf2] cursor-pointer"
              />
              <label
                htmlFor="agreeToTrial"
                className="text-sm text-slate-300 cursor-pointer"
              >
                <span className="font-semibold text-blue-400">
                  30 Days Free Trial
                </span>{" "}
                - Cancel anytime. Access all features for free during the trial
                period.
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0d6cf2] hover:bg-blue-600 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>
                {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </span>
              <span>{isLoading ? "⏳" : "→"}</span>
            </button>
          </form>

          {/* Terms and Conditions */}
          <p className="text-xs text-slate-500 text-center mt-4">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-[#0d6cf2] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[#0d6cf2] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
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
