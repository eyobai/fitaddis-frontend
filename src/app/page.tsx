"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardController } from "./dashboard/controllers/useDashboardController";
import { CircularPaymentStat } from "./components/CircularPaymentStat";

export default function Home() {
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

  const { data, loading, error } = useDashboardController(
    fitnessCenterId ?? 0,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Members</p>
          {loading && (
            <p className="mt-3 text-lg font-semibold text-slate-700">Loading...</p>
          )}
          {error && !loading && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
          {data && !loading && !error && (
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {data.totalMembers}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Active Members</p>
          {loading && (
            <p className="mt-3 text-lg font-semibold text-slate-700">Loading...</p>
          )}
          {error && !loading && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
          {data && !loading && !error && (
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {data.activeMembers}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Inactive Members</p>
          {loading && (
            <p className="mt-3 text-lg font-semibold text-slate-700">Loading...</p>
          )}
          {error && !loading && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
          {data && !loading && !error && (
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {data.inactiveMembers}
            </p>
          )}
        </div>

       
      </div>
       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        

        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 flex items-center justify-center">
          {loading && (
            <p className="text-lg font-semibold text-slate-700">Loading...</p>
          )}
          {error && !loading && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {data && !loading && !error && (
            <CircularPaymentStat
              paid={data.totalPaidThisMonth}
              expected={data.totalPaidThisMonth + data.totalExpectedThisMonth}
              label="Paid This Month"
            />
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 flex items-center justify-center">
          {loading && (
            <p className="text-lg font-semibold text-slate-700">Loading...</p>
          )}
          {error && !loading && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {data && !loading && !error && (
            <CircularPaymentStat
              paid={data.totalExpectedThisMonth}
              expected={data.totalPaidThisMonth + data.totalExpectedThisMonth}
              label="Unpaid This Month"
              paidColor="stroke-red-400"
            />
          )}
        </div>
      </div>
    </div>
  );
}
