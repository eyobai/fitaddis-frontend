"use client";

import { useEffect, useState } from "react";
import {
  fetchFitnessCenterMembers,
  FitnessCenterMembersResponse,
} from "@/lib/api/fitnessCenterService";

export function useMembersController() {
  const [data, setData] = useState<FitnessCenterMembersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (typeof window === "undefined") return;

      const storedFitnessCenter = localStorage.getItem("fitnessCenter");
      if (!storedFitnessCenter) {
        setError("No fitness center selected");
        setLoading(false);
        return;
      }

      let fitnessCenterId: number | null = null;
      try {
        const parsed = JSON.parse(storedFitnessCenter) as { id?: number };
        if (parsed.id) {
          fitnessCenterId = parsed.id;
        }
      } catch (e) {
        console.error("Failed to parse fitnessCenter from localStorage", e);
        setError("Unable to read fitness center information");
        setLoading(false);
        return;
      }

      if (!fitnessCenterId) {
        setError("Invalid fitness center id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetchFitnessCenterMembers(fitnessCenterId);
        if (isMounted) {
          setData(response);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to fetch members");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
}
