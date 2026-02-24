export interface Member {
  id: string;
  name: string;
  email: string;
  memberId: string;
  avatar: string;
  membershipPlan: string;
  membershipCost: string;
  status: 'active' | 'inactive' | 'expiring-soon' | 'pending';
  expiryDate: string;
}

export interface MembersStats {
  totalMembers: number;
  activeNow: number;
  pendingRequests: number;
  expiringSoon: number;
}
