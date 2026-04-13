"use client";

import { useState } from "react";
import type { TrialStatus } from "@/lib/gym-service";

interface TrialBannerProps {
  trialStatus: TrialStatus;
  onUpgradeClick?: () => void;
  onClose?: () => void;
}

export const TrialBanner = ({
  trialStatus,
  onUpgradeClick,
  onClose,
}: TrialBannerProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (trialStatus.isTrialExpired) {
    return (
      <div className="mb-8 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-4xl">⏰</div>
            <div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                Trial Period Expired
              </h3>
              <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-1">
                Your 30-day free trial has ended. Upgrade now to continue using
                all features.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUpgradeClick}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-600/20 whitespace-nowrap"
            >
              Get Full Access
            </button>
            <button
              onClick={onClose}
              className="p-2 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Close banner"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysPercentage =
    (trialStatus.daysRemaining / trialStatus.trialDays) * 100;

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        {/* Trial Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Free Trial Active
            </h3>
            <p className="text-sm text-blue-500/80 dark:text-blue-400/80 mt-1">
              You have{" "}
              <span className="font-bold">
                {trialStatus.daysRemaining} days
              </span>{" "}
              left in your 30-day free trial
            </p>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-blue-500/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
                style={{ width: `${100 - daysPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-blue-500/70">
                {trialStatus.daysUsed} of {trialStatus.trialDays} days used
              </p>
              <p className="text-xs font-semibold text-blue-600">
                Expires:{" "}
                {new Date(trialStatus.trialEndDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUpgradeClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap flex items-center gap-2"
          >
            <span>✨</span>
            Get Full Access
          </button>
          <button
            onClick={onClose}
            className="p-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Close banner"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Details Expandable */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
      >
        {showDetails ? "Hide" : "Show"} trial details
      </button>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-blue-500/20 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trialStatus.daysRemaining}
            </p>
            <p className="text-xs text-blue-500/70 mt-1">Days Left</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trialStatus.daysUsed}
            </p>
            <p className="text-xs text-blue-500/70 mt-1">Days Used</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trialStatus.percentageUsed}%
            </p>
            <p className="text-xs text-blue-500/70 mt-1">Trial Used</p>
          </div>
        </div>
      )}
    </div>
  );
};
