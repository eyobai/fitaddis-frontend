"use client";

import { useEffect, useMemo, useState } from "react";
import { CircularPaymentStat } from "../../components/CircularPaymentStat";
import {
  fetchFitnessCenterTotalExpected,
  fetchFitnessCenterTotalPaid,
  fetchRevenueByPlan,
  RevenueByPlanItem,
} from "@/lib/api/fitnessCenterService";
import { getDefaultRange, formatCurrency, DateRange } from "../utils/billingUtils";

interface BillingOverviewTabProps {
  fitnessCenterId: number | null;
}

export function BillingOverviewTab({ fitnessCenterId }: BillingOverviewTabProps) {
  const [pendingRange, setPendingRange] = useState<DateRange>(() => getDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [stats, setStats] = useState({ paid: 0, expected: 0 });
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlanItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    if (!fitnessCenterId) return;

    const { start, end } = appliedRange;
    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchFitnessCenterTotalPaid(
        fitnessCenterId,
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10),
      ),
      fetchFitnessCenterTotalExpected(
        fitnessCenterId,
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10),
      ),
      fetchRevenueByPlan(
        fitnessCenterId,
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10),
      ),
    ])
      .then(([paidRes, expectedRes, revenueRes]) => {
        if (!isMounted) return;
        setStats({
          paid: paidRes.totalPaidAmount,
          expected: expectedRes.totalExpectedAmount,
        });
        setRevenueByPlan(revenueRes.plans);
        setTotalRevenue(revenueRes.totalRevenue);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load billing overview");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId, appliedRange]);

  const paidPercent = useMemo(() => {
    const totalTarget = stats.paid + stats.expected;
    if (totalTarget === 0) return 0;
    return Math.round((stats.paid / totalTarget) * 100);
  }, [stats]);

  const formattedRangeLabel = useMemo(() => {
    const { start, end } = appliedRange;
    if (!start || !end) return "";
    return `${new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }, [appliedRange]);

  const handleApplyRange = () => {
    if (!pendingRange.start || !pendingRange.end) {
      setRangeError("Both dates are required");
      return;
    }

    if (new Date(pendingRange.start) > new Date(pendingRange.end)) {
      setRangeError("Start date cannot be after end date");
      return;
    }

    setRangeError(null);
    setAppliedRange({ ...pendingRange });
  };

  return (
    <>
      <section className="mb-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-slate-600">
              Start date
              <input
                type="date"
                value={pendingRange.start}
                onChange={(e) =>
                  setPendingRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-600">
              End date
              <input
                type="date"
                value={pendingRange.end}
                onChange={(e) =>
                  setPendingRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </label>
          </div>

          <button
            onClick={handleApplyRange}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-slate-800"
          >
            Apply range
          </button>
        </div>
        {rangeError && (
          <p className="mt-3 text-sm font-medium text-rose-600">{rangeError}</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment Overview</h2>
              <p className="text-sm text-slate-500">
                {formattedRangeLabel || "Select a date range to view insights"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              {loading ? "Loading..." : paidPercent + "% collected"}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Collection progress</span>
                  <span className="text-sm font-bold text-emerald-600">{paidPercent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        {loading ? "-" : formatCurrency(stats.paid)}
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
                        {loading ? "-" : formatCurrency(stats.expected)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 text-center">Payment ratio</h2>
          {error ? (
            <p className="text-sm text-rose-600 text-center">Unable to load chart</p>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <CircularPaymentStat
                paid={stats.paid}
                expected={stats.paid + stats.expected}
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
        </section>
      </div>

      {/* Revenue by Plan Section */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Revenue by Membership Plan</h2>
            <p className="text-sm text-slate-500">
              {formattedRangeLabel || "Select a date range to view breakdown"}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
            {loading ? "Loading..." : `Total: ${formatCurrency(totalRevenue)}`}
          </div>
        </div>

        {error ? (
          <p className="text-sm text-rose-600">Unable to load revenue data</p>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          </div>
        ) : revenueByPlan.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No revenue data for this period</p>
        ) : (
          <div className="space-y-4">
            {revenueByPlan.map((plan) => {
              const revenue = parseFloat(plan.total_revenue) || 0;
              const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
              return (
                <div key={plan.membership_plan_id} className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-violet-100 p-2">
                        <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{plan.membership_plan_name}</p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(parseFloat(plan.plan_price))} / {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(revenue)}</p>
                      <p className="text-xs text-slate-500">{plan.total_payments} payment{parseInt(plan.total_payments) !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
