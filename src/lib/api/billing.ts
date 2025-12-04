import { BASE_URL, defaultHeaders, noStoreCache } from "./config";
import type {
  FitnessCenterTotalPaidResponse,
  FitnessCenterTotalExpectedResponse,
  FitnessCenterOverdueMembersResponse,
  RevenueByPlanResponse,
} from "./types";

export async function fetchFitnessCenterTotalPaid(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<FitnessCenterTotalPaidResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/billings/total-paid?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
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
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load total expected amount");
  }

  const data = (await res.json()) as FitnessCenterTotalExpectedResponse;
  return data;
}

export async function fetchFitnessCenterOverdueMembers(
  fitnessCenterId: number,
): Promise<FitnessCenterOverdueMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/billings/overdue-members`,
    {
      method: "GET",
      headers: defaultHeaders,
      ...noStoreCache,
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load overdue members");
  }

  const data = (await res.json()) as FitnessCenterOverdueMembersResponse;
  return data;
}

export async function fetchOverdueMembersByInterval(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<FitnessCenterOverdueMembersResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/billings/overdue-members/interval?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load overdue members for interval");
  }

  const data = (await res.json()) as FitnessCenterOverdueMembersResponse;
  return data;
}

export async function fetchRevenueByPlan(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<RevenueByPlanResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/billings/revenue-by-plan?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load revenue by plan");
  }

  const data = (await res.json()) as RevenueByPlanResponse;
  return data;
}
