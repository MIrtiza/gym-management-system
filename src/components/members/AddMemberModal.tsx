"use client";

import { useState } from "react";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NewMemberFormState) => void;
}

export interface NewMemberFormState {
  fullName: string;
  email: string;
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
    phone: "",
    dateOfBirth: "",
    gender: "",
    membershipPlan: "",
    startDate: "",
    sendWelcomeEmail: true,
  });

  if (!isOpen) return null;

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleWelcome = () => {
    setForm((prev) => ({ ...prev, sendWelcomeEmail: !prev.sendWelcomeEmail }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                      placeholder="alexander@example.com"
                      type="email"
                    />
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
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                    />
                  </div>
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

