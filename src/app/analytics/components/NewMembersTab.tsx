"use client";

import { useEffect, useState } from "react";
import {
  fetchNewMembers,
  NewMember,
} from "@/lib/api/fitnessCenterService";
import {
  getDefaultRange,
  formatCurrency,
  formatDate,
  DateRange,
} from "../utils/analyticsUtils";
import {
  UserPlus,
  Calendar,
  TrendingUp,
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

interface NewMembersTabProps {
  fitnessCenterId: number | null;
}

export function NewMembersTab({ fitnessCenterId }: NewMembersTabProps) {
  const [pendingRange, setPendingRange] = useState<DateRange>(() => getDefaultRange());
  const [appliedRange, setAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [members, setMembers] = useState<NewMember[]>([]);
  const [totalNewMembers, setTotalNewMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!fitnessCenterId) return;
    const { start, end } = appliedRange;
    if (!start || !end) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchNewMembers(fitnessCenterId, start, end)
      .then((data) => {
        if (isMounted) {
          setMembers(data.members);
          setTotalNewMembers(data.totalNewMembers);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load new members");
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

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.first_name.toLowerCase().includes(query) ||
      member.last_name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.phone_number.includes(query)
    );
  });

  // Group members by membership plan for summary
  const planSummary = members.reduce((acc, member) => {
    const plan = member.membership_plan_name;
    if (!acc[plan]) {
      acc[plan] = { count: 0, revenue: 0 };
    }
    acc[plan].count += 1;
    acc[plan].revenue += parseFloat(member.membership_plan_price);
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  return (
    <section className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <UserPlus className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">New Members</p>
              <p className="text-2xl font-bold text-slate-900">{totalNewMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <TrendingUp className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">New Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(members.reduce((sum, m) => sum + parseFloat(m.membership_plan_price), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Date Range</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatDate(appliedRange.start)} - {formatDate(appliedRange.end)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Summary */}
      {Object.keys(planSummary).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">New Members by Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(planSummary).map(([plan, data]) => (
              <div key={plan} className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-700 truncate">{plan}</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{data.count}</span>
                  <span className="text-sm text-slate-500">{formatCurrency(data.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <span className="text-sm text-slate-500">
              {filteredMembers.length} of {members.length} members
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-4 py-3">City</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      <p className="text-sm text-slate-500">Loading new members...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-slate-300" />
                      <p className="text-sm text-slate-500">No new members found</p>
                      <p className="text-xs text-slate-400">Try adjusting your date range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-600">
                          {member.first_name[0]}{member.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.first_name} {member.last_name}</p>
                          <p className="text-xs text-slate-500 capitalize">{member.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="h-3 w-3" />
                          <span>{member.phone_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {member.membership_plan_name}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(parseFloat(member.membership_plan_price))}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-900">{formatDate(member.join_date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{member.city}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
