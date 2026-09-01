import { Member, MembersStats } from "@/types/member";

export const mockMembers: Member[] = [
  {
    id: "1",
    name: "Marcus Thompson",
    email: "marcus@example.com",
    memberId: "#IC-4820",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjMenwYUlLyU_y9Uo8VlZsklH_KnIr7gRhvNALP5bgkPnGoibZf8gUIHWwo-5Vgn2xMZnsCfhjTp4J78wYKuO-we_P0YhoCiPjvzTjUhVDpcRSJrMELcpzpN07SYTQySFtaR0MbJoKe4UWOCyaQjFGcQp6x0LCNx1Z5Q0WNUYqJ3DWUngCEFHcct7egLhxY3E3cYaH-nGNZMl3M-HefOSlhbmYQN-YNFvzVhYysQza1stej68FHwpfD6AbwJiyW3S7vZmrDkTPbSB_",
    membershipPlan: "Elite Yearly",
    membershipCost: "$1,200 / year",
    status: "active",
    expiryDate: "Oct 12, 2024",
  },
  {
    id: "2",
    name: "Elena Rodriguez",
    email: "elena@example.com",
    memberId: "#IC-4821",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0XFOpJ0rx8xu2zES1G5O0dTP0sclBst6CwqxxmiMinHr7-qDb8fk6FDnC98ISAXteKK107uOsUfwtF_WU5aQxJMfoRysL--FZFCnf0rfw6_RpNQpksz8IxKLdfee1aCIAP1Uz2KgS_QAdERRrpS5Y31wG8mAsOhIR1NaHlilcSVIVm5jmoyqbHi1NRpkI8mkDqO_vfth2SgCvyT4mEr5kzWO-bQ93qw_Bz4P1uCVHdp6XLt8bpXyghfUNq7NIycR-GwTW7fy9Jr6m",
    membershipPlan: "Pro Monthly",
    membershipCost: "$99 / month",
    status: "expiring-soon",
    expiryDate: "Aug 24, 2024",
  },
  {
    id: "3",
    name: "Jordan Smith",
    email: "jordan@example.com",
    memberId: "#IC-4825",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZFFG76YpAn-5YXCKytbAXn7ULhUsZNqS2Sz3pg5nMfiT1IyRv_cPdBGbeG2Ymul5FU99Q9HodyOKY_mDmpmMAIK52O8tWDYJ_Yy7JQy06wZOp3E2q5A_SZrMpyhMJSG2e6yTeMgDjLfVrDdU-HzjznwuMa798ZHNSrk5c6MVm8nK2bEksEQxpozRVlyfNdzigaMAdT5dyBVjtjc4M7ZmrlfFUyFwK3gWTU-smIlFzKAi-39wpjN5kg1k7aE-EhdzUhmXQP4TPH8B7",
    membershipPlan: "Basic Starter",
    membershipCost: "$49 / month",
    status: "inactive",
    expiryDate: "Jul 01, 2024",
  },
  {
    id: "4",
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    memberId: "#IC-4829",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYbJ8y5lkbrMW_cdA0Fo7qOiFBV545uRX2XNnRDiuN9dsQ42itmsrYBydQZ_A_A6zmz8Zl4Uhe_heTkdh86GdHYrVgDGrslRKyXAPewsR5rzpX_mx08b51QpsQ4pm1rCLtybq6UT-2meQBXUiB_qBNQMy7zxlG_TyM2VxqIn2Ep1sYMy4_2Lfv6uHPCb2DzGAcKiXi1K6_MGx_LC1JhLo6fKNPqzLG62k2lbq7Wy9RazVBuFD8XQPegrFCW-w-KhEoFw8HpSKG7Fez",
    membershipPlan: "Elite Yearly",
    membershipCost: "$1,200 / year",
    status: "active",
    expiryDate: "Dec 15, 2024",
  },
];

export const mockMembersStats: MembersStats = {
  totalMembers: 2842,
  activeNow: 156,
  pendingRequests: 24,
  expiringSoon: 42,
};
