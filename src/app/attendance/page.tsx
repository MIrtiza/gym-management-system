"use client";

export default function AttendancePage() {
  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Attendance Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time check-in monitoring and traffic analytics for{" "}
            <span className="text-primary font-semibold">Today</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-white dark:bg-slate-700 shadow-sm">
              Today
            </button>
            <button className="px-4 py-1.5 text-xs font-bold text-slate-500 rounded-md">
              Week
            </button>
            <button className="px-4 py-1.5 text-xs font-bold text-slate-500 rounded-md">
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl flex items-center justify-between border-l-4 border-l-primary bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/5 px-6 py-6">
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Today</p>
            <h3 className="text-3xl font-black mt-1">142</h3>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-2">
              <span>📈</span>
              <span>+12% from yesterday</span>
            </div>
          </div>
          <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <span className="text-2xl">👥</span>
          </div>
        </div>

        <div className="rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500 bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/5 px-6 py-6">
          <div>
            <p className="text-slate-400 text-sm font-medium">
              Currently In-Gym
            </p>
            <h3 className="text-3xl font-black mt-1">28</h3>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-bold mt-2">
              <span>ℹ️</span>
              <span>Capacity: 45% full</span>
            </div>
          </div>
          <div className="size-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
            <span className="text-2xl">📍</span>
          </div>
        </div>

        <div className="rounded-xl flex items-center justify-between border-l-4 border-l-orange-500 bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/5 px-6 py-6">
          <div>
            <p className="text-slate-400 text-sm font-medium">Peak Time</p>
            <h3 className="text-3xl font-black mt-1 text-nowrap">
              18:00 - 19:00
            </h3>
            <div className="flex items-center gap-1 text-orange-500 text-xs font-bold mt-2">
              <span>⚠️</span>
              <span>Highest traffic period</span>
            </div>
          </div>
          <div className="size-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="rounded-xl overflow-hidden bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/5">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold">Recent Logs</h4>
          <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
            <span>⛃</span>
            <span>Filter Results</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Member
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Check-in
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Check-out
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Duration
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* Row 1 */}
              <tr className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-300 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        alt="Professional profile of a gym member"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtgKxImZr3Oycny4O4d85Ug-AKcAzDlfmiuahAu_RQwxc4Rd_mN9ospCh3Zax2PCik0y400HEbYijeTvqAy0QX-_eoiMrNjfyudwXo7Jkt9JbfAVaLxuyYTtqiKh7WvR7b5SF_l2_Z2tTKsZoa7bvHormhAPYmAZzBaCr5o1RpWoNQ6clS84vQ0kiTVs2aNXVFSUXTVg3yCwZ6y0XnP53v_YGWOXKuyz0ORA1nlTvt2cfb7-MUbXowY78wayN9EIyuOEKYYUzIBrRB"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Alex Johnson</p>
                      <p className="text-xs text-slate-500 font-medium">
                        ID: #FP-9021
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">08:14 AM</td>
                <td className="px-6 py-4 text-sm font-medium">09:30 AM</td>
                <td className="px-6 py-4 text-sm text-slate-400">1h 16m</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Left
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>👁️</span>
                    </button>
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>✏️</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-300 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        alt="Portrait of a female gym member"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQngcaLl92rPtsGHVKqt-R2ghUYSJBiOg-mtlydIuKrGQp9F1ZFf5FskymLY1a74q9Z-75h_cvxPsoNwaunBoVDEwjwP3PHUulDgyFHyhEl_aEKu2zTp8KVxxn0yLVCRP9YJkLvDzytCRkx7UM_sUQTOHZE0xM1oFUuZJ26DYwFw6TCypWayE8ZxmOEW6-qIugoSPQyKH51mId0LYQkAxbk5TUK9xBChu9tiynNpSzjZbRfgtZAMW7P8w4EUP1fpsPAhH6jyM-S9Xt"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sarah Williams</p>
                      <p className="text-xs text-slate-500 font-medium">
                        ID: #FP-7822
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">10:05 AM</td>
                <td className="px-6 py-4 text-sm font-medium">--:--</td>
                <td className="px-6 py-4 text-sm text-slate-400">Active</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary ring-1 ring-primary/30">
                    Just In
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>👁️</span>
                    </button>
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>✏️</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-300 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        alt="Portrait of an athletic male gym member"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQsICIIpDMMj1HukLqtm9WVV3eMPzmGHMp_B8Bd7429x7Tdk07X4y1fyNNmA29A-IlgP6NR7QVjC-47e3iSJYJ9JTnYsUaNhwU97eU2Kre7r4Alf167Nc6H1kjlVL3jLags1KHWv2mznc7RBRL9V16zsJLGRJpYpplbwAi_HKlaC_jve9xwtmn7ofkYZDdYApK6q5LdoHpG5qTgnB2dQpXCcpZUuXAbUO8eKQ7JvbMPqERXUscqpguM6FPSYZs5xiWePKe6h8VR7UF"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Michael Chen</p>
                      <p className="text-xs text-slate-500 font-medium">
                        ID: #FP-3301
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">07:20 AM</td>
                <td className="px-6 py-4 text-sm font-medium">--:--</td>
                <td className="px-6 py-4 text-sm text-slate-400">3h 22m</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/30">
                    Overstayed
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>👁️</span>
                    </button>
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>✏️</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-300 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        alt="Portrait of a female gym member smiling"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU41VMV4FDRCrsMml3QGecuMbXf9xiodXa9DK7wouJ1Fc3OgEq1GkXc7JstRrCQRmIjiiNoc4CgeDu1oReyU3gPU8o6LZjysxw0czXfiun9a6rnOfZC7Rr-ZVWdaQxfyXodPtXX6MGTCXz0LBRs8ZG3CcCjqI2z2aETlZaRM6DAb6ukYWP2GtrmrWXUHcn9M2EboymUi5AcWXnvEKF47szPiM5aQeXLODRH83JGmMs0iOECyq8ZqdbdGggOhpnIFcQVaCoa1wxCv2Z"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Emma Wilson</p>
                      <p className="text-xs text-slate-500 font-medium">
                        ID: #FP-1144
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">10:45 AM</td>
                <td className="px-6 py-4 text-sm font-medium">12:00 PM</td>
                <td className="px-6 py-4 text-sm text-slate-400">1h 15m</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Left
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>👁️</span>
                    </button>
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                      <span>✏️</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing 1-10 of 142 logs
          </p>
          <div className="flex gap-2">
            <button className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="text-sm">‹</span>
            </button>
            <button className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-primary/10 border-primary/20 text-primary">
              <span className="text-xs font-bold">1</span>
            </button>
            <button className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="text-xs font-bold">2</span>
            </button>
            <button className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="text-sm">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

