"use client";

import type { TrialStatus } from "@/lib/gym-service";

interface TrialCounterProps {
  trialStatus: TrialStatus;
  onClick?: () => void;
}

export const TrialCounter = ({ trialStatus, onClick }: TrialCounterProps) => {
  if (trialStatus.isTrialExpired) {
    return (
      <button
        onClick={onClick}
        className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
      >
        <span>⏰</span>
        <span>Trial Expired</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all flex items-center gap-1.5"
    >
      <span>⏳</span>
      <span>{trialStatus.daysRemaining}d left</span>
    </button>
  );
};
