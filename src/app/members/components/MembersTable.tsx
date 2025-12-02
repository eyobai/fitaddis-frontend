"use client";

import { useState } from "react";
import type { FitnessCenterMember } from "./types";
import { MemberDetailModal } from "./MemberDetailModal";

interface MembersTableProps {
  members: FitnessCenterMember[];
  loading: boolean;
  error: string | null;
  onMemberUpdated?: (updatedMember: FitnessCenterMember) => void;
}

export function MembersTable({ members, loading, error, onMemberUpdated }: MembersTableProps) {
  const [selectedMember, setSelectedMember] = useState<FitnessCenterMember | null>(null);

  const handleMemberUpdated = (updatedMember: FitnessCenterMember) => {
    setSelectedMember(updatedMember);
    if (onMemberUpdated) {
      onMemberUpdated(updatedMember);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="ml-3 text-sm text-slate-500">Loading members...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="mt-2 text-sm text-slate-500">No members found</p>
        <p className="text-xs text-slate-400">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <>
    <table className="min-w-full">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/50">
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Member
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Contact
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Membership
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Last Check-in
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Billing
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {members.map((member) => {
          const fullName = `${member.first_name} ${member.last_name}`;
          const initials =
            `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
          const lastCheckIn = member.last_check_in_time
            ? new Date(member.last_check_in_time).toLocaleDateString()
            : "Never";
          const billingStatus = member.latest_billing_status;

          return (
            <tr
              key={member.member_id}
              onClick={() => setSelectedMember(member)}
              className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {fullName}
                    </div>
                    <div className="text-xs text-slate-400">
                      ID: {member.member_id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-700">
                  {member.phone_number}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                  {member.membership_name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      lastCheckIn === "Never" ? "bg-slate-300" : "bg-emerald-400"
                    }`}
                  />
                  <span className="text-sm text-slate-600">{lastCheckIn}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    billingStatus === "overdue"
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : billingStatus === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      billingStatus === "overdue"
                        ? "bg-red-500"
                        : billingStatus === "paid"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="capitalize">{billingStatus}</span>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {member.latest_billing_amount} ETB
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {/* Member Detail Modal */}
    {selectedMember && (
      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onMemberUpdated={handleMemberUpdated}
      />
    )}
  </>
  );
}
