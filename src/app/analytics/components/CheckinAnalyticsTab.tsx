"use client";

import { useEffect, useState } from "react";
import {
  fetchCheckinFrequency,
  CheckinFrequencyResponse,
} from "@/lib/api/fitnessCenterService";
import {
  getDefaultRange,
  formatDate,
  DateRange,
} from "../utils/analyticsUtils";
import {
  Activity,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Trophy,
  BarChart3,
} from "lucide-react";

interface CheckinAnalyticsTabProps {
  fitnessCenterId: number | null;
}

export function CheckinAnalyticsTab({ fitnessCenterId }: CheckinAnalyticsTabProps) {
  const [pendingRange, setPendingRange] = useState<DateRange>(() => getDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [frequencyData, setFrequencyData] = useState<CheckinFrequencyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fitnessCenterId) return;
    const { start, end } = appliedRange;
    if (!start || !end) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchCheckinFrequency(fitnessCenterId, start, end)
      .then((data) => {
        if (isMounted) {
          setFrequencyData(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load check-in data");
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
            <input
              type="date"
              value={pendingRange.end}
              onChange={(e) => setPendingRange((r) => ({ ...r, end: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
          <button
            onClick={handleApplyRange}
            disabled={loading}
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
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

      {/* Check-in Frequency Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <Activity className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Check-ins</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{frequencyData?.totalCheckins ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unique Members</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{frequencyData?.uniqueMembers ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Avg per Member</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">
                  {frequencyData?.avgCheckinsPerMember?.toFixed(1) ?? 0}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Info */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-5 w-5" />
          <h3 className="font-semibold">Reporting Period</h3>
        </div>
        <p className="text-violet-100">
          {formatDate(appliedRange.start)} — {formatDate(appliedRange.end)}
        </p>
      </div>

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Peak Hours</h4>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Coming Soon</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">Discover the busiest times at your gym</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Check-in Trends</h4>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Coming Soon</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">Daily, weekly, and monthly trends</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Trophy className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Most Active</h4>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Coming Soon</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">Top members by check-in count</p>
        </div>
      </div>
    </section>
  );
}
