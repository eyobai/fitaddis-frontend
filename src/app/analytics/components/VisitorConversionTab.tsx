"use client";

import { useEffect, useState } from "react";
import {
  fetchVisitorConversionRate,
  VisitorConversionResponse,
  ConvertedMember,
} from "@/lib/api/fitnessCenterService";
import {
  getDefaultRange,
  formatDate,
  DateRange,
} from "../utils/analyticsUtils";
import {
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  Phone,
  ArrowRight,
  Target,
} from "lucide-react";

interface VisitorConversionTabProps {
  fitnessCenterId: number | null;
}

export function VisitorConversionTab({ fitnessCenterId }: VisitorConversionTabProps) {
  const [pendingRange, setPendingRange] = useState<DateRange>(() => getDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [data, setData] = useState<VisitorConversionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fitnessCenterId) return;
    const { start, end } = appliedRange;
    if (!start || !end) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchVisitorConversionRate(fitnessCenterId, start, end)
      .then((res) => {
        if (isMounted) {
          setData(res);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load conversion data");
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

  const getConversionColor = (rate: number) => {
    if (rate >= 50) return "text-emerald-600";
    if (rate >= 25) return "text-amber-600";
    return "text-rose-600";
  };

  const getConversionBg = (rate: number) => {
    if (rate >= 50) return "bg-emerald-100";
    if (rate >= 25) return "bg-amber-100";
    return "bg-rose-100";
  };

  return (
    <section className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
            <input
              type="date"
              value={pendingRange.start}
              onChange={(e) => setPendingRange((r) => ({ ...r, start: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
            <input
              type="date"
              value={pendingRange.end}
              onChange={(e) => setPendingRange((r) => ({ ...r, end: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={handleApplyRange}
            disabled={loading}
            className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Visitors</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{data?.totalVisitors ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Converted</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{data?.convertedVisitors ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getConversionBg(data?.conversionRate ?? 0)}`}>
              <TrendingUp className={`h-6 w-6 ${getConversionColor(data?.conversionRate ?? 0)}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className={`text-2xl font-bold ${getConversionColor(data?.conversionRate ?? 0)}`}>
                  {data?.conversionRate ?? 0}%
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <Calendar className="h-6 w-6 text-violet-600" />
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

      {/* Conversion Rate Visual */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Visitor to Member Conversion</h3>
            </div>
            <p className="text-teal-100 text-sm">
              {data?.convertedVisitors ?? 0} out of {data?.totalVisitors ?? 0} visitors became members
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold">{data?.conversionRate ?? 0}%</p>
            <p className="text-teal-100 text-sm">conversion rate</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-3 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${data?.conversionRate ?? 0}%` }}
          />
        </div>
      </div>

      {/* Converted Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Converted Members</h3>
              <p className="text-sm text-slate-500">Visitors who became members</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-24" />
                  </div>
                  <div className="h-6 w-24 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : !data?.convertedMembers || data.convertedMembers.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No conversions in this period</p>
            <p className="text-sm text-slate-400">Try adjusting your date range</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Visitor</th>
                  <th className="px-4 py-3">Visited</th>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.convertedMembers.map((item, index) => (
                  <tr key={`${item.visitor_id}-${item.member_id}-${index}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                          {item.visitor_first_name[0]}{item.visitor_last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.visitor_first_name} {item.visitor_last_name}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {item.phone_number}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{formatDate(item.visited_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ArrowRight className="h-5 w-5 text-emerald-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-600">
                          {item.member_first_name[0]}{item.member_last_name[0]}
                        </div>
                        <p className="font-medium text-slate-900">
                          {item.member_first_name} {item.member_last_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{formatDate(item.join_date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                        {item.membership_plan_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
