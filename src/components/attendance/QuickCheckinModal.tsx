"use client";

interface QuickCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCheckinModal = ({ isOpen, onClose }: QuickCheckinModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-primary text-3xl">⚡</span>
              Quick Check-in
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              IronCore Gym Management System
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close quick check-in"
          >
            ×
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 pb-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 group-focus-within:text-primary transition-colors">
                🔍
              </span>
            </div>
            <input
              className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
              placeholder="Search members by name, ID, or phone number..."
              type="text"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 py-4 flex flex-col gap-6 max-h-[500px] overflow-y-auto">
          {/* Success Feedback (static example for now) */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-emerald-500 rounded-full p-1 flex items-center justify-center">
              <span className="text-white text-sm">✔</span>
            </div>
            <p className="text-emerald-400 text-sm font-semibold">
              Success! Marcus Vane checked in at 10:45 AM
            </p>
          </div>

          {/* Suggested Members List */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Suggested Members
            </h3>
            <div className="space-y-3">
              {/* Member Item 1 */}
              <div className="flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-primary transition-colors">
                      <img
                        className="h-full w-full object-cover"
                        alt="Profile photo of a male gym member"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0BlY8RwsVyo7zrAeDQ-OuJ9ZFK9OEKq071eQsrUy1rO3XPuBl4fkC3syl4YqaJgY77bhX9SfI2HyZ17E6-oQUjZuIcvw4fBDlENfKB9CN2zwncIYgEU2d1_4Gpopo83k9b-0lVg5pxSiMGAlKk4rla77BR7CUMe2Wf0I0eU00Qb0s1IsRZ9wuylheKqiePcacxOqJx_w0ssb7761g1dYCWr7qgwTxezuJVLqS9aCsEPNMoUeRk1g8DVbGGBfkWQL802fC2PQ1CF_7"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">
                      Alex Rivers
                    </p>
                    <p className="text-slate-400 text-xs font-medium">
                      ID #8821 • <span className="text-emerald-500">Active Pro</span>
                    </p>
                  </div>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/20">
                  Check In
                </button>
              </div>

              {/* Member Item 2 */}
              <div className="flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-primary transition-colors">
                      <img
                        className="h-full w-full object-cover"
                        alt="Profile photo of a female gym member"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9wIqvTOdzMEliM92yyuUaw88mYl_6T21_FQnlzEzWTbF0wQwKyq0EQF_pRoLfefjWu3bQsvaUhtDmnP0QI2x-m6ls3l7PrL3WCzktuVym9tbZ1wpMmFAFMZFuJdsRS1Gq3Y8yeEDMcV1ArKTaztktqKcybvapPTq-mIbFQgoz0v5WcQ1qgC8LugNgiM4Can7N8BmrbO0JCFMBAFxNce61zQcISpV9XqMy1uPIe83HrKqNyfm88ewedX2LdEg7EzS6BQg0s9HdvTvg"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-amber-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">
                      Sarah Jenkins
                    </p>
                    <p className="text-slate-400 text-xs font-medium">
                      ID #7742 • <span className="text-amber-500">Expiring Soon</span>
                    </p>
                  </div>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/20">
                  Check In
                </button>
              </div>

              {/* Member Item 3 */}
              <div className="flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-primary transition-colors">
                      <img
                        className="h-full w-full object-cover"
                        alt="Profile photo of a male athlete"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP5I9vYX9E2iZ2lmlQPUzCrFaInaLAFjVl0w8lhtyqw5S6-f2qXRK8DBD3VoJ5qwzPSIFkZ9uIueGkmIWcbTlGDZHkXjmnMIJp6fu8XJ6G0_wJeV8JMWb4wpwynTRbAmeLKml8xzxmsqffFVTz_6W9uEQuF6BbYvlvjTeBe_-0YF2hxIQBWo8EXG1Qr4teQEQ_awSn2oIjV0MRrxlQF3udI3Z_3ygfLBWeUkb6S8112VWufFOCO4YphSuFVnx-oi3CgVwvyBO8psZY"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-slate-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">
                      David Miller
                    </p>
                    <p className="text-slate-400 text-xs font-medium">
                      ID #9011 • <span className="text-slate-500">Inactive</span>
                    </p>
                  </div>
                </div>
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                  Reactivate
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold hover:bg-primary/20 transition-all">
                🎫 Guest Pass
              </button>
              <button className="flex items-center justify-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold hover:bg-slate-700 transition-all">
                ✏️ Manual Entry
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-emerald-500 rounded-full" />
              42 Active now
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-primary rounded-full" />
              156 Today
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

