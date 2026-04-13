"use client";

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* General Settings */}
      <section id="general" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              General Settings
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage core gym identity and operational hours.
            </p>
          </div>
        </div>
        <div className="bg-slate-900/70 dark:bg-slate-900/70 rounded-xl p-8 shadow-lg space-y-8 border border-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Gym Name
              </label>
              <input
                type="text"
                defaultValue="IronCore Performance Center"
                className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue="ops@ironcoregym.com"
                className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Address
              </label>
              <input
                type="text"
                defaultValue="742 Powerhouse Ave, Suite 100, Austin, TX"
                className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="text"
                defaultValue="+1 (512) 555-0199"
                className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4 block">
              Business Hours
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 rounded-lg p-4 flex flex-col gap-2">
                <span className="text-xs font-bold">Mon - Fri</span>
                <span className="text-sm text-primary">
                  05:00 AM - 11:00 PM
                </span>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 flex flex-col gap-2">
                <span className="text-xs font-bold">Saturday</span>
                <span className="text-sm text-primary">
                  07:00 AM - 09:00 PM
                </span>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 flex flex-col gap-2">
                <span className="text-xs font-bold">Sunday</span>
                <span className="text-sm text-primary">
                  08:00 AM - 06:00 PM
                </span>
              </div>
              <button className="border-2 border-dashed border-slate-700 rounded-lg p-4 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all text-sm font-semibold">
                + Add Slot
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Configuration */}
      <section id="membership" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Membership Configuration
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Policies for billing and member lifecycle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 rounded-xl p-6 shadow-lg border-l-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span>♻️</span>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
              >
                <span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white transition-transform" />
              </button>
            </div>
            <h3 className="font-bold text-lg mb-1">Auto-Renewal</h3>
            <p className="text-xs text-slate-400">
              Automatically bill members for the next cycle upon expiration.
            </p>
          </div>

          <div className="bg-slate-900/70 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-100">
                <span>🎫</span>
              </div>
              <input
                type="number"
                defaultValue={5}
                className="w-16 bg-slate-800 border-none rounded-lg p-2 text-center text-sm font-bold text-primary focus:ring-0"
              />
            </div>
            <h3 className="font-bold text-lg mb-1">Guest Pass Limit</h3>
            <p className="text-xs text-slate-400">
              Maximum number of guest passes issued to premium members per
              month.
            </p>
          </div>

          <div className="bg-slate-900/70 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-100">
                <span>❄️</span>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700"
              >
                <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white transition-transform" />
              </button>
            </div>
            <h3 className="font-bold text-lg mb-1">Freeze Policy</h3>
            <p className="text-xs text-slate-400">
              Allow members to temporarily pause their subscription for medical
              reasons.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Management */}
      <section id="staff" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Staff Management
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage roles and permissions for your team.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <span>➕</span>
            Add Staff Member
          </button>
        </div>

        <div className="bg-slate-900/70 rounded-xl shadow-lg overflow-hidden border border-slate-800/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800/60">
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/80 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9gkhfHG_oDX_nTJ5cEFYypys66kWEb5YH9jYv0YY9nMy-cO-TRmfJvFo5_azzKf_TYmsatdKTQZdqpGudzCBMqsbsueCtp4HTBGiDLBYKR94Vjkm1lT3DutqUv3wwGliiGqog78YuJx9JTV3V9k-zdLSDvrbWTpYtolJNUW1zxCft-19HVpINWeZoXgrrwWDMH6H5buE0EX6sIKS5qgz1GnEnWKVE6wS3taCN1U6Erphd6DQUmnrRpf9v6XzZHux4RJgiKTkqj6yC"
                      alt="James Dagger"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-bold text-slate-100">
                      James Dagger
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-full font-semibold border border-orange-500/20">
                    Trainer
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Active
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-400 hover:text-white">
                    ⋮
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/80 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8Plw3AIqMLjBqXgJt9Fy6zG4MpFqFCum0RfqT224Vup94wRykIVreNMvvmyoOBi2DnvmlpAm3gEXvhTjGq0mTaeTM29CrJVI-EzGqrii_gIsYuBd5uPZfBoYgvoNmN0xhATIeCMaQvUk0boDmcDUnTl1pQPUPe1tjdJE6n0KBVi7jTbngFJgP8oqhKtwfFvK1CLqJGePLZbpCLGa0PWhkA8JO-ecQFjPYObxiUC3LjaD6-qhvfrPEGyO8QSUlnXHRLY6-rIuky1zO"
                      alt="Sarah Hughes"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-bold text-slate-100">
                      Sarah Hughes
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-100 rounded-full font-semibold">
                    Receptionist
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Active
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-400 hover:text-white">
                    ⋮
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/80 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu-3hvuS8WMhPPcLT7cgbplx_Ul5LuacTMBjX_ZIzEJ0DRYNRK3lSnsO3ibH_6DOlFi-NnObGXMszr7I_qAc0mAdGho_iJTCtdvmCEkfFAvzDXFZK7FXmkpP2YgAXWsfx3wn4Wh9l11H0RHn1vdlc_VBPtQkUBHgGGYYtH7CWZGmEBtWEvmXwYvZHKK30Ya9lXP83zOYQAxnTqUQ5ygiIRVEqakThncLdR9JVa3zO7pfhQH8Sn3KFAGX9clw58URhshD_O3vfxpALD"
                      alt="Robert K."
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-bold text-slate-100">Robert K.</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-semibold border border-primary/20">
                    Admin
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                    Offline
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-400 hover:text-white">
                    ⋮
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="scroll-mt-24 space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Security &amp; Access
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Protect your administrative console.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/70 rounded-xl p-8 shadow-lg border border-slate-800/60">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="text-primary">🔒</span>
              Change Password
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 12 characters"
                  className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
                Update Password
              </button>
            </div>
          </div>

          <div className="bg-slate-900/70 rounded-xl p-8 shadow-lg border border-slate-800/60 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-primary">🛡️</span>
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Add an extra layer of security to your account by requiring a
                verification code in addition to your password.
              </p>
              <div className="mt-8 flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div className="p-3 bg-primary/20 rounded-full text-primary">
                  <span>📱</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">SMS Authentication</p>
                  <p className="text-xs text-slate-400">
                    Recommended for mobile access
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                >
                  <span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
            <div className="mt-8 text-xs text-slate-500">
              Last security audit:{" "}
              <span className="text-slate-300">2 days ago</span>
            </div>
          </div>
        </div>

        {/* Save changes bar (local to page content) */}
        <div className="mt-10 bg-slate-900/90 border border-primary/10 px-6 py-4 rounded-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-2xl">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="text-primary animate-pulse">🔄</span>
            <span>
              Unsaved changes detected in{" "}
              <strong>Membership Configuration</strong>
            </span>
          </div>
          <div className="flex gap-4 justify-end">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors">
              Discard
            </button>
            <button className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-xl shadow-primary/25 hover:scale-[1.03] active:scale-95 transition-all">
              Save All Changes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

