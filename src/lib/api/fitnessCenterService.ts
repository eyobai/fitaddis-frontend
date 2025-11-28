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

export type FitnessCenter = {
  id: number;
  name: string;
  city: string;
  specific_location: string;
  phone_number: string;
  email: string;
  created_at: string;
};

export type AuthResponse = {
  fitnessCenter: FitnessCenter;
  token: string;
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

export type FitnessCenterMember = {
  member_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  membership_name: string;
  duration_months: number;
  last_check_in_time: string | null;
  latest_billing_status: string;
  latest_billing_amount: string;
  latest_billing_date: string;
};

export type FitnessCenterMembersResponse = {
  members: FitnessCenterMember[];
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
};

export type MemberSearchByCodeResponse = {
  member: MemberSearchMember;
};

export type MemberSearchByNameResponse = {
  members: MemberSearchMember[];
};

export type MembershipPlan = {
  id: number;
  name: string;
  duration_months: number;
  fitness_center_id: number;
  price: string | null;
};

export type FitnessCenterMembershipPlansResponse = {
  fitnessCenterId: number;
  membershipPlans: MembershipPlan[];
};

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

const BASE_URL = "http://localhost:3000";

export type RecordCheckInPayload = {
  memberId: number;
};

export async function fetchFitnessCenterTotalMembers(
  fitnessCenterId: number,
): Promise<FitnessCenterTotalMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/total-members`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load total members");
  }

  const data = (await res.json()) as FitnessCenterTotalMembersResponse;
  return data;
}

export async function fetchFitnessCenterActiveMembers(
  fitnessCenterId: number,
): Promise<FitnessCenterActiveMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/active-members`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load active members");
  }

  const data = (await res.json()) as FitnessCenterActiveMembersResponse;
  return data;
}

export async function fetchFitnessCenterInactiveMembers(
  fitnessCenterId: number,
): Promise<FitnessCenterInactiveMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/inactive-members`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load inactive members");
  }

  const data = (await res.json()) as FitnessCenterInactiveMembersResponse;
  return data;
}

export async function fetchFitnessCenterTotalPaid(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<FitnessCenterTotalPaidResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/billings/total-paid?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load total paid amount");
  }

  const data = (await res.json()) as FitnessCenterTotalPaidResponse;
  return data;
}

export async function fetchFitnessCenterTotalExpected(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<FitnessCenterTotalExpectedResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/billings/total-expected?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load total expected amount");
  }

  const data = (await res.json()) as FitnessCenterTotalExpectedResponse;
  return data;
}

export async function fetchFitnessCenterMembers(
  fitnessCenterId: number,
): Promise<FitnessCenterMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/members`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load members");
  }

  const data = (await res.json()) as FitnessCenterMembersResponse;
  return data;
}

export async function searchMemberByCheckInCode(
  checkInCode: string,
): Promise<MemberSearchByCodeResponse> {
  const url = `${BASE_URL}/members/search?checkInCode=${encodeURIComponent(checkInCode)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Member not found");
  }

  const data = (await res.json()) as MemberSearchByCodeResponse;
  return data;
}

export async function searchMemberByName(
  name: string,
): Promise<MemberSearchByNameResponse> {
  const url = `${BASE_URL}/members/search?name=${encodeURIComponent(name)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Member not found");
  }

  const data = (await res.json()) as MemberSearchByNameResponse;
  return data;
}

export async function fetchFitnessCenterMembershipPlans(
  fitnessCenterId: number,
): Promise<FitnessCenterMembershipPlansResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/membership-plans`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load membership plans");
  }

  const data = (await res.json()) as FitnessCenterMembershipPlansResponse;
  return data;
}

export async function registerMember(
  payload: RegisterMemberPayload,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/register-member`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to register member");
  }
}

export async function recordMemberCheckIn(
  payload: RecordCheckInPayload,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/record-check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to record check-in");
  }
}

export async function loginFitnessCenter(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/login-fitness-center`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Invalid email or password");
  }

  const data = (await res.json()) as AuthResponse;
  return data;
}

export async function registerFitnessCenter(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/register-fitness-center`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  const data = (await res.json()) as AuthResponse;
  return data;
}
