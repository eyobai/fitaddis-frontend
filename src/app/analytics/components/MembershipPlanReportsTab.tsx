"use client";

import { useEffect, useState } from "react";
import {
  fetchRevenueByPlan,
  RevenueByPlanItem,
} from "@/lib/api/fitnessCenterService";
import {
  getDefaultRange,
  formatCurrency,
  formatDate,
  DateRange,
} from "../utils/analyticsUtils";
import {
  BadgeCheck,
  TrendingUp,
  CreditCard,
  Calendar,
  Package,
} from "lucide-react";

interface MembershipPlanReportsTabProps {
  fitnessCenterId: number | null;
}

export function MembershipPlanReportsTab({ fitnessCenterId }: MembershipPlanReportsTabProps) {
  const [pendingRange, setPendingRange] = useState<DateRange>(() => getDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlanItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fitnessCenterId) return;
    const { start, end } = appliedRange;
    if (!start || !end) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchRevenueByPlan(fitnessCenterId, start, end)
      .then((data) => {
        if (isMounted) {
          setRevenueByPlan(data.plans);
          setTotalRevenue(data.totalRevenue);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load revenue data");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId, appliedRange]);

  const handleApplyRange = () => {
    setAppliedRange({ ...pendingRange });
  };

  const totalPayments = revenueByPlan.reduce((sum, plan) => sum + parseInt(plan.total_payments), 0);
  const activePlans = revenueByPlan.filter((plan) => parseFloat(plan.total_revenue) > 0).length;

  return (
    <section className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              {loading ? (
                <div className="h-7 w-24 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <CreditCard className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Payments</p>
              {loading ? (
                <div className="h-7 w-16 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-xl font-bold text-slate-900">{totalPayments}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Package className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Plans</p>
              {loading ? (
                <div className="h-7 w-12 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-xl font-bold text-slate-900">{activePlans} / {revenueByPlan.length}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Period</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatDate(appliedRange.start).split(",")[0]} - {formatDate(appliedRange.end).split(",")[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
            <input
              type="date"
              value={pendingRange.start}
              onChange={(e) => setPendingRange((r) => ({ ...r, start: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
            <input
              type="date"
              value={pendingRange.end}
              onChange={(e) => setPendingRange((r) => ({ ...r, end: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleApplyRange}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Revenue by Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-violet-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Revenue by Membership Plan</h3>
                <p className="text-sm text-slate-500">Breakdown of revenue by each plan</p>
              </div>
            </div>
            {!loading && (
              <div className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
                Total: {formatCurrency(totalRevenue)}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                      <div>
                        <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : revenueByPlan.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No revenue data for this period</p>
            <p className="text-sm text-slate-400">Try adjusting your date range</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {revenueByPlan.map((plan) => {
              const revenue = parseFloat(plan.total_revenue) || 0;
              const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
              const payments = parseInt(plan.total_payments);
              
              return (
                <div
                  key={plan.membership_plan_id}
                  className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-violet-100 p-2.5">
                        <BadgeCheck className="h-5 w-5 text-violet-600" />
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
                      <p className="text-xs text-slate-500">
                        {payments} payment{payments !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 text-right">{percentage.toFixed(1)}% of total revenue</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Performance Table */}
      {!loading && revenueByPlan.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Plan Performance Summary</h3>
            <p className="text-sm text-slate-500">Detailed breakdown of each membership plan</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Payments</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revenueByPlan.map((plan) => {
                  const revenue = parseFloat(plan.total_revenue) || 0;
                  const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
                  const payments = parseInt(plan.total_payments);
                  
                  return (
                    <tr key={plan.membership_plan_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">{plan.membership_plan_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-600">{formatCurrency(parseFloat(plan.plan_price))}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">{payments}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-600">{formatCurrency(revenue)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
