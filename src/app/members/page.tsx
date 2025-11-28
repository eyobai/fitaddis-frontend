"use client";

import { useEffect, useMemo, useState } from "react";
import { useMembersController } from "./controllers/useMembersController";
import { useAddMemberController } from "./controllers/useAddMemberController";
import { useCheckinController } from "./controllers/useCheckinController";
import { useDailyCheckinsController } from "./controllers/useDailyCheckinsController";

const TABS = [
  { id: "members", label: "Members" },
  { id: "checkin", label: "Check-in" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const MEMBER_SUB_TABS = [
  { id: "members", label: "Members" },
  { id: "visitors", label: "Visitors" },
] as const;

type MemberSubTabId = (typeof MEMBER_SUB_TABS)[number]["id"];

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<TabId>("members");
  const [activeMemberSubTab, setActiveMemberSubTab] =
    useState<MemberSubTabId>("members");
  const { data, loading, error } = useMembersController();
  const [fitnessCenterId, setFitnessCenterId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    if (storedFitnessCenter) {
      try {
        const parsed = JSON.parse(storedFitnessCenter) as { id?: number };
        if (parsed.id) {
          setFitnessCenterId(parsed.id);
        }
      } catch (e) {
        console.error("Failed to parse fitnessCenter from localStorage", e);
      }
    }
  }, []);

  const checkin = useCheckinController();
  const dailyCheckins = useDailyCheckinsController(fitnessCenterId);
  const [showCheckinDetails, setShowCheckinDetails] = useState(false);
  const [showNameResults, setShowNameResults] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  const addMember = useAddMemberController(() => {
    // On success, simply reload the page to refresh members list for now
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Members</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your gym members and check-ins</p>
          </div>
          {data && !loading && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{data.members.length}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Total Members</div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{dailyCheckins.data?.members.length || 0}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Today&apos;s Check-ins</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Tabs */}
        <div className="mt-6 flex gap-1">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.id === "members" && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                )}
                {tab.id === "checkin" && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === "members" && (
          <div className="space-y-5">
            {/* Search & Actions Bar */}
            <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                onClick={() => setShowAddMember(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Member
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
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-slate-100' : 'bg-slate-200/50'}`}>
                        {filteredMembers.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Members Table */}
            {activeMemberSubTab === "members" && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-sm text-slate-500">Loading members...</span>
                  </div>
                )}
                {error && !loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}
                {data && !loading && !error && (
                  <>
                    {filteredMembers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-2 text-sm text-slate-500">No members found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search</p>
                      </div>
                    ) : (
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Membership</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Check-in</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredMembers.map((member) => {
                            const fullName = `${member.first_name} ${member.last_name}`;
                            const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
                            const lastCheckIn = member.last_check_in_time
                              ? new Date(member.last_check_in_time).toLocaleDateString()
                              : "Never";
                            const billingStatus = member.latest_billing_status;

                            return (
                              <tr key={member.member_id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                                      {initials}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-slate-900">{fullName}</div>
                                      <div className="text-xs text-slate-400">ID: {member.member_id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-700">{member.phone_number}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                                    {member.membership_name}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${lastCheckIn === 'Never' ? 'bg-slate-300' : 'bg-emerald-400'}`} />
                                    <span className="text-sm text-slate-600">{lastCheckIn}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                    billingStatus === 'overdue' 
                                      ? 'bg-red-50 text-red-700 border border-red-100' 
                                      : billingStatus === 'paid'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                      billingStatus === 'overdue' ? 'bg-red-500' : billingStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`} />
                                    <span className="capitalize">{billingStatus}</span>
                                  </div>
                                  <div className="mt-0.5 text-xs text-slate-400">{member.latest_billing_amount} ETB</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Visitors Tab */}
            {activeMemberSubTab === "visitors" && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Visitors</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm">Track and manage guest visitors to your fitness center.</p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Visitor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "checkin" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Check-in Panel */}
            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Panel Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Member Check-in</h2>
                <p className="text-sm text-slate-300">Enter code or search by name</p>
              </div>

              {/* Mode Tabs */}
              <div className="border-b border-slate-200 px-6">
                <div className="flex gap-1 -mb-px">
                  <button
                    type="button"
                    onClick={() => {
                      checkin.setMode("code");
                      setShowCheckinDetails(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      checkin.mode === "code"
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Enter Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      checkin.setMode("name");
                      setShowCheckinDetails(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      checkin.mode === "name"
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Name Search
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Code Entry Mode */}
                {checkin.mode === "code" && (
                  <div className="flex flex-col items-center">
                    {/* Code Display */}
                    <div className="w-full max-w-sm mb-8">
                      <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 px-6 py-5 text-center shadow-inner">
                        <div className="text-3xl font-bold tracking-[0.5em] text-slate-900 font-mono">
                          {checkin.codeInput || "----"}
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 uppercase tracking-wider">
                          Check-in Code
                        </div>
                      </div>
                    </div>

                    {/* Number Pad */}
                    <div className="grid grid-cols-3 gap-3 max-w-xs">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => checkin.appendDigit(digit)}
                          className="h-14 w-14 rounded-xl bg-white text-slate-900 text-xl font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-95 transition-all flex items-center justify-center"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={checkin.clear}
                        className="h-14 w-14 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium shadow-sm border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => checkin.appendDigit("0")}
                        className="h-14 w-14 rounded-xl bg-white text-slate-900 text-xl font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-95 transition-all flex items-center justify-center"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={checkin.backspace}
                        className="h-14 w-14 rounded-xl bg-slate-100 text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                        </svg>
                      </button>
                    </div>

                    {/* Go Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCheckinDetails(true);
                        checkin.handleSearchByCode();
                        setShowNameResults(true);
                      }}
                      className="mt-6 w-full max-w-xs rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-slate-700 hover:to-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check In
                    </button>
                  </div>
                )}

                {/* Name Search Mode */}
                {checkin.mode === "name" && (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Type member name..."
                        value={checkin.nameInput}
                        onChange={(e) => checkin.setNameInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCheckinDetails(false);
                        checkin.handleSearchByName();
                        setShowNameResults(true);
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-slate-700 hover:to-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Member
                    </button>
                  </div>
                )}

                {/* Status Messages */}
                <div className="mt-6">
                  {checkin.loading && (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Searching member...</span>
                    </div>
                  )}
                  {checkin.error && !checkin.loading && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-red-700">{checkin.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Member Selection Modal */}
            {showNameResults && (checkin.nameResults.length > 0 || checkin.member) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowNameResults(false)} />
                <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Select Member</h2>
                      <p className="text-sm text-slate-300">Choose a member to check in</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNameResults(false)}
                      className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Member List */}
                  <div className="max-h-64 overflow-y-auto">
                    {checkin.nameResults.map((m) => {
                      const initials = `${m.first_name[0]}${m.last_name[0]}`.toUpperCase();
                      const isSelected = checkin.member?.id === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            checkin.selectMember(m);
                            setShowCheckinDetails(true);
                          }}
                          className={`w-full px-6 py-4 text-left flex items-center gap-4 border-b border-slate-100 transition-colors ${
                            isSelected ? 'bg-slate-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${
                            isSelected ? 'bg-emerald-600' : 'bg-gradient-to-br from-slate-600 to-slate-800'
                          }`}>
                            {isSelected ? (
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900">{m.first_name} {m.last_name}</div>
                            <div className="text-sm text-slate-500 truncate">{m.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-slate-400 uppercase">Code</div>
                            <div className="text-sm font-mono font-semibold text-slate-700">{m.check_in_code}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Member Details */}
                  {checkin.member && showCheckinDetails && (
                    <div className="border-t border-slate-200 bg-slate-50 p-6">
                      {/* Member Name Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
                          {checkin.member.first_name[0]}{checkin.member.last_name[0]}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900">
                            {checkin.member.first_name} {checkin.member.last_name}
                          </div>
                          <div className="text-sm text-slate-500">
                            Code: <span className="font-mono font-semibold">{checkin.member.check_in_code}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Phone</div>
                          <div className="font-medium text-slate-900">{checkin.member.phone_number}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Location</div>
                          <div className="font-medium text-slate-900">{checkin.member.city}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => checkin.handleCheckIn(checkin.member!.id)}
                          className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Confirm Check-in
                        </button>
                      </div>
                      {checkin.checkinSuccess && (
                        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                          <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-emerald-700">{checkin.checkinSuccess}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Daily Check-ins Panel */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Panel Header */}
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Today&apos;s Check-ins</h2>
                  <p className="text-sm text-slate-500">{dailyCheckins.data?.members.length || 0} members checked in</p>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={dailyCheckins.date}
                    onChange={(e) => dailyCheckins.setDate(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>

              {/* Check-ins List */}
              <div className="max-h-[400px] overflow-y-auto">
                {dailyCheckins.loading && (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-sm text-slate-500">Loading check-ins...</span>
                  </div>
                )}
                {dailyCheckins.error && !dailyCheckins.loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <svg className="mx-auto h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="mt-2 text-sm text-red-600">{dailyCheckins.error}</p>
                    </div>
                  </div>
                )}
                {!dailyCheckins.loading &&
                  !dailyCheckins.error &&
                  dailyCheckins.data &&
                  dailyCheckins.data.members.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-600">No check-ins yet</p>
                      <p className="text-xs text-slate-400">Check-ins will appear here</p>
                    </div>
                  )}
                {dailyCheckins.data && dailyCheckins.data.members.length > 0 && (
                  <div className="divide-y divide-slate-100">
                    {dailyCheckins.data.members.map((m) => {
                      const initials = `${m.first_name[0]}${m.last_name[0]}`.toUpperCase();
                      return (
                        <div key={m.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900">{m.first_name} {m.last_name}</div>
                            <div className="text-xs text-slate-500 truncate">{m.phone_number}</div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(m.check_in_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Improved Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setShowAddMember(false)}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col transform transition-all">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white z-10">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add New Member</h2>
                  <p className="text-sm text-slate-500">Register a new member or visitor.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAddMember(false)} 
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>

              {/* Status Bar */}
              {(addMember.error || addMember.successMessage) && (
                <div className={`px-6 py-3 text-xs font-medium border-b ${addMember.error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                   {addMember.error || addMember.successMessage}
                </div>
              )}

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Left Column: Personal Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">1</div>
                      <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">First Name</label>
                        <input
                          type="text"
                          value={addMember.form.firstName}
                          onChange={(e) => addMember.handleChange("firstName", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                          placeholder="John"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Last Name</label>
                        <input
                          type="text"
                          value={addMember.form.lastName}
                          onChange={(e) => addMember.handleChange("lastName", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Gender</label>
                        <select
                          value={addMember.form.gender}
                          onChange={(e) => addMember.handleChange("gender", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Date of Birth</label>
                        <input
                          type="date"
                          value={addMember.form.dateOfBirth}
                          onChange={(e) => addMember.handleChange("dateOfBirth", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Email Address</label>
                      <input
                        type="email"
                        value={addMember.form.email}
                        onChange={(e) => addMember.handleChange("email", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Phone Number</label>
                      <input
                        type="tel"
                        value={addMember.form.phoneNumber}
                        onChange={(e) => addMember.handleChange("phoneNumber", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Right Column: Membership & Location */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">2</div>
                      <h3 className="text-sm font-semibold text-slate-900">Membership Details</h3>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Member Type</label>
                      <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => addMember.setMemberType('member')}
                          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${addMember.memberType === 'member' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Member
                        </button>
                        <button
                          type="button"
                          onClick={() => addMember.setMemberType('visitor')}
                          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${addMember.memberType === 'visitor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Visitor
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-500 uppercase">Membership Plan</label>
                      {addMember.loadingPlans ? (
                        <div className="flex items-center justify-center py-8">
                          <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="ml-2 text-xs text-slate-500">Loading plans...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                          {addMember.plansData?.membershipPlans.map((plan) => {
                            const isSelected = addMember.form.membershipPlanId === String(plan.id);
                            return (
                              <button
                                key={plan.id}
                                type="button"
                                onClick={() => addMember.handleChange("membershipPlanId", String(plan.id))}
                                className={`group relative w-full rounded-lg border-2 p-3 text-left transition-all ${
                                  isSelected
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                      {plan.name}
                                    </div>
                                    <div className={`mt-0.5 text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                      {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''} duration
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                      {plan.price ? `${plan.price}` : '0.00'}
                                    </div>
                                    <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                      ETB
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-2 right-2">
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                          {(!addMember.plansData || addMember.plansData.membershipPlans.length === 0) && (
                            <div className="py-4 text-center text-xs text-slate-500">
                              No membership plans available
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Join Date</label>
                        <input
                          type="date"
                          value={addMember.form.joinDate}
                          onChange={(e) => addMember.handleChange("joinDate", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Referral ID</label>
                        <input
                          type="number"
                          value={addMember.form.referralSourceId}
                          onChange={(e) => addMember.handleChange("referralSourceId", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">City</label>
                        <input
                          type="text"
                          value={addMember.form.city}
                          onChange={(e) => addMember.handleChange("city", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Location</label>
                        <input
                          type="text"
                          value={addMember.form.specificLocation}
                          onChange={(e) => addMember.handleChange("specificLocation", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Width: Emergency Contact */}
                <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">!</div>
                    <h3 className="text-sm font-semibold text-slate-900">Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                       <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Contact Name</label>
                       <input
                          type="text"
                          value={addMember.form.emergencyContactName}
                          onChange={(e) => addMember.handleChange("emergencyContactName", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                    </div>
                    <div>
                       <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Contact Phone</label>
                       <input
                          type="tel"
                          value={addMember.form.emergencyContactPhoneNumber}
                          onChange={(e) => addMember.handleChange("emergencyContactPhoneNumber", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                    </div>
                    <div>
                       <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Relation</label>
                       <input
                          type="text"
                          value={addMember.form.emergencyContactRelation}
                          onChange={(e) => addMember.handleChange("emergencyContactRelation", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addMember.handleSubmit}
                  disabled={addMember.submitting}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {addMember.submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : "Save Member"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
