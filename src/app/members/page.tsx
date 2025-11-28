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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Members</h1>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 pb-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "members" && (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Search by name or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 shadow-sm"
              >
                Add Member
              </button>
            </div>

            <div className="mb-4 border-b border-slate-200">
              <div className="flex gap-4">
                {MEMBER_SUB_TABS.map((tab) => {
                  const isActive = tab.id === activeMemberSubTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMemberSubTab(tab.id)}
                      className={`relative px-3 pb-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                        isActive
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeMemberSubTab === "members" && (
              <div className="rounded-lg border border-slate-200 bg-white p-0 text-sm text-slate-600 overflow-hidden shadow-sm">
                {loading && <div className="p-6">Loading members...</div>}
                {error && !loading && (
                  <div className="p-6 text-red-600">{error}</div>
                )}
                {data && !loading && !error && (
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">Full Name</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Membership</th>
                        <th className="px-4 py-3 font-medium">Last Check-in</th>
                        <th className="px-4 py-3 font-medium">Billing Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {filteredMembers.map((member) => {
                        const fullName = `${member.first_name} ${member.last_name}`;
                        const lastCheckIn = member.last_check_in_time
                          ? new Date(member.last_check_in_time).toLocaleString()
                          : "Never";
                        const billingStatus = member.latest_billing_status;

                        return (
                          <tr key={member.member_id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{fullName}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{member.phone_number}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-800">
                                {member.membership_name}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-500">{lastCheckIn}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`capitalize inline-flex items-center text-xs ${billingStatus === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-700'}`}>
                                {billingStatus}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {member.latest_billing_amount}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeMemberSubTab === "visitors" && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Visitors list / registration will go here.
              </div>
            )}
          </>
        )}

        {activeTab === "checkin" && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
            <div>
              <div className="mb-4 flex gap-6 border-b border-slate-200 pb-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  checkin.setMode("code");
                  setShowCheckinDetails(false);
                }}
                className={`relative px-2 pb-1 font-medium transition-colors border-b-2 -mb-px ${
                  checkin.mode === "code"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Enter Code
              </button>
              <button
                type="button"
                onClick={() => {
                  checkin.setMode("name");
                  setShowCheckinDetails(false);
                }}
                className={`relative px-2 pb-1 font-medium transition-colors border-b-2 -mb-px ${
                  checkin.mode === "name"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Name Search
              </button>
              </div>

              {checkin.mode === "code" && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-xs rounded-full bg-slate-100 px-4 py-2 text-center text-lg font-semibold tracking-[0.3em] text-slate-900 border border-slate-200">
                  {checkin.codeInput || "----"}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => checkin.appendDigit(digit)}
                      className="h-12 w-12 rounded-full bg-slate-50 text-slate-900 text-lg font-semibold shadow-sm border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-center"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={checkin.backspace}
                    className="h-12 w-12 rounded-full bg-slate-50 text-slate-700 text-sm shadow-sm border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center col-span-1"
                  >
                    Del
                  </button>
                  <button
                    type="button"
                    onClick={checkin.clear}
                    className="h-12 w-12 rounded-full bg-slate-50 text-slate-700 text-sm shadow-sm border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center col-span-1"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckinDetails(true);
                      checkin.handleSearchByCode();
                      setShowNameResults(true);
                    }}
                    className="h-12 w-12 rounded-full bg-slate-900 text-white text-lg font-semibold shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center col-span-1"
                  >
                    Go
                  </button>
                </div>
              </div>
              )}

              {checkin.mode === "name" && (
              <div className="flex flex-col gap-4 max-w-md">
                <input
                  type="text"
                  placeholder="Search by name"
                  value={checkin.nameInput}
                  onChange={(e) => checkin.setNameInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckinDetails(false);
                    checkin.handleSearchByName();
                    setShowNameResults(true);
                  }}
                  className="self-start rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Search
                </button>
              </div>
              )}

              <div className="mt-6 space-y-4">
              {checkin.loading && <p>Searching member...</p>}
              {checkin.error && !checkin.loading && (
                <p className="text-red-600 text-sm">{checkin.error}</p>
              )}

              {showNameResults && (checkin.nameResults.length > 0 || checkin.member) && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                  <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-lg text-xs">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">
                        Select Member
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowNameResults(false)}
                        className="text-slate-500 hover:text-slate-800 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white text-xs overflow-hidden max-h-52 overflow-y-auto">
                      <ul className="divide-y divide-slate-100">
                        {checkin.nameResults.map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              onClick={() => {
                                checkin.selectMember(m);
                                setShowCheckinDetails(true);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {m.first_name} {m.last_name}
                                </div>
                                <div className="text-[11px] text-slate-600">
                                  {m.email} · {m.phone_number}
                                </div>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Code: {m.check_in_code}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {checkin.member && showCheckinDetails && (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 grid grid-cols-2 gap-3">
                          <div>
                            <div className="font-semibold">Name</div>
                            <div>
                              {checkin.member.first_name} {checkin.member.last_name}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">Phone</div>
                            <div>{checkin.member.phone_number}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Email</div>
                            <div>{checkin.member.email}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Check-in Code</div>
                            <div>{checkin.member.check_in_code}</div>
                          </div>
                          <div>
                            <div className="font-semibold">City</div>
                            <div>{checkin.member.city}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Location</div>
                            <div>{checkin.member.specific_location}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => checkin.handleCheckIn(checkin.member!.id)}
                            className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
                          >
                            Check in
                          </button>
                          {checkin.checkinSuccess && (
                            <span className="text-emerald-600">
                              {checkin.checkinSuccess}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

            <div className="border-l border-slate-200 pl-0 md:pl-4 md:ml-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  Daily Check-ins
                </h2>
                <input
                  type="date"
                  value={dailyCheckins.date}
                  onChange={(e) => dailyCheckins.setDate(e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              {dailyCheckins.loading && (
                <p className="text-xs text-slate-600">Loading check-ins...</p>
              )}
              {dailyCheckins.error && !dailyCheckins.loading && (
                <p className="text-xs text-red-600">{dailyCheckins.error}</p>
              )}
              {!dailyCheckins.loading &&
                !dailyCheckins.error &&
                dailyCheckins.data &&
                dailyCheckins.data.members.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No check-ins for this date.
                  </p>
                )}
              {dailyCheckins.data && dailyCheckins.data.members.length > 0 && (
                <ul className="mt-2 max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {dailyCheckins.data.members.map((m) => (
                    <li key={m.id} className="py-2 flex items-center justify-between hover:bg-slate-50 px-2 rounded-md">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {m.first_name} {m.last_name}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {m.email} · {m.phone_number}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {new Date(m.check_in_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
