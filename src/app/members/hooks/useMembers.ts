"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchFitnessCenterMembers,
  FitnessCenterMembersResponse,
  FitnessCenterMember,
} from "@/lib/api/fitnessCenterService";

export function useMembers() {
  const [data, setData] = useState<FitnessCenterMembersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getFitnessCenterId = useCallback(() => {
    if (typeof window === "undefined") return null;

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    if (!storedFitnessCenter) return null;

    try {
      const parsed = JSON.parse(storedFitnessCenter) as { id?: number };
      return parsed.id || null;
    } catch {
      return null;
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    const fitnessCenterId = getFitnessCenterId();
    
    if (!fitnessCenterId) {
      setError("No fitness center selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchFitnessCenterMembers(fitnessCenterId);
      setData(response);
      setError(null);
    } catch {
      setError("Unable to fetch members");
    } finally {
      setLoading(false);
    }
  }, [getFitnessCenterId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateMember = useCallback((updatedMember: FitnessCenterMember) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((member) =>
          member.member_id === updatedMember.member_id ? updatedMember : member
        ),
      };
    });
  }, []);

  return {
    data,
    loading,
    error,
    updateMember,
    refetch: fetchMembers,
  };
}
