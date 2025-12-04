"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useBillingAuth() {
  const router = useRouter();
  const [fitnessCenterId, setFitnessCenterId] = useState<number | null>(null);
  const [fitnessCenterName, setFitnessCenterName] = useState<string>("");

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
        const parsed = JSON.parse(storedFitnessCenter) as { id?: number; name?: string };
        if (parsed.id) {
          setFitnessCenterId(parsed.id);
        }
        if (parsed.name) {
          setFitnessCenterName(parsed.name);
        }
      } catch (e) {
        console.error("Failed to parse fitnessCenter from localStorage", e);
      }
    }
  }, [router]);

  return { fitnessCenterId, fitnessCenterName };
}
