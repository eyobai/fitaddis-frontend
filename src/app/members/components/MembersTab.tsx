import { useState, useMemo } from "react";
import { MembersTable } from "./MembersTable";
import { VisitorsTable } from "./VisitorsTable";
import { MEMBER_SUB_TABS, MemberSubTabId, FitnessCenterMember } from "./types";
import type { FitnessCenterVisitor } from "@/lib/api/fitnessCenterService";

interface MembersTabProps {
  data: { members: FitnessCenterMember[] } | null;
  loading: boolean;
  error: string | null;
  visitorsData: { visitors: FitnessCenterVisitor[]; totalVisitors: number } | null;
  visitorsLoading: boolean;
  visitorsError: string | null;
  onAddMember: () => void;
}

export function MembersTab({
  data,
  loading,
  error,
  visitorsData,
  visitorsLoading,
  visitorsError,
  onAddMember,
}: MembersTabProps) {
  const [activeMemberSubTab, setActiveMemberSubTab] =
    useState<MemberSubTabId>("members");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = useMemo(() => {
    if (!data?.members) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data.members;

    return data.members.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const phone = member.phone_number.toLowerCase();
      return fullName.includes(term) || phone.includes(term);
    });
  }, [data, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
          <input
            type="text"
            placeholder="Search members by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={onAddMember}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all"
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Member / Visitor
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2">
        {MEMBER_SUB_TABS.map((tab) => {
          const isActive = tab.id === activeMemberSubTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMemberSubTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              {tab.label}
              {tab.id === "members" && data && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    isActive ? "bg-slate-100" : "bg-slate-200/50"
                  }`}
                >
                  {filteredMembers.length}
                </span>
              )}
              {tab.id === "visitors" && visitorsData && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    isActive ? "bg-slate-100" : "bg-slate-200/50"
                  }`}
                >
                  {visitorsData.totalVisitors}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Members Table */}
      {activeMemberSubTab === "members" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <MembersTable
            members={filteredMembers}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {/* Visitors Tab */}
      {activeMemberSubTab === "visitors" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <VisitorsTable
            visitors={visitorsData?.visitors ?? []}
            loading={visitorsLoading}
            error={visitorsError}
          />
        </div>
      )}
    </div>
  );
}
