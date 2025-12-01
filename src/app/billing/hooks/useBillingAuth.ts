"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useBillingAuth() {
  const router = useRouter();
  const [fitnessCenterId, setFitnessCenterId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    if (storedFitnessCenter) {
      try {
        const parsed = JSON.parse(storedFitnessCenter) as { id?: number };
        if (parsed.id) {
          setFitnessCenterId(parsed.id);
        }
      } catch (e) {
        console.error("Failed to parse fitnessCenter from localStorage", e);
      }
    }
  }, [router]);

  return { fitnessCenterId };
}
