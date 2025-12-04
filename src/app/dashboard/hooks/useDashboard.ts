"use client";

import { useEffect, useState } from "react";
import {
  fetchFitnessCenterTotalMembers,
  fetchFitnessCenterActiveMembers,
  fetchFitnessCenterInactiveMembers,
  fetchFitnessCenterTotalPaid,
  fetchFitnessCenterTotalExpected,
  fetchDailyCheckins,
  fetchFitnessCenterOverdueMembers,
  fetchExpiringMembers,
} from "@/lib/api/fitnessCenterService";

type RecentActivityItem = {
  id: string | number;
  title: string;
  subtitle: string;
  userInitials: string;
  date: string;
};

type DashboardData = {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalPaidThisMonth: number;
  totalExpectedThisMonth: number;
  todayCheckins: number;
  overdueMembers: number;
  expiringMembers: number;
  recentActivity?: RecentActivityItem[];
};

export function useDashboard(fitnessCenterId: number = 0) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!fitnessCenterId) {
        return;
      }
      try {
        setLoading(true);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const startDate = startOfMonth.toISOString().slice(0, 10);
        const endDate = now.toISOString().slice(0, 10);

        const todayDate = now.toISOString().slice(0, 10);

        const [totalRes, activeRes, inactiveRes, totalPaidRes, totalExpectedRes, dailyCheckinsRes, overdueRes, expiringRes] =
          await Promise.all([
            fetchFitnessCenterTotalMembers(fitnessCenterId),
            fetchFitnessCenterActiveMembers(fitnessCenterId),
            fetchFitnessCenterInactiveMembers(fitnessCenterId),
            fetchFitnessCenterTotalPaid(fitnessCenterId, startDate, endDate),
            fetchFitnessCenterTotalExpected(
              fitnessCenterId,
              startDate,
              endDate,
            ),
            fetchDailyCheckins(fitnessCenterId, todayDate),
            fetchFitnessCenterOverdueMembers(fitnessCenterId),
            fetchExpiringMembers(fitnessCenterId, 7),
          ]);

        if (isMounted) {
          setData({
            totalMembers: totalRes.totalMembers,
            activeMembers: activeRes.activeMembers,
            inactiveMembers: inactiveRes.inactiveMembers,
            totalPaidThisMonth: totalPaidRes.totalPaidAmount,
            totalExpectedThisMonth: totalExpectedRes.totalExpectedAmount,
            todayCheckins: dailyCheckinsRes.members?.length ?? 0,
            overdueMembers: overdueRes.totalOverdueMembers ?? 0,
            expiringMembers: expiringRes.totalMembers ?? 0,
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to fetch dashboard data");
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
  }, [fitnessCenterId]);

  return {
    data,
    loading,
    error,
  };
}
