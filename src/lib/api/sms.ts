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
