"use client";

import { useEffect, useState } from "react";
import {
  fetchCheckinFrequency,
  fetchMostActiveMembers,
  CheckinFrequencyResponse,
  MostActiveMember,
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
  Mail,
  Phone,
  Medal,
} from "lucide-react";

interface CheckinAnalyticsTabProps {
  fitnessCenterId: number | null;
}

export function CheckinAnalyticsTab({ fitnessCenterId }: CheckinAnalyticsTabProps) {
  const [pendingRange, setPendingRange] = useState<DateRange>(() => getDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [frequencyData, setFrequencyData] = useState<CheckinFrequencyResponse | null>(null);
  const [mostActiveMembers, setMostActiveMembers] = useState<MostActiveMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLoading, setActiveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fitnessCenterId) return;
    const { start, end } = appliedRange;
    if (!start || !end) return;

    let isMounted = true;
    setLoading(true);
    setActiveLoading(true);
    setError(null);

    // Fetch frequency data
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

    // Fetch most active members
    fetchMostActiveMembers(fitnessCenterId, start, end, 10)
      .then((data) => {
        if (isMounted) {
          setMostActiveMembers(data.members);
        }
      })
      .catch((err) => {
        console.error("Failed to load most active members:", err);
      })
      .finally(() => {
        if (isMounted) setActiveLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId, appliedRange]);

  const handleApplyRange = () => {
    setAppliedRange({ ...pendingRange });
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-500";
      case 2: return "text-slate-400";
      case 3: return "text-amber-600";
      default: return "text-slate-300";
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-50 border-yellow-200";
      case 2: return "bg-slate-50 border-slate-200";
      case 3: return "bg-amber-50 border-amber-200";
      default: return "bg-white border-slate-200";
    }
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

      {/* Most Active Members */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Most Active Members</h3>
              <p className="text-sm text-slate-500">Top 10 members by check-in count</p>
            </div>
          </div>
        </div>

        {activeLoading ? (
          <div className="p-8">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-24" />
                  </div>
                  <div className="h-6 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : mostActiveMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No check-in data available</p>
            <p className="text-sm text-slate-400">Try adjusting your date range</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mostActiveMembers.map((member, index) => {
              const rank = index + 1;
              return (
                <div
                  key={member.memberId}
                  className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${getRankBg(rank)} border-l-4`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8">
                    {rank <= 3 ? (
                      <Medal className={`h-6 w-6 ${getMedalColor(rank)}`} />
                    ) : (
                      <span className="text-lg font-bold text-slate-400">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3" />
                        {member.phoneNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 truncate">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="hidden sm:block">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {member.membershipPlanName}
                    </span>
                  </div>

                  {/* Check-in Count */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-violet-600">{member.checkinCount}</p>
                    <p className="text-xs text-slate-500">check-ins</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </section>
  );
}
