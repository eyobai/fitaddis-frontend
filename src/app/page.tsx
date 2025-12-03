"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardController } from "./dashboard/controllers/useDashboardController";
import { CircularPaymentStat } from "./components/CircularPaymentStat";
import { DashboardSkeleton } from "./components/PageSkeleton";

export default function Home() {
  const router = useRouter();
  const [fitnessCenterId, setFitnessCenterId] = useState<number | null>(null);
  const [centerName, setCenterName] = useState<string>("");
  const [centerStatus, setCenterStatus] = useState<"active" | "inactive">("active");

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
        const parsed = JSON.parse(storedFitnessCenter) as { id?: number; name?: string; status?: "active" | "inactive" };
        if (parsed.id) {
          setFitnessCenterId(parsed.id);
        }
        if (parsed.name) {
          setCenterName(parsed.name);
        }
        if (parsed.status) {
          setCenterStatus(parsed.status);
        }
      } catch (e) {
        console.error("Failed to parse fitnessCenter from localStorage", e);
      }
    }
  }, [router]);

  const { data, loading, error } = useDashboardController(fitnessCenterId ?? 0);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const paidPercent = data
    ? Math.round((data.totalPaidThisMonth / (data.totalPaidThisMonth + data.totalExpectedThisMonth || 1)) * 100)
    : 0;

  // Show skeleton while loading
  if (loading || !fitnessCenterId) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back{centerName ? `, ${centerName}` : ""}! 👋
              </h1>
              <p className="mt-1 text-slate-500">
                Here&apos;s what&apos;s happening with your gym today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {centerStatus === "inactive" ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                   Test Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Members */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 shadow-lg shadow-violet-500/20 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-white/80">Total Members</p>
              {loading ? (
                <div className="mt-2 h-9 w-20 rounded-lg bg-white/20 animate-pulse" />
              ) : error ? (
                <p className="mt-2 text-sm text-white/80">{error}</p>
              ) : (
                <p className="mt-2 text-4xl font-bold text-white">{data?.totalMembers ?? 0}</p>
              )}
            </div>
          </div>

          {/* Active Members */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Active
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-white/80">Active Members</p>
              {loading ? (
                <div className="mt-2 h-9 w-20 rounded-lg bg-white/20 animate-pulse" />
              ) : error ? (
                <p className="mt-2 text-sm text-white/80">{error}</p>
              ) : (
                <p className="mt-2 text-4xl font-bold text-white">{data?.activeMembers ?? 0}</p>
              )}
            </div>
          </div>

          {/* Inactive Members */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 shadow-lg shadow-rose-500/20 transition-all hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Needs Attention
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-white/80">Inactive Members</p>
              {loading ? (
                <div className="mt-2 h-9 w-20 rounded-lg bg-white/20 animate-pulse" />
              ) : error ? (
                <p className="mt-2 text-sm text-white/80">{error}</p>
              ) : (
                <p className="mt-2 text-4xl font-bold text-white">{data?.inactiveMembers ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Overview Card */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Payment Overview</h2>
                <p className="text-sm text-slate-500">This month&apos;s collection status</p>
              </div>
              <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-20 w-full rounded-xl bg-slate-100 animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Collection Progress</span>
                    <span className="text-sm font-bold text-emerald-600">{paidPercent}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
                      style={{ width: `${paidPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500 p-2">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Collected</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(data?.totalPaidThisMonth ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-500 p-2">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Pending</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(data?.totalExpectedThisMonth ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Circular Stats */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 text-center">Payment Ratio</h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-32 w-32 rounded-full bg-slate-100 animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-600 text-center">{error}</p>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <CircularPaymentStat
                  paid={data?.totalPaidThisMonth ?? 0}
                  expected={(data?.totalPaidThisMonth ?? 0) + (data?.totalExpectedThisMonth ?? 0)}
                  label="Paid vs Total"
                />
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="text-slate-600">Paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-200" />
                    <span className="text-slate-600">Pending</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/members")}
              className="group flex flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-violet-200 hover:bg-violet-50"
            >
              <div className="rounded-xl bg-violet-100 p-3 group-hover:bg-violet-200 transition-colors">
                <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">Add Member</span>
            </button>

            <button
              onClick={() => router.push("/members")}
              className="group flex flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="rounded-xl bg-emerald-100 p-3 group-hover:bg-emerald-200 transition-colors">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Check In</span>
            </button>

            <button
              onClick={() => router.push("/members")}
              className="group flex flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="rounded-xl bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Payments</span>
            </button>

            <button
              onClick={() => router.push("/members")}
              className="group flex flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-amber-200 hover:bg-amber-50"
            >
              <div className="rounded-xl bg-amber-100 p-3 group-hover:bg-amber-200 transition-colors">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
