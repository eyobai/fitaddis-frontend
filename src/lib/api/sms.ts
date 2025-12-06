import { BASE_URL, defaultHeaders } from "./config";

export async function sendMemberSms(payload: {
  to: string;
  message: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/sms/send`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    let message = "Failed to send SMS";
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch (err) {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
}

export interface OverdueMemberSms {
  memberId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  amount: string;
  daysOverdue: number;
  membershipPlanName: string;
  contactedToday: boolean;
}

export interface OverdueMembersResponse {
  fitnessCenterId: number;
  totalMembers: number;
  members: OverdueMemberSms[];
}

export async function fetchOverdueMembers(
  fitnessCenterId: number
): Promise<OverdueMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/sms/overdue`,
    {
      method: "GET",
      headers: defaultHeaders,
    } as RequestInit
  );

  if (!res.ok) {
    throw new Error("Failed to fetch overdue members");
  }

  return res.json();
}

export async function sendOverdueSms(
  fitnessCenterId: number,
  memberId: number
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/sms/overdue/send`,
    {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ memberId }),
    } as RequestInit
  );

  if (!res.ok) {
    let message = "Failed to send overdue SMS";
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch (err) {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
}

export interface ExpiringMemberSms {
  memberId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  daysUntilExpiry: number;
  membershipPlanName: string;
  contactedToday: boolean;
}

export interface ExpiringMembersResponse {
  fitnessCenterId: number;
  totalMembers: number;
  members: ExpiringMemberSms[];
}

export async function fetchExpiringMembersSms(
  fitnessCenterId: number,
  days: number = 7
): Promise<ExpiringMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/sms/expiring-soon?days=${days}`,
    {
      method: "GET",
      headers: defaultHeaders,
    } as RequestInit
  );

  if (!res.ok) {
    throw new Error("Failed to fetch expiring members");
  }

  return res.json();
}

export async function sendExpiringSms(
  fitnessCenterId: number,
  memberId: number
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/sms/expiring-soon/send`,
    {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ memberId }),
    } as RequestInit
  );

  if (!res.ok) {
    let message = "Failed to send expiring SMS";
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch (err) {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
}

export interface BirthdayMemberSms {
  memberId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  membershipPlanName: string;
  contactedToday: boolean;
}

export interface BirthdayMembersResponse {
  fitnessCenterId: number;
  totalMembers: number;
  members: BirthdayMemberSms[];
}

export async function fetchBirthdayMembersSms(
  fitnessCenterId: number
): Promise<BirthdayMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/sms/birthday`,
    {
      method: "GET",
      headers: defaultHeaders,
    } as RequestInit
  );

  if (!res.ok) {
    throw new Error("Failed to fetch birthday members");
  }

  return res.json();
}

export async function sendBirthdaySms(
  fitnessCenterId: number,
  memberId: number
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/sms/birthday/send`,
    {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ memberId }),
    } as RequestInit
  );

  if (!res.ok) {
    let message = "Failed to send birthday SMS";
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch (err) {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
}

export async function sendBulkSms(payload: {
  recipients: string[];
  message: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/sms/bulk-send`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    let message = "Failed to send bulk SMS";
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch (err) {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
}
