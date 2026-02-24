"use client";

interface CheckinRecord {
  id: string;
  name: string;
  memberId: string;
  initials: string;
  plan: string;
  checkInTime: string;
  status: "Just In" | "In Training" | "Checked Out" | "Late Entry";
  statusColor: "green" | "blue" | "slate" | "amber";
}

interface RecentCheckinsTableProps {
  title?: string;
  data?: CheckinRecord[];
}

const defaultData: CheckinRecord[] = [
  {
    id: "1",
    name: "James Dorian",
    memberId: "#M-8821",
    initials: "JD",
    plan: "Pro Monthly",
    checkInTime: "10:42 AM",
    status: "Just In",
    statusColor: "green",
  },
  {
    id: "2",
    name: "Sarah Kong",
    memberId: "#M-1204",
    initials: "SK",
    plan: "Premium Annual",
    checkInTime: "09:15 AM",
    status: "In Training",
    statusColor: "blue",
  },
  {
    id: "3",
    name: "Marcus Wright",
    memberId: "#M-4452",
    initials: "MW",
    plan: "Standard",
    checkInTime: "08:30 AM",
    status: "Checked Out",
    statusColor: "slate",
  },
  {
    id: "4",
    name: "Leo Brooks",
    memberId: "#G-0021",
    initials: "LB",
    plan: "Day Pass (Guest)",
    checkInTime: "07:55 AM",
    status: "Late Entry",
    statusColor: "amber",
  },
];

const statusColorMap = {
  green: "bg-green-500/10 text-green-500",
  blue: "bg-blue-500/10 text-blue-500",
  slate: "bg-slate-500/10 text-slate-500",
  amber: "bg-amber-500/10 text-amber-500",
};

const initialsColorMap = {
  JD: "bg-blue-100 dark:bg-blue-500/20 text-blue-600",
  SK: "bg-purple-100 dark:bg-purple-500/20 text-purple-600",
  MW: "bg-amber-100 dark:bg-amber-500/20 text-amber-600",
  LB: "bg-red-100 dark:bg-red-500/20 text-red-600",
};

export const RecentCheckinsTable = ({
  title = "Recent Check-ins",
  data = defaultData,
}: RecentCheckinsTableProps) => {
  return (
    <div className="bg-white dark:bg-[#1a1d23] rounded-2xl border border-slate-200 dark:border-[#2d333d] shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-[#2d333d] flex items-center justify-between">
        <h3 className="font-bold text-lg">{title}</h3>
        <button className="text-sm font-bold text-primary hover:underline">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-[#0a0a0a]/30">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Check-in Time
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
            {data.map((record, index) => (
              <tr
                key={record.id}
                className={`hover:bg-slate-50 dark:hover:bg-background-dark/20 transition-all ${
                  index === data.length - 1 ? "border-none" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-9 rounded-lg ${
                        initialsColorMap[
                          record.initials as keyof typeof initialsColorMap
                        ] || "bg-blue-100 dark:bg-blue-500/20 text-blue-600"
                      } font-bold flex items-center justify-center text-xs`}
                    >
                      {record.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{record.name}</p>
                      <p className="text-[11px] text-slate-500">
                        ID: {record.memberId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium">{record.plan}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium">
                    {record.checkInTime}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-800 ${
                      statusColorMap[record.statusColor]
                    } uppercase tracking-tighter`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    ⋮
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
