"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  getTodayCheckIns,
  getCheckInStats,
  recordCheckOut,
} from "@/lib/checkin-service";
import { QuickCheckinModal } from "@/components/attendance/QuickCheckinModal";
import type { CheckInWithMember } from "@/lib/checkin-service";

export default function AttendancePage() {
  const { user } = useAuth();
  const gymId = user?.user_metadata?.gym_id;
  const subscriptionRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInWithMember[]>([]);
  const [stats, setStats] = useState({
    total_checkins: 0,
    unique_members: 0,
    avg_duration: 0,
  });
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">(
    "today",
  );
  const [selectedMember, setSelectedMember] =
    useState<CheckInWithMember | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (gymId) {
      fetchCheckIns();
      fetchStats();
      setupRealtimeSubscription();
    }

    // Update current time every second for duration calculations
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      clearInterval(timer);
    };
  }, [gymId, timeframe]);

  const fetchCheckIns = async () => {
    if (!gymId) return;

    setLoading(true);
    try {
      const result = await getTodayCheckIns(gymId);
      if (result.success) {
        setCheckIns(result.checkins);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      toast.error("Failed to load check-ins");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!gymId) return;

    try {
      const days = timeframe === "today" ? 1 : timeframe === "week" ? 7 : 30;
      const result = await getCheckInStats(gymId, days);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCheckoutMember = async (checkinId: string) => {
    try {
      await recordCheckOut(checkinId);
      toast.success("Member checked out successfully! ✅");
      await fetchCheckIns();
    } catch (error) {
      console.error("Error checking out member:", error);
      toast.error("Failed to check out member");
    }
  };

  const setupRealtimeSubscription = () => {
    if (!gymId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const channel = supabase
      .channel(`check_ins_today_${gymId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
          filter: `gym_id=eq.${gymId}`,
        },
        async (payload: any) => {
          console.log("[REALTIME] Check-in update:", payload);
          // Only refresh if the change is for today
          const eventCheckInTime =
            payload.new?.check_in_time || payload.old?.check_in_time;
          if (eventCheckInTime) {
            const eventDate = new Date(eventCheckInTime);
            const eventDateOnly = new Date(
              eventDate.getFullYear(),
              eventDate.getMonth(),
              eventDate.getDate(),
            );
            const todayDateOnly = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            );

            if (eventDateOnly.getTime() === todayDateOnly.getTime()) {
              // Refresh check-ins and stats
              const result = await getTodayCheckIns(gymId);
              if (result.success) {
                setCheckIns(result.checkins);
              }
              const statsResult = await getCheckInStats(gymId, 1);
              if (statsResult.success) {
                setStats(statsResult.stats);
              }
            }
          }
        },
      )
      .subscribe((status) => {
        console.log("Attendance realtime subscription status:", status);
      });

    subscriptionRef.current = channel;
  };

  const currentlyInGym = checkIns.filter((c) => !c.check_out_time).length;
  const leftGym = checkIns.filter((c) => c.check_out_time).length;

  const formatTime = (dateString: string) => {
    try {
      if (!dateString) return "--:--";

      // 1. Check if the string already has a timezone indicator (Z or +/-)
      // If not, append 'Z' to force it to be treated as UTC from Supabase
      const utcDateString =
        dateString.includes("Z") || dateString.includes("+")
          ? dateString
          : `${dateString.replace(" ", "T")}Z`;

      const date = new Date(utcDateString);

      // 2. Format using the user's local timezone
      // In Pakistan, this will automatically add +5 hours to the UTC time
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch (error) {
      console.error("Error formatting time:", error);
      return "--:--";
    }
  };

  const formatDuration = (
    minutes: number | undefined,
    checkInTime?: string,
    checkOutTime?: string,
    now?: Date,
  ) => {
    // 1. If checked out, use the pre-calculated duration from the database
    if (minutes && minutes > 0) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    // 2. If still active, calculate the duration correctly
    if (checkInTime && !checkOutTime) {
      // Fix: Force the check-in string to be treated as UTC
      const utcCheckInString =
        checkInTime.includes("Z") || checkInTime.includes("+")
          ? checkInTime
          : `${checkInTime.replace(" ", "T")}Z`;

      const checkIn = new Date(utcCheckInString);
      const referenceTime = now || new Date();

      const elapsedMinutes = Math.floor(
        (referenceTime.getTime() - checkIn.getTime()) / (1000 * 60),
      );

      if (elapsedMinutes <= 0) return "< 1 min";

      const hours = Math.floor(elapsedMinutes / 60);
      const mins = elapsedMinutes % 60;

      if (hours > 0) {
        return `${hours}h ${mins}m (Active)`;
      }
      return `${mins}m (Active)`;
    }

    return "--";
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Attendance Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time check-in monitoring and traffic analytics for{" "}
            <span className="text-primary font-semibold">Today</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setTimeframe("today")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                timeframe === "today"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe("week")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                timeframe === "week"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                timeframe === "month"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Month
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0d6cf2] hover:bg-[#0d6cf2]/90 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#0d6cf2]/20"
          >
            <span>✓</span>
            Quick Check-in
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl flex items-center justify-between border-l-4 border-l-primary bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/5 px-6 py-6">
          <div>
            <p className="text-slate-400 text-sm font-medium">
              Total{" "}
              {timeframe === "today"
                ? "Today"
                : timeframe === "week"
                  ? "This Week"
                  : "This Month"}
            </p>
            <h3 className="text-3xl font-black mt-1">{stats.total_checkins}</h3>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-2">
              <span>📈</span>
              <span>Check-ins recorded</span>
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
            <h3 className="text-3xl font-black mt-1">{currentlyInGym}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-bold mt-2">
              <span>ℹ️</span>
              <span>Active members</span>
            </div>
          </div>
          <div className="size-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
            <span className="text-2xl">📍</span>
          </div>
        </div>

        <div className="rounded-xl flex items-center justify-between border-l-4 border-l-orange-500 bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/5 px-6 py-6">
          <div>
            <p className="text-slate-400 text-sm font-medium">Unique Members</p>
            <h3 className="text-3xl font-black mt-1">{stats.unique_members}</h3>
            <div className="flex items-center gap-1 text-orange-500 text-xs font-bold mt-2">
              <span>⚠️</span>
              <span>Avg. {stats.avg_duration}m per session</span>
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
          <h4 className="font-bold">
            {timeframe === "today"
              ? "Today's Check-ins"
              : timeframe === "week"
                ? "This Week's Check-ins"
                : "This Month's Check-ins"}
          </h4>
          <button
            onClick={fetchCheckIns}
            className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Loading check-ins...
          </div>
        ) : checkIns.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            No check-ins recorded yet
          </div>
        ) : (
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
                {checkIns.map((checkin, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold">
                          {checkin.member?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            {checkin.member?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {checkin.member?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatTime(checkin.check_in_time)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {checkin.check_out_time
                        ? formatTime(checkin.check_out_time)
                        : "--:--"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatDuration(
                        checkin.duration_minutes,
                        checkin.check_in_time,
                        checkin.check_out_time,
                        currentTime,
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {checkin.check_out_time ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Left
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary ring-1 ring-primary/30">
                          In-Gym
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-between gap-2">
                        {!checkin.check_out_time && (
                          <button
                            onClick={() => handleCheckoutMember(checkin.id)}
                            className="bg-[#0d6cf2] hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                            title="Check out"
                          >
                            <span>Check-out</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMember(checkin)}
                          className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors"
                          title="View details"
                        >
                          <span>👁️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && checkIns.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Showing {checkIns.length} check-in
              {checkIns.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Quick Check-in Modal */}
      <QuickCheckinModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchCheckIns();
          fetchStats();
        }}
        onCheckInSuccess={() => {
          fetchCheckIns();
          fetchStats();
        }}
      />

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold">Member Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Member Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="size-16 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {selectedMember.member?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {selectedMember.member?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedMember.member?.email || "N/A"}
                  </p>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Phone: {selectedMember.member?.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Check-in Details */}
              <div className="space-y-3">
                <p className="font-bold text-sm uppercase tracking-wider text-slate-500">
                  Today's Session
                </p>

                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Check-in Time:
                    </span>
                    <span className="font-bold">
                      {formatTime(selectedMember.check_in_time)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Check-out Time:
                    </span>
                    <span className="font-bold">
                      {selectedMember.check_out_time
                        ? formatTime(selectedMember.check_out_time)
                        : "Still in gym"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Duration:
                    </span>
                    <span className="font-bold text-primary">
                      {formatDuration(
                        selectedMember.duration_minutes,
                        selectedMember.check_in_time,
                        selectedMember.check_out_time,
                        currentTime,
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  {selectedMember.check_out_time ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Session Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary ring-1 ring-primary/30">
                      Currently in Gym
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
