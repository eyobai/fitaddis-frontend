export function getDefaultRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    start: startOfMonth.toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };
}

export function formatCurrency(num: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(num || 0) + " ETB";
}

export function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizePhoneNumber(phone: string) {
  if (!phone) return phone;
  return phone.startsWith("+") ? phone : `+${phone}`;
}

export type DateRange = {
  start: string;
  end: string;
};

export type ToastMessage = {
  type: "success" | "error";
  text: string;
} | null;
