"use client";

import { useEffect, useState } from "react";
import {
  fetchFitnessCenterVisitors,
  FitnessCenterVisitorsResponse,
} from "@/lib/api/fitnessCenterService";

export function useVisitors() {
  const [data, setData] = useState<FitnessCenterVisitorsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    if (!storedFitnessCenter) {
      setError("No fitness center is logged in");
      return;
    }

    let parsed: { id?: number };
    try {
      parsed = JSON.parse(storedFitnessCenter) as { id?: number };
    } catch (e) {
      setError("Unable to read fitness center information");
      return;
    }

    if (!parsed.id) {
      setError("Invalid fitness center information");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchFitnessCenterVisitors(parsed.id)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load visitors");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
