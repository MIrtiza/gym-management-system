import { supabase } from "./supabase";

export interface ReportRow {
  date: string;
  revenue: number;
  newMembers: number;
  checkins: number;
  attendanceRate: number;
}

export interface ReportSummary {
  totalRevenue: number;
  newMembers: number;
  activeMemberships: number;
  totalCheckins: number;
  averageAttendanceRate: number;
}

export interface ReportData {
  rows: ReportRow[];
  summary: ReportSummary;
}

interface PaymentRecord {
  amount: number;
  created_at: string;
}

interface MemberRecord {
  id: string;
  status: string | null;
  created_at: string;
}

interface CheckInRecord {
  member_id: string;
  check_in_time: string;
}

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const buildEmptyRows = (startDate: Date, endDate: Date): ReportRow[] => {
  const rows: ReportRow[] = [];

  for (
    let date = new Date(startDate.getTime());
    date <= endDate;
    date = addDays(date, 1)
  ) {
    rows.push({
      date: toISODate(date),
      revenue: 0,
      newMembers: 0,
      checkins: 0,
      attendanceRate: 0,
    });
  }

  return rows;
};

export async function getReportData(
  gymId: string,
  start: string,
  end: string,
): Promise<{ success: boolean; data: ReportData; error?: string }> {
  try {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate > endDate
    ) {
      return {
        success: false,
        data: {
          rows: [],
          summary: {
            totalRevenue: 0,
            newMembers: 0,
            activeMemberships: 0,
            totalCheckins: 0,
            averageAttendanceRate: 0,
          },
        },
        error: "Invalid report date range",
      };
    }

    const rangeEnd = addDays(endDate, 1);
    const rows = buildEmptyRows(startDate, endDate);
    const rowsByDate = new Map(rows.map((row) => [row.date, row]));

    const [paymentsRes, membersRes, checkinsRes, activeMembersRes] =
      await Promise.all([
        supabase
          .from("payments")
          .select("amount, created_at")
          .eq("gym_id", gymId)
          .eq("status", "completed")
          .gte("created_at", startDate.toISOString())
          .lt("created_at", rangeEnd.toISOString()),
        supabase
          .from("members")
          .select("id, status, created_at")
          .eq("gym_id", gymId)
          .gte("created_at", startDate.toISOString())
          .lt("created_at", rangeEnd.toISOString()),
        supabase
          .from("check_ins")
          .select("member_id, check_in_time")
          .eq("gym_id", gymId)
          .gte("check_in_time", startDate.toISOString())
          .lt("check_in_time", rangeEnd.toISOString()),
        supabase
          .from("members")
          .select("id, status")
          .eq("gym_id", gymId),
      ]);

    if (paymentsRes.error) throw paymentsRes.error;
    if (membersRes.error) throw membersRes.error;
    if (checkinsRes.error) throw checkinsRes.error;
    if (activeMembersRes.error) throw activeMembersRes.error;

    const payments = (paymentsRes.data ?? []) as PaymentRecord[];
    const newMembers = (membersRes.data ?? []) as MemberRecord[];
    const checkins = (checkinsRes.data ?? []) as CheckInRecord[];
    const allMembers = (activeMembersRes.data ?? []) as Pick<
      MemberRecord,
      "id" | "status"
    >[];

    payments.forEach((payment) => {
      const row = rowsByDate.get(toISODate(new Date(payment.created_at)));
      if (row) {
        row.revenue += Number(payment.amount) || 0;
      }
    });

    newMembers.forEach((member) => {
      const row = rowsByDate.get(toISODate(new Date(member.created_at)));
      if (row) {
        row.newMembers += 1;
      }
    });

    checkins.forEach((checkin) => {
      const row = rowsByDate.get(toISODate(new Date(checkin.check_in_time)));
      if (row) {
        row.checkins += 1;
      }
    });

    const activeMemberships = allMembers.filter(
      (member) => member.status === "active",
    ).length;

    rows.forEach((row) => {
      row.revenue = Number(row.revenue.toFixed(2));
      row.attendanceRate =
        activeMemberships > 0
          ? Number(Math.min(100, (row.checkins / activeMemberships) * 100).toFixed(1))
          : 0;
    });

    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const totalNewMembers = rows.reduce((sum, row) => sum + row.newMembers, 0);
    const totalCheckins = rows.reduce((sum, row) => sum + row.checkins, 0);
    const daysWithActivity = rows.filter((row) => row.checkins > 0).length;
    const averageAttendanceRate =
      daysWithActivity > 0
        ? rows.reduce((sum, row) => sum + row.attendanceRate, 0) /
          daysWithActivity
        : 0;

    return {
      success: true,
      data: {
        rows,
        summary: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          newMembers: totalNewMembers,
          activeMemberships,
          totalCheckins,
          averageAttendanceRate: Number(averageAttendanceRate.toFixed(1)),
        },
      },
    };
  } catch (error) {
    console.error("Get report data error:", error);
    return {
      success: false,
      data: {
        rows: [],
        summary: {
          totalRevenue: 0,
          newMembers: 0,
          activeMemberships: 0,
          totalCheckins: 0,
          averageAttendanceRate: 0,
        },
      },
      error: error instanceof Error ? error.message : "Failed to load report",
    };
  }
}
