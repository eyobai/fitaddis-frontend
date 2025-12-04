// API Configuration
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Common fetch options
export const defaultHeaders = {
  "Content-Type": "application/json",
};

export const noStoreCache = {
  cache: "no-store" as RequestCache,
};
