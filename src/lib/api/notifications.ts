import { BASE_URL, defaultHeaders, noStoreCache } from "./config";
import type {
  PaymentDuePreviewResponse,
  PaymentDueSendResponse,
  BirthdayTodayResponse,
  BirthdayPreviewResponse,
  BirthdaySendResponse,
} from "./types";

// ============================================
// Payment Due Notification APIs
// ============================================

export async function fetchPaymentDuePreview(
  fitnessCenterId: number,
  minDays: number,
  maxDays: number,
): Promise<PaymentDuePreviewResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/notifications/payment-due/preview?minDays=${minDays}&maxDays=${maxDays}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load payment due preview");
  }

  const data = (await res.json()) as PaymentDuePreviewResponse;
  return data;
}

export async function sendPaymentDueNotifications(
  fitnessCenterId: number,
  days: number,
): Promise<PaymentDueSendResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/notifications/payment-due/send?days=${days}`;

  const res = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to send payment due notifications");
  }

  const data = (await res.json()) as PaymentDueSendResponse;
  return data;
}

export async function sendPaymentDueToSelected(
  fitnessCenterId: number,
  memberIds: number[],
): Promise<PaymentDueSendResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/notifications/payment-due/send`;

  const res = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ memberIds }),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to send payment due notifications");
  }

  const data = (await res.json()) as PaymentDueSendResponse;
  return data;
}

// ============================================
// Birthday Notification APIs
// ============================================

export async function fetchBirthdaysToday(
  fitnessCenterId: number,
): Promise<BirthdayTodayResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/notifications/birthdays/today`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load today's birthdays");
  }

  const data = (await res.json()) as BirthdayTodayResponse;
  return data;
}

export async function fetchBirthdayPreview(
  fitnessCenterId: number,
  days: number,
): Promise<BirthdayPreviewResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/notifications/birthdays/preview?days=${days}`;

  const res = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    ...noStoreCache,
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to load birthday preview");
  }

  const data = (await res.json()) as BirthdayPreviewResponse;
  return data;
}

export async function sendBirthdayNotifications(
  fitnessCenterId: number,
  customMessage?: string,
): Promise<BirthdaySendResponse> {
  const url = `${BASE_URL}/fitness-center/${fitnessCenterId}/notifications/birthdays/send`;

  const res = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ message: customMessage }),
  } as RequestInit);

  if (!res.ok) {
    throw new Error("Failed to send birthday notifications");
  }

  const data = (await res.json()) as BirthdaySendResponse;
  return data;
}
