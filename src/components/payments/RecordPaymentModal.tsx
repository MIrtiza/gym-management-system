"use client";

import { useState } from "react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentFormState {
  memberQuery: string;
  feeType: string;
  amount: string;
  paymentMethod: "card" | "cash" | "bank" | "wallet";
  note: string;
}

export const RecordPaymentModal = ({
  isOpen,
  onClose,
}: RecordPaymentModalProps) => {
  const [form, setForm] = useState<PaymentFormState>({
    memberQuery: "",
    feeType: "Membership Renewal",
    amount: "",
    paymentMethod: "card",
    note: "",
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMethod = (method: PaymentFormState["paymentMethod"]) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now we just close the modal after "processing"
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-blur bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-[600px] bg-[#1A1B1F] rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Record New Payment
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
            aria-label="Close payment modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Search */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Select Member
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="text-[20px]">🔍</span>
              </div>
              <input
                type="text"
                name="memberQuery"
                value={form.memberQuery}
                onChange={handleChange}
                className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-slate-500 transition-all outline-none"
                placeholder="Search by name or ID..."
              />
            </div>
          </div>

          {/* Fee type + amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Fee Type
              </label>
              <select
                name="feeType"
                value={form.feeType}
                onChange={handleChange}
                className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 text-white outline-none"
              >
                <option>Membership Renewal</option>
                <option>Personal Training</option>
                <option>Day Pass</option>
                <option>Locker Rental</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <span className="text-lg font-medium">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-8 pr-4 text-white placeholder:text-slate-500 font-bold text-lg outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "card", label: "Credit Card", icon: "💳" },
                { key: "cash", label: "Cash", icon: "💵" },
                { key: "bank", label: "Transfer", icon: "🏦" },
                { key: "wallet", label: "Digital Wallet", icon: "📲" },
              ].map((method) => {
                const isActive = form.paymentMethod === method.key;
                return (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() =>
                      handleSelectMethod(
                        method.key as PaymentFormState["paymentMethod"],
                      )
                    }
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/10 text-white"
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="mb-2 text-2xl">{method.icon}</span>
                    <span className="text-xs font-semibold">
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Internal Note
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full bg-[#282f39] border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg p-4 text-white placeholder:text-slate-500 h-20 resize-none outline-none"
              placeholder="Add a note about this transaction..."
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span>✔</span>
              Process Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

