"use client";

import { useState } from "react";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";

export default function PaymentsPage() {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor revenue, pending invoices, and overdue collections.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
            >
              <span>＋</span>
              Add Payment
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold">
                Total Revenue
              </span>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <span>📈</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">
              $45,280.00
            </h3>
            <p className="text-xs text-emerald-500 font-bold">
              +12.5%{" "}
              <span className="text-slate-500 font-normal">
                from last month
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold">
                Pending Payments
              </span>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <span>⏳</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">
              12 / $1,200.00
            </h3>
            <p className="text-xs text-amber-500 font-bold">
              -2.4%{" "}
              <span className="text-slate-500 font-normal">
                than previous week
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold">
                Overdue
              </span>
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                <span>⚠️</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1 text-red-500">
              5 Payments
            </h3>
            <p className="text-xs text-emerald-500 font-bold">
              +1.2%{" "}
              <span className="text-slate-500 font-normal">recovery rate</span>
            </p>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-white dark:bg-[#1a1d23] rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <p className="text-sm text-slate-500">
                Monitor and manage all incoming payments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span>⛃</span>
                <span>Filter</span>
              </button>
              <button className="text-sm font-bold text-primary hover:underline px-2">
                View All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-800/50">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {/* Row 1 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Member"
                        className="w-10 h-10 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB668oFnGX0zvJaZJ_SmMTbvUJEqqB4CRnhEXzmlCDrVz1wz_Vn0rCMDPI8M0iQp_25zCqaRPmxRkaT7cP1uSdhI4mFmpwNyZaP8toYlE9g6lL87IHdEwCvMTVWZ8f0aRlToRb2RW1Sb-Y6FBoNGYWWpa4qyIfDhlIK0-s56_0IRA1Tj_noGypt0ukei0hyxJuEKEHZVgyUkLYPI_NBqdEJAwVYy08_FCYt-pFpJ39QipP2cApyTMHZGQ-kILlccDKAUL3Jt48CzvZk"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Alex Johnson</span>
                        <span className="text-[11px] text-slate-500">
                          Platinum Member
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">$120.00</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    Oct 24, 2023
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>💳</span>
                      <span>Credit Card</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span>⋯</span>
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Member"
                        className="w-10 h-10 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR7oR7d7GnnNB1lDE0txoSkK0tjQ3XoPfpbGuISnBuvP20KJN0-EqMlF0zHG1Uq4DDcPVZA-lhAY_HRQ2Q92fD-BBwJk3l7MpgF9ogPjm05jBU5iJvW4uZ8s1AkkMNXAw7Te4fr3A4KzApOM2B2i6oRhbm2RNGkm8kJEx5LPorkdFhOyaxFxESBRw4lBgrY51_7Uln7-ZOy2dW3EBDiN1lm4YkSXwHLRwoo-ud7smZFUnEiGF4fl6BRBcf-uuNyR16OAM_a8GcxIPf"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Maria Garcia</span>
                        <span className="text-[11px] text-slate-500">
                          Standard Membership
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">$85.00</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    Oct 25, 2023
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>💵</span>
                      <span>Cash</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span>⋯</span>
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Member"
                        className="w-10 h-10 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhISQ6KX8cZ0jOnomzKk7n96A8wJjogfTLH52KC5CPsxGYWCMpDgvt9BqK3lDKkgV2DlmQkMjsF4BN56fNfGFHJQsOro7LNxkB7pj-S3NGuwxx9_Ck6Tq9q1OMYdUk_y6ahGW6iwynDuhuD8_du5RFn9Vt3SCfK8AUSRr2S-JbDkBc16CmmMTjaGg_tOW25Ct54qjeILw7GUAeFJWyZIAkMt0Jcctffxt2tAV69fLYxu3fwRKDzIyrRCZJYJzFysf00vI2Fgdl7VKs"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">James Wilson</span>
                        <span className="text-[11px] text-slate-500">
                          Personal Training Bundle
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">$150.00</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    Oct 20, 2023
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>📲</span>
                      <span>Apple Pay</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-500">
                      Overdue
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span>⋯</span>
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Member"
                        className="w-10 h-10 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM1tHeg2yjE2nsQAFWAfYS8zF9_xhc48eQzauUshAMon-B14WFS_DXEjLI-juPf24OJOTyUch85rLoJ7e41KK2Doa-eJHJwLmbVcuxD5i6s5QJ1ONXfN4AHYqw3c_5uVz2sQMM7uDsACfWtf8kHwWjSHrArIqnByEajjC8Ro4k_Lg2rOKH7ufbkxoXZKZ2zSuUwpv87lPdaOYwoBD461bhyeiDaNq7-29FzMsDDftr6Y5cehO2_kELk2xj5MG2Go3w0HyThAMllgmQ"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Sarah Brown</span>
                        <span className="text-[11px] text-slate-500">
                          Yoga Plus Plan
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">$120.00</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    Oct 26, 2023
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>💳</span>
                      <span>Credit Card</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span>⋯</span>
                    </button>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Member"
                        className="w-10 h-10 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZvxhq8TUkyHC1yHctda9UNcczb8Mqv-B6wN98Qgbnud9gShnyYdmMI729IdNh_ONKjX3MdK18uv1MTTzSX2JATUEypj20fpWma8KJtxZZSX85_j7IMpLtTdU7I0wDTEorIzqq5Swu5M_n4TV6w1juYm8uh5_ovuwv58ZA6bNWJTbHbs1c5RxghGdvXd0aSpmPrAkyo_Ct2RcmyQNvNTbE9Rm_5haS-5FLwPGv6teEQ0qD87YpdsRhImd7_sRMWg2z7Eajq8xHxRWc"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Robert Reed</span>
                        <span className="text-[11px] text-slate-500">
                          Standard Membership
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">$200.00</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    Oct 22, 2023
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>🏦</span>
                      <span>Bank Transfer</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span>⋯</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing 1 to 5 of 45 results
            </span>
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                disabled
              >
                <span>‹</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">
                3
              </button>
              <span className="px-2 text-slate-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">
                9
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span>›</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </>
  );
}

