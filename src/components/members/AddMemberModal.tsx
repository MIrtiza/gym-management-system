"use client";

import { useState } from "react";
import {
  formatPhoneNumber,
  validatePhoneNumber,
  validateEmail,
  COUNTRY_PHONE_FORMATS,
} from "@/lib/utils";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NewMemberFormState) => void;
}

export interface NewMemberFormState {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  membershipPlan: string;
  startDate: string;
  sendWelcomeEmail: boolean;
}

export const AddMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddMemberModalProps) => {
  const [form, setForm] = useState<NewMemberFormState>({
    fullName: "",
    email: "",
    countryCode: "US",
    phone: "",
    dateOfBirth: "",
    gender: "",
    membershipPlan: "",
    startDate: "",
    sendWelcomeEmail: true,
  });

  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  if (!isOpen) return null;

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error messages when user starts typing
    if (name === "phone" && phoneError) {
      setPhoneError("");
    }
    if (name === "email" && emailError) {
      setEmailError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, "");

    // Get max digits for current country
    const format =
      COUNTRY_PHONE_FORMATS[
        form.countryCode as keyof typeof COUNTRY_PHONE_FORMATS
      ];
    const maxDigits = format?.maxDigits || 15;

    // Limit to max digits for the country
    if (digitsOnly.length > maxDigits) {
      return; // Don't update if exceeds max digits
    }

    // Format the phone number based on country code
    if (digitsOnly) {
      const formatted = formatPhoneNumber(digitsOnly, form.countryCode);
      setForm((prev) => ({ ...prev, phone: formatted }));
    } else {
      setForm((prev) => ({ ...prev, phone: "" }));
    }

    setPhoneError("");
  };

  const handleToggleWelcome = () => {
    setForm((prev) => ({ ...prev, sendWelcomeEmail: !prev.sendWelcomeEmail }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.fullName.trim()) {
      alert("❌ Full Name is required");
      return;
    }
    if (!form.email.trim()) {
      alert("❌ Email Address is required");
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "Invalid email");
      alert(`❌ ${emailValidation.error}`);
      return;
    }

    if (!form.countryCode.trim()) {
      alert("❌ Country Code is required");
      return;
    }
    if (!form.phone.trim()) {
      alert("❌ Phone Number is required");
      return;
    }

    // Validate phone number format
    const phoneValidation = validatePhoneNumber(form.phone, form.countryCode);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error || "Invalid phone number");
      alert(`❌ ${phoneValidation.error}`);
      return;
    }

    if (!form.dateOfBirth.trim()) {
      alert("❌ Date of Birth is required");
      return;
    }
    if (!form.gender.trim()) {
      alert("❌ Gender is required");
      return;
    }
    if (!form.membershipPlan.trim()) {
      alert("❌ Membership Plan is required");
      return;
    }
    if (!form.startDate.trim()) {
      alert("❌ Start Date is required");
      return;
    }

    onSubmit?.(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#1a202c] dark:bg-[#161b22] w-full max-w-2xl rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Add New Member
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Register a new athlete and assign a membership plan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close add member modal"
          >
            ✕
          </button>
        </div>

        {/* Body / Form */}
        <div className="px-8 py-8 overflow-y-auto max-h-[70vh]">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                <span className="text-lg">👤</span>
                <span>Personal Information</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      🪪
                    </span>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                      placeholder="e.g. Alexander Pierce"
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      ✉️
                    </span>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full bg-slate-800/50 border rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-600 ${
                        emailError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-700 focus:ring-primary"
                      }`}
                      placeholder="alexander@example.com"
                      type="email"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">⚠️ {emailError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Country Code
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      🌍
                    </span>
                    <select
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    >
                      <option value="US">🇺🇸 United States (+1)</option>
                      <option value="UK">🇬🇧 United Kingdom (+44)</option>
                      <option value="CA">🇨🇦 Canada (+1)</option>
                      <option value="AU">🇦🇺 Australia (+61)</option>
                      <option value="IN">🇮🇳 India (+91)</option>
                      <option value="PK">🇵🇰 Pakistan (+92)</option>
                      <option value="BD">🇧🇩 Bangladesh (+880)</option>
                      <option value="DE">🇩🇪 Germany (+49)</option>
                      <option value="FR">🇫🇷 France (+33)</option>
                      <option value="JP">🇯🇵 Japan (+81)</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      ▾
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      📞
                    </span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      className={`w-full bg-slate-800/50 border rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-600 ${
                        phoneError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-700 focus:ring-primary"
                      }`}
                      placeholder={`e.g. ${COUNTRY_PHONE_FORMATS[form.countryCode as keyof typeof COUNTRY_PHONE_FORMATS]?.code || ""} (555) 000-0000`}
                      type="tel"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">⚠️ {phoneError}</p>
                  )}
                  {!phoneError && (
                    <p className="text-xs text-slate-500 mt-1">
                      Max{" "}
                      {COUNTRY_PHONE_FORMATS[
                        form.countryCode as keyof typeof COUNTRY_PHONE_FORMATS
                      ]?.maxDigits || 15}{" "}
                      digits for {form.countryCode}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      🎂
                    </span>
                    <input
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all scheme-dark"
                      type="date"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Gender
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      ⚧
                    </span>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      ▾
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                <span className="text-lg">💳</span>
                <span>Membership Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Membership Plan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      ✅
                    </span>
                    <select
                      name="membershipPlan"
                      value={form.membershipPlan}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Choose a Plan</option>
                      <option value="starter">Starter Plan - $29/mo</option>
                      <option value="pro">Pro Plan - $59/mo</option>
                      <option value="elite">Elite Plan - $99/mo</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      ▾
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Start Date
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      📅
                    </span>
                    <input
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all scheme-dark"
                      type="date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification toggle */}
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <span className="text-primary text-xl">🔔</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  Send Welcome Email
                </p>
                <p className="text-xs text-slate-400">
                  The member will receive their login credentials immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleWelcome}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.sendWelcomeEmail ? "bg-primary" : "bg-slate-700"
                }`}
                aria-pressed={form.sendWelcomeEmail}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    form.sendWelcomeEmail ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/10 bg-slate-900/30 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-primary hover:bg-primary/90 rounded-lg text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <span>➕</span>
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};
