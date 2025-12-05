// ============================================
// Fitness Center Types
// ============================================
export type FitnessCenter = {
  id: number;
  name: string;
  city: string;
  specific_location: string;
  phone_number: string;
  email: string;
  created_at: string;
  status: "active" | "inactive";
  trial_end_date: string;
};

// ============================================
// Member Types
// ============================================
export type FitnessCenterMember = {
  member_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  check_in_code: string;
  join_date: string;
  city: string;
  specific_location: string;
  membership_plan_id: number;
  referral_source_id: number;
  created_at: string;
  membership_name: string;
  duration_months: number;
  membership_price: string;
  referral_source_name: string;
  emergency_contact_id: number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  last_check_in_time: string | null;
  total_check_ins: string;
  latest_billing_status: string;
  latest_billing_amount: string;
  latest_billing_date: string;
};

export type MemberSearchMember = {
  id: number;
  fitness_center_id: number;
  member_type_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  check_in_code: string;
  join_date: string;
  city: string;
  specific_location: string;
  membership_plan_id: number;
  referral_source_id: number;
  created_at: string;
  updated_at: string;
  latest_billing_status?: string;
  latest_billing_amount?: string;
  latest_billing_date?: string;
  latestBillingStatus?: string;
  latestBillingAmount?: string;
  latestBillingDate?: string;
};

export type NoCheckinMember = {
  id: number;
  fitness_center_id: number;
  member_type_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  check_in_code: string;
  join_date: string;
  city: string;
  specific_location: string;
  membership_plan_id: number;
  referral_source_id: number;
  created_at: string;
  updated_at: string;
};

export type NewMember = {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  join_date: string;
  city: string;
  membership_plan_name: string;
  membership_plan_price: string;
};

export type MostActiveMember = {
  memberId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  checkInCode: string;
  membershipPlanName: string;
  checkinCount: number;
  lastCheckin: string;
};

export type FitnessCenterExpiringMember = {
  member_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  check_in_code: string;
  membership_plan_name: string;
  duration_months: number;
  last_billing_date: string;
  last_billing_status: string;
  last_billing_amount: string;
  expiry_date: string;
  days_until_expiry?: {
    days: number;
  };
};

// ============================================
// Visitor Types
// ============================================
export type FitnessCenterVisitor = {
  id: number;
  fitness_center_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
  visit_date: string;
  created_at: string;
};

export type ConvertedMember = {
  member_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  join_date: string;
  membership_plan_name: string;
};

// ============================================
// Billing Types
// ============================================
export type FitnessCenterOverdueMember = {
  billing_id: number;
  member_id: number;
  amount: string;
  billing_date: string;
  status: string;
  due_date: string;
  days_overdue: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  check_in_code: string;
  membership_plan_name: string;
  duration_months: number;
};

export type RevenueByPlanItem = {
  membership_plan_id: number;
  membership_plan_name: string;
  plan_price: string;
  duration_months: number;
  total_payments: string;
  total_revenue: string;
};

// ============================================
// Membership Plan Types
// ============================================
export type MembershipPlan = {
  id: number;
  name: string;
  duration_months: number;
  fitness_center_id: number;
  price: string | null;
};

// ============================================
// Demographics Types
// ============================================
export type DemographicDetail = {
  gender: string;
  count: string;
  age_group: string;
};

// ============================================
// Notification Types
// ============================================
export type PaymentDueMember = {
  memberId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dueDate: string;
  amount: string;
  daysUntilDue: number;
  previewMessage: string;
};

export type BirthdayMember = {
  memberId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  age: number;
};

// ============================================
// Payload Types
// ============================================
export type EmergencyContactPayload = {
  contactName: string;
  phoneNumber: string;
  relation: string;
};

export type RegisterMemberPayload = {
  fitnessCenterId: number;
  memberTypeId: number;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  joinDate: string;
  city: string;
  specificLocation: string;
  membershipPlanId: number;
  referralSourceId: number;
  emergencyContact: EmergencyContactPayload;
};

export type RecordCheckInPayload = {
  memberId: number;
};

export type CreateMembershipPlanPayload = {
  name: string;
  durationMonths: number;
  price: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  city: string;
  specificLocation: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// ============================================
// Response Types
// ============================================
export type FitnessCenterTotalMembersResponse = {
  fitnessCenterId: number;
  totalMembers: number;
};

export type FitnessCenterActiveMembersResponse = {
  fitnessCenterId: number;
  activeMembers: number;
};

export type FitnessCenterInactiveMembersResponse = {
  fitnessCenterId: number;
  inactiveMembers: number;
};

export type FitnessCenterMembersResponse = {
  members: FitnessCenterMember[];
};

export type MemberSearchByCodeResponse = {
  member: MemberSearchMember;
};

export type MemberSearchByNameResponse = {
  members: MemberSearchMember[];
};

export type NoCheckinMembersResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  totalMembers: number;
  members: NoCheckinMember[];
};

export type NewMembersResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  totalNewMembers: number;
  members: NewMember[];
};

export type FitnessCenterExpiringMembersResponse = {
  fitnessCenterId: number;
  days: number;
  totalMembers: number;
  members: FitnessCenterExpiringMember[];
};

export type FitnessCenterVisitorsResponse = {
  fitnessCenterId: number;
  totalVisitors: number;
  visitors: FitnessCenterVisitor[];
};

export type VisitorConversionResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  totalVisitors: number;
  convertedVisitors: number;
  conversionRate: number;
  convertedMembers: ConvertedMember[];
};

export type FitnessCenterTotalPaidResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  totalPaidAmount: number;
};

export type FitnessCenterTotalExpectedResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  totalExpectedAmount: number;
};

export type FitnessCenterOverdueMembersResponse = {
  fitnessCenterId: number;
  totalOverdueMembers: number;
  members: FitnessCenterOverdueMember[];
};

export type RevenueByPlanResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  plans: RevenueByPlanItem[];
};

export type FitnessCenterMembershipPlansResponse = {
  fitnessCenterId: number;
  membershipPlans: MembershipPlan[];
};

export type DailyCheckinsResponse = {
  date: string;
  fitnessCenterId: number;
  members: (MemberSearchMember & { check_in_time: string })[];
};

export type CheckinFrequencyResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  totalCheckins: number;
  uniqueMembers: number;
  avgCheckinsPerMember: number;
};

export type MostActiveMembersResponse = {
  fitnessCenterId: number;
  startDate: string;
  endDate: string;
  limit: number;
  members: MostActiveMember[];
};

export type DemographicsResponse = {
  fitnessCenterId: number;
  totalMembers: number;
  genderBreakdown: Record<string, number>;
  ageBreakdown: Record<string, number>;
  details: DemographicDetail[];
};

export type AuthResponse = {
  fitnessCenter: FitnessCenter;
  token: string;
};

export type PaymentDuePreviewResponse = {
  fitnessCenterId: number;
  minDays: number;
  maxDays: number;
  totalMembers: number;
  members: PaymentDueMember[];
};

export type PaymentDueSendResponse = {
  fitnessCenterId: number;
  days: number;
  notificationsSent: number;
  smsStatus: string;
  members: PaymentDueMember[];
};

export type BirthdayTodayResponse = {
  fitnessCenterId: number;
  date: string;
  totalMembers: number;
  members: BirthdayMember[];
};

export type BirthdayPreviewResponse = {
  fitnessCenterId: number;
  days: number;
  totalMembers: number;
  members: (BirthdayMember & { birthdayDate: string; daysUntil: number })[];
};

export type BirthdaySendResponse = {
  fitnessCenterId: number;
  date: string;
  notificationsSent: number;
  smsStatus: string;
  members: BirthdayMember[];
};
