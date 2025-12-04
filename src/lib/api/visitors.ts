import { BASE_URL, defaultHeaders, noStoreCache } from "./config";
import type {
  FitnessCenterVisitorsResponse,
  VisitorConversionResponse,
} from "./types";

export async function fetchFitnessCenterVisitors(
  fitnessCenterId: number,
): Promise<FitnessCenterVisitorsResponse> {
  const res = await fetch(
    `${BASE_URL}/fitness-center/${fitnessCenterId}/visitors`,
    {
      method: "GET",
      headers: defaultHeaders,
      ...noStoreCache,
    } as RequestInit,
  );

  if (!res.ok) {
    throw new Error("Failed to load visitors");
  }

  const data = (await res.json()) as FitnessCenterVisitorsResponse;
  return data;
}

export async function fetchVisitorConversionRate(
  fitnessCenterId: number,
  startDate: string,
  endDate: string,
): Promise<VisitorConversionResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/visitors/conversion-rate?startDate=${startDate}&endDate=${endDate}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load visitor conversion rate");
  }

  const data = (await res.json()) as VisitorConversionResponse;
  return data;
}
