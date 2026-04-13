"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/common/StatCard";
import { RevenueChart } from "@/components/common/RevenueChart";
import { AttendanceChart } from "@/components/common/AttendanceChart";
import { RecentCheckinsTable } from "@/components/common/RecentCheckinsTable";
import { TrialBanner } from "@/components/common/TrialBanner";
import { TrialCounter } from "@/components/common/TrialCounter";
import {
  getDashboardStats,
  getMonthlyRevenue,
  getWeeklyAttendance,
  getRecentCheckIns,
} from "@/lib/dashboard-service";
import {
  getGymInfo,
  calculateTrialStatus,
  type TrialStatus,
} from "@/lib/gym-service";

export default function Dashboard() {
  const { user } = useAuth();
  const gymId = user?.user_metadata?.gym_id;
  const subscriptionRef = useRef<any>(null);

  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    todayAttendance: 0,
    pendingCount: 0,
  });
  const [revenueData, setRevenueData] = useState<
    { week: string; amount: number }[]
  >([]);
  const [attendanceData, setAttendanceData] = useState<
    { day: string; count: number }[]
  >([]);
  const [checkinsData, setCheckinsData] = useState<any[]>([]);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gymId) {
      loadDashboardData();
      loadTrialStatus();
      setupRealtimeSubscription();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [gymId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, revenueRes, attendanceRes, checkinsRes] =
        await Promise.all([
          getDashboardStats(gymId),
          getMonthlyRevenue(gymId),
          getWeeklyAttendance(gymId),
          getRecentCheckIns(gymId),
        ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (revenueRes.success) setRevenueData(revenueRes.data);
      if (attendanceRes.success) setAttendanceData(attendanceRes.data);
      if (checkinsRes.success) setCheckinsData(checkinsRes.checkins);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadTrialStatus = async () => {
    if (!gymId) return;

    try {
      const gymRes = await getGymInfo(gymId);
      if (gymRes.success) {
        const trial = calculateTrialStatus(gymRes.gym.created_at);
        setTrialStatus(trial);
      }
    } catch (error) {
      console.error("Error loading trial status:", error);
    }
  };

  const handleUpgradeClick = () => {
    // This can be extended later to open a pricing/upgrade modal
    toast.success(
      "Upgrade feature coming soon! Contact support for more info.",
    );
  };

  const handleTrialBannerClose = () => {
    setShowBanner(false);
  };

  const setupRealtimeSubscription = () => {
    if (!gymId) return;

    const channel = supabase
      .channel(`check_ins_${gymId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
          filter: `gym_id=eq.${gymId}`,
        },
        async (payload) => {
          console.log("[REALTIME] Check-in update:", payload);
          // Refresh recent check-ins when any change happens
          const result = await getRecentCheckIns(gymId);
          if (result.success) {
            setCheckinsData(result.checkins);
          }
          // Also refresh stats to update today's attendance
          const statsResult = await getDashboardStats(gymId);
          if (statsResult.success) {
            setStats(statsResult.stats);
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    subscriptionRef.current = channel;
  };

  // Transform check-in data for table display
  const transformedCheckins = checkinsData.slice(0, 5).map((checkin: any) => {
    const name = checkin.member?.name || "Unknown";
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();

    const checkInTime = new Date(checkin.check_in_time).toLocaleTimeString(
      "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: true },
    );

    let status: "Just In" | "In Training" | "Checked Out" | "Late Entry" =
      "In Training";
    let statusColor: "green" | "blue" | "slate" | "amber" = "blue";

    if (!checkin.check_out_time) {
      status = "Just In";
      statusColor = "green";
    } else {
      status = "Checked Out";
      statusColor = "slate";
    }

    return {
      id: checkin.id,
      name,
      memberId: `#${checkin.id.slice(0, 8).toUpperCase()}`,
      initials,
      plan: "Standard",
      checkInTime,
      status,
      statusColor,
    };
  });

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-800 tracking-tight">System Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back. Here's what's happening today at IronCore.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trialStatus && (
            <TrialCounter
              trialStatus={trialStatus}
              onClick={() => setShowBanner(!showBanner)}
            />
          )}
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Trial Banner */}
      {trialStatus && showBanner && (
        <TrialBanner
          trialStatus={trialStatus}
          onUpgradeClick={handleUpgradeClick}
          onClose={handleTrialBannerClose}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="👥"
          title="Total Members"
          value={stats.totalMembers.toString()}
          trend={{ percentage: 2.4, isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          icon="✓"
          title="Active Members"
          value={stats.activeMembers.toString()}
          trend={{ percentage: 0.8, isPositive: false }}
          accentColor="primary"
        />
        <StatCard
          icon="📝"
          title="Today's Attendance"
          value={stats.todayAttendance.toString()}
          trend={{ percentage: 12, isPositive: true }}
          accentColor="indigo"
        />
        <StatCard
          icon="⏳"
          title="Pending Payments"
          value={stats.pendingCount.toString()}
          trend={{ percentage: 5, isPositive: false }}
          accentColor="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart data={revenueData} isLoading={loading} />
        <AttendanceChart data={attendanceData} isLoading={loading} />
      </div>

      {/* Recent Activity Table */}
      <RecentCheckinsTable data={transformedCheckins} />
    </div>
  );
}
