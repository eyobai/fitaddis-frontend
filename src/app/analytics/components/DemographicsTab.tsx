"use client";

import { useEffect, useState } from "react";
import {
  fetchMemberDemographics,
  DemographicsResponse,
} from "@/lib/api/fitnessCenterService";
import { Users, UserCircle, Calendar } from "lucide-react";

interface DemographicsTabProps {
  fitnessCenterId: number | null;
}

const GENDER_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  male: { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-500" },
  female: { bg: "bg-pink-100", text: "text-pink-700", bar: "bg-pink-500" },
  other: { bg: "bg-purple-100", text: "text-purple-700", bar: "bg-purple-500" },
};

const AGE_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  under_18: { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-500" },
  "18-24": { bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500" },
  "25-34": { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-500" },
  "35-44": { bg: "bg-violet-100", text: "text-violet-700", bar: "bg-violet-500" },
  "45-54": { bg: "bg-rose-100", text: "text-rose-700", bar: "bg-rose-500" },
  "55+": { bg: "bg-slate-100", text: "text-slate-700", bar: "bg-slate-500" },
};

const AGE_LABELS: Record<string, string> = {
  under_18: "Under 18",
  "18-24": "18-24",
  "25-34": "25-34",
  "35-44": "35-44",
  "45-54": "45-54",
  "55+": "55+",
};

export function DemographicsTab({ fitnessCenterId }: DemographicsTabProps) {
  const [data, setData] = useState<DemographicsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fitnessCenterId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchMemberDemographics(fitnessCenterId)
      .then((response) => {
        if (isMounted) {
          setData(response);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load demographics");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
              <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-40 mb-6" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-40 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-slate-900 font-medium">Failed to load demographics</p>
        <p className="text-sm text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const totalGender = Object.values(data.genderBreakdown).reduce((a, b) => a + b, 0);
  const totalAge = Object.values(data.ageBreakdown).reduce((a, b) => a + b, 0);

  return (
    <section className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100">
            <Users className="h-7 w-7 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Members</p>
            <p className="text-3xl font-bold text-slate-900">{data.totalMembers}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <UserCircle className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">Gender Distribution</h3>
          </div>

          {Object.keys(data.genderBreakdown).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No gender data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data.genderBreakdown).map(([gender, count]) => {
                const percentage = totalGender > 0 ? (count / totalGender) * 100 : 0;
                const colors = GENDER_COLORS[gender.toLowerCase()] || GENDER_COLORS.other;

                return (
                  <div key={gender}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
                          {gender}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                        <span className="text-xs text-slate-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gender Summary Circles */}
          {Object.keys(data.genderBreakdown).length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-center gap-6">
                {Object.entries(data.genderBreakdown).map(([gender, count]) => {
                  const percentage = totalGender > 0 ? (count / totalGender) * 100 : 0;
                  const colors = GENDER_COLORS[gender.toLowerCase()] || GENDER_COLORS.other;

                  return (
                    <div key={gender} className="text-center">
                      <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-2`}>
                        <span className={`text-lg font-bold ${colors.text}`}>{percentage.toFixed(0)}%</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 capitalize">{gender}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Age Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">Age Distribution</h3>
          </div>

          {Object.keys(data.ageBreakdown).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No age data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data.ageBreakdown)
                .sort((a, b) => {
                  const order = ["under_18", "18-24", "25-34", "35-44", "45-54", "55+"];
                  return order.indexOf(a[0]) - order.indexOf(b[0]);
                })
                .map(([ageGroup, count]) => {
                  const percentage = totalAge > 0 ? (count / totalAge) * 100 : 0;
                  const colors = AGE_COLORS[ageGroup] || { bg: "bg-slate-100", text: "text-slate-700", bar: "bg-slate-500" };
                  const label = AGE_LABELS[ageGroup] || ageGroup;

                  return (
                    <div key={ageGroup}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-900">{count}</span>
                          <span className="text-xs text-slate-500 ml-1">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      {data.details.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Detailed Breakdown</h3>
            <p className="text-sm text-slate-500">Members by gender and age group</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Age Group</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.details.map((detail, index) => {
                  const count = parseInt(detail.count);
                  const percentage = data.totalMembers > 0 ? (count / data.totalMembers) * 100 : 0;
                  const genderColors = GENDER_COLORS[detail.gender.toLowerCase()] || GENDER_COLORS.other;
                  const ageColors = AGE_COLORS[detail.age_group] || { bg: "bg-slate-100", text: "text-slate-700" };
                  const ageLabel = AGE_LABELS[detail.age_group] || detail.age_group;

                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${genderColors.bg} ${genderColors.text}`}>
                          {detail.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ageColors.bg} ${ageColors.text}`}>
                          {ageLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">{count}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
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
