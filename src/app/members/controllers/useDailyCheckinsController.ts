"use client";

import { useEffect, useState } from "react";
import { fetchDailyCheckins, DailyCheckinsResponse } from "@/lib/api/fitnessCenterService";

export function useDailyCheckinsController(fitnessCenterId: number | null) {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [data, setData] = useState<DailyCheckinsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fitnessCenterId) return;

    const id = fitnessCenterId;
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchDailyCheckins(id, date);
        if (isMounted) {
          setData(res);
        }
      } catch (e) {
        if (isMounted) {
          setError("Unable to load check-ins for selected date");
          setData(null);
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
  }, [fitnessCenterId, date]);

  return {
    date,
    setDate,
    data,
    loading,
    error,
  };
}
