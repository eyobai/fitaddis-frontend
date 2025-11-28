import type { FitnessCenterMember, MemberSearchMember, DailyCheckinsResponse, FitnessCenterMembershipPlansResponse } from "@/lib/api/fitnessCenterService";

export const TABS = [
  { id: "members", label: "Members" },
  { id: "checkin", label: "Check-in" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export const MEMBER_SUB_TABS = [
  { id: "members", label: "Members" },
  { id: "visitors", label: "Visitors" },
] as const;

export type MemberSubTabId = (typeof MEMBER_SUB_TABS)[number]["id"];

export type CheckinMode = "code" | "name";

export type MemberTypeOption = "member" | "visitor";

// Re-export types for convenience
export type { FitnessCenterMember, MemberSearchMember, DailyCheckinsResponse, FitnessCenterMembershipPlansResponse };

// Controller return types
export interface MembersControllerReturn {
  data: { members: FitnessCenterMember[] } | null;
  loading: boolean;
  error: string | null;
}

export interface CheckinControllerReturn {
  mode: CheckinMode;
  setMode: (mode: CheckinMode) => void;
  codeInput: string;
  nameInput: string;
  setNameInput: (value: string) => void;
  member: MemberSearchMember | null;
  nameResults: MemberSearchMember[];
  loading: boolean;
  error: string | null;
  checkinSuccess: string | null;
  appendDigit: (digit: string) => void;
  backspace: () => void;
  clear: () => void;
  handleSearchByCode: () => Promise<void>;
  handleSearchByName: () => Promise<void>;
  handleCheckIn: (memberId: number) => Promise<void>;
  selectMember: (m: MemberSearchMember) => void;
  reset: () => void;
}

export interface DailyCheckinsControllerReturn {
  date: string;
  setDate: (date: string) => void;
  data: DailyCheckinsResponse | null;
  loading: boolean;
  error: string | null;
}

export interface AddMemberFormData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  joinDate: string;
  city: string;
  specificLocation: string;
  membershipPlanId: string;
  referralSourceId: string;
  emergencyContactName: string;
  emergencyContactPhoneNumber: string;
  emergencyContactRelation: string;
}

export interface AddMemberControllerReturn {
  fitnessCenterId: number | null;
  plansData: FitnessCenterMembershipPlansResponse | null;
  loadingPlans: boolean;
  submitting: boolean;
  error: string | null;
  successMessage: string | null;
  memberType: MemberTypeOption;
  setMemberType: (type: MemberTypeOption) => void;
  form: AddMemberFormData;
  handleChange: (field: keyof AddMemberFormData, value: string) => void;
  handleSubmit: () => Promise<void>;
}
