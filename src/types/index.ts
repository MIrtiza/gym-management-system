// Member Types
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profileImage?: string;
  isActive: boolean;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

// Membership Types
export type MembershipPlan = 'basic' | 'standard' | 'premium' | 'vip';

export interface Membership {
  id: string;
  memberId: string;
  plan: MembershipPlan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlanDetail {
  id: string;
  name: MembershipPlan;
  price: number;
  durationInDays: number;
  description: string;
  features: string[];
}

// Attendance Types
export interface Attendance {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'overdue' | 'failed';

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  description: string;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export type ServiceType = 'personal_training' | 'diet_plan' | 'nutrition_coaching' | 'other';

export interface Service {
  id: string;
  memberId: string;
  serviceType: ServiceType;
  startDate: string;
  endDate?: string;
  trainer?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  pendingPayments: number;
  todayAttendance: number;
  overdueMemberships: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}
