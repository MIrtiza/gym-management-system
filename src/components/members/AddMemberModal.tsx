"use client";

import { useState } from "react";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export const AddMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddMemberModalProps) => {
  const [formData, setFormData] = useState({
    memberName: "",
    feeType: "membership",
    amount: "59.00",
    paymentMethod: "card",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    setFormData({
      memberName: "",
      feeType: "membership",
      amount: "59.00",
      paymentMethod: "card",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-950/60">
      {/* Modal Container */}
      <div className="w-full max-w-lg bg-white dark:bg-[#1a1d23] rounded-xl shadow-2xl border border-slate-200 dark:border-[#2d333d] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#2d333d] flex justify-between items-center bg-slate-50 dark:bg-[#0a0a0a]/20">
          <div>
            <h3 className="text-xl font-bold dark:text-white">
              Collect Payment
            </h3>
            <p className="text-sm text-slate-500">
              Fill in transaction details to process
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Search/Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Recipient Member
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                👤
              </span>
              <input
                type="text"
                name="memberName"
                value={formData.memberName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#2d333d] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="Search member name or ID..."
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Start typing to see matching members
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fee Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Fee Type
              </label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#2d333d] rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="membership">Membership</option>
                <option value="training">Personal Training</option>
                <option value="class">Group Class</option>
                <option value="other">Others</option>
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  $
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#2d333d] rounded-lg focus:ring-2 focus:ring-primary font-bold text-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "card", label: "Card", icon: "💳" },
                { value: "cash", label: "Cash", icon: "💵" },
                { value: "bank", label: "Bank", icon: "🏦" },
                { value: "apple", label: "Apple Pay", icon: "🍎" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`relative flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === method.value
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`text-xl`}>{method.icon}</span>
                  <span
                    className={`text-sm font-bold ${
                      formData.paymentMethod === method.value
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Process Payment Button */}
          <button
            type="submit"
            className="w-full bg-[#0d6cf2] hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <span>✓</span>
            Process Payment
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
            >
              Cancel Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
