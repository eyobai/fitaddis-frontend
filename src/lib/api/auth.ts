import { BASE_URL, defaultHeaders } from "./config";
import type {
  FitnessCenter,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "./types";

export async function loginFitnessCenter(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/login-fitness-center`, {
    method: "POST",
    headers: defaultHeaders,
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
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  const data = (await res.json()) as AuthResponse;
  return data;
}

export async function fetchFitnessCenterDetails(
  fitnessCenterId: number,
): Promise<FitnessCenter> {
  const res = await fetch(`${BASE_URL}/fitness-center/${fitnessCenterId}`, {
    method: "GET",
    headers: defaultHeaders,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to fetch fitness center details");
  }

  const data = (await res.json()) as { fitnessCenter: FitnessCenter };
  return data.fitnessCenter;
}
