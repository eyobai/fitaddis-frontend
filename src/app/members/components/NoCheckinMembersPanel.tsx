"use client";

import { useState, useEffect } from "react";
import {
  fetchNoCheckinMembers,
  NoCheckinMember,
} from "@/lib/api/fitnessCenterService";

export function NoCheckinMembersPanel() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [members, setMembers] = useState<NoCheckinMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (typeof window === "undefined") return;

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    if (!storedFitnessCenter) {
      setError("No fitness center is logged in");
      return;
    }

    let parsed: { id?: number };
    try {
      parsed = JSON.parse(storedFitnessCenter) as { id?: number };
    } catch {
      setError("Unable to read fitness center information");
      return;
    }

    if (!parsed.id) {
      setError("Invalid fitness center information");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetchNoCheckinMembers(parsed.id, startDate, endDate);
      setMembers(res.members);
      setTotalMembers(res.totalMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">No Check-in Members</h2>
        <p className="text-sm text-amber-100">
          Find members who haven&apos;t checked in during a date range
        </p>
      </div>

      <div className="p-6">
        {/* Date Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Results */}
        {hasSearched && !loading && !error && (
          <>
            {/* Summary */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
              <svg
                className="h-5 w-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-amber-800">
                Found <strong>{totalMembers}</strong> member
                {totalMembers !== 1 ? "s" : ""} with no check-ins between{" "}
                <strong>{startDate}</strong> and <strong>{endDate}</strong>
              </span>
            </div>

            {/* Members Table */}
            {members.length > 0 ? (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Check-in Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Join Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((member) => {
                      const fullName = `${member.first_name} ${member.last_name}`;
                      const initials =
                        `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
                      const joinDate = new Date(
                        member.join_date
                      ).toLocaleDateString();

                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                                {initials}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 text-sm">
                                  {fullName}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-slate-700">
                              {member.phone_number}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-slate-700">
                              {member.check_in_code}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-slate-600">
                              {joinDate}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="h-12 w-12 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  All members have checked in!
                </p>
                <p className="text-xs text-slate-500">
                  No members found without check-ins in this period
                </p>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              className="h-12 w-12 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-slate-500">
              Select a date range and click Search to find members with no
              check-ins
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
