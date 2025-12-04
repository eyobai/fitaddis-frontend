import { BASE_URL, defaultHeaders, noStoreCache } from "./config";
import type {
  FitnessCenterMembershipPlansResponse,
  MembershipPlan,
  CreateMembershipPlanPayload,
} from "./types";

export async function fetchFitnessCenterMembershipPlans(
  fitnessCenterId: number,
): Promise<FitnessCenterMembershipPlansResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/membership-plans`,
    {
      method: "GET",
      headers: defaultHeaders,
      ...noStoreCache,
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load membership plans");
  }

  const data = (await res.json()) as FitnessCenterMembershipPlansResponse;
  return data;
}

export async function createMembershipPlan(
  fitnessCenterId: number,
  payload: CreateMembershipPlanPayload,
): Promise<MembershipPlan> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/membership-plans`,
    {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to create membership plan");
  }

  const data = (await res.json()) as MembershipPlan;
  return data;
}
