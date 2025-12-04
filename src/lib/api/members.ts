import { BASE_URL, defaultHeaders, noStoreCache } from "./config";
import type {
  FitnessCenterTotalMembersResponse,
  FitnessCenterActiveMembersResponse,
  FitnessCenterInactiveMembersResponse,
  FitnessCenterMembersResponse,
  MemberSearchByCodeResponse,
  MemberSearchByNameResponse,
  NoCheckinMembersResponse,
  NewMembersResponse,
  FitnessCenterExpiringMembersResponse,
  DemographicsResponse,
  RegisterMemberPayload,
  RecordCheckInPayload,
  DailyCheckinsResponse,
  CheckinFrequencyResponse,
  MostActiveMembersResponse,
} from "./types";

export async function fetchFitnessCenterTotalMembers(
  fitnessCenterId: number,
): Promise<FitnessCenterTotalMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/total-members`,
    {
      method: "GET",
      headers: defaultHeaders,
      ...noStoreCache,
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
      headers: defaultHeaders,
      ...noStoreCache,
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
      headers: defaultHeaders,
      ...noStoreCache,
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load inactive members");
  }

  const data = (await res.json()) as FitnessCenterInactiveMembersResponse;
  return data;
}

export async function fetchFitnessCenterMembers(
  fitnessCenterId: number,
): Promise<FitnessCenterMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/members`,
    {
      method: "GET",
      headers: defaultHeaders,
      ...noStoreCache,
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
    headers: defaultHeaders,
    ...noStoreCache,
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
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Member not found");
  }

  const data = (await res.json()) as MemberSearchByNameResponse;
  return data;
}

export async function fetchNoCheckinMembers(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<NoCheckinMembersResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/members/no-checkin?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load no-checkin members");
  }

  const data = (await res.json()) as NoCheckinMembersResponse;
  return data;
}

export async function fetchNewMembers(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<NewMembersResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/members/new?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load new members");
  }

  const data = (await res.json()) as NewMembersResponse;
  return data;
}

export async function fetchExpiringMembers(
  fitnessCenterId: number,
  days: number,
): Promise<FitnessCenterExpiringMembersResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/members/expiring?days=${days}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load expiring members");
  }

  const data = (await res.json()) as FitnessCenterExpiringMembersResponse;
  return data;
}

export async function fetchMemberDemographics(
  fitnessCenterId: number,
): Promise<DemographicsResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/members/demographics`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load member demographics");
  }

  const data = (await res.json()) as DemographicsResponse;
  return data;
}

export async function registerMember(
  payload: RegisterMemberPayload,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/register-member`, {
    method: "POST",
    headers: defaultHeaders,
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
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to record check-in");
  }
}

export async function fetchDailyCheckins(
  fitnessCenterId: number,
  date: string,
): Promise<DailyCheckinsResponse> {
  const url = `${BASE_URL}/check-ins?date=${date}&fitnessCenterId=${fitnessCenterId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load daily check-ins");
  }

  const data = (await res.json()) as DailyCheckinsResponse;
  return data;
}

export async function fetchCheckinFrequency(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<CheckinFrequencyResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/check-ins/frequency?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load check-in frequency");
  }

  const data = (await res.json()) as CheckinFrequencyResponse;
  return data;
}

export async function fetchMostActiveMembers(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
  limit: number = 10,
): Promise<MostActiveMembersResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/check-ins/most-active?startDate=${startDate}&endDate=${endDate}&limit=${limit}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load most active members");
  }

  const data = (await res.json()) as MostActiveMembersResponse;
  return data;
}
