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
                className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
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
              <div className="rounded-lg border border-slate-200 bg-white p-0 text-sm text-slate-600 overflow-hidden">
                {loading && <div className="p-6">Loading members...</div>}
                {error && !loading && (
                  <div className="p-6 text-red-600">{error}</div>
                )}
                {data && !loading && !error && (
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
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
                          <tr key={member.member_id}>
                            <td className="px-4 py-3 whitespace-nowrap">{fullName}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{member.phone_number}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{member.membership_name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{lastCheckIn}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="capitalize">{billingStatus}</div>
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
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Visitors list / registration will go here.
              </div>
            )}
          </>
        )}

        {activeTab === "checkin" && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="w-full max-w-xs rounded-full bg-slate-100 px-4 py-2 text-center text-lg font-semibold tracking-[0.3em] text-slate-900">
                  {checkin.codeInput || "----"}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => checkin.appendDigit(digit)}
                      className="h-12 w-12 rounded-full bg-slate-100 text-slate-900 text-lg font-semibold shadow-sm hover:bg-slate-200 flex items-center justify-center"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={checkin.backspace}
                    className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 text-sm shadow-sm hover:bg-slate-200 flex items-center justify-center col-span-1"
                  >
                    Del
                  </button>
                  <button
                    type="button"
                    onClick={checkin.clear}
                    className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 text-sm shadow-sm hover:bg-slate-200 flex items-center justify-center col-span-1"
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
                    className="h-12 w-12 rounded-full bg-emerald-600 text-white text-lg font-semibold shadow-sm hover:bg-emerald-700 flex items-center justify-center col-span-1"
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
                    <li key={m.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {m.first_name} {m.last_name}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {m.email} · {m.phone_number}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500">
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

        {/* Add Member modal */}
        {showAddMember && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Add Member</h2>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="text-sm text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
              </div>

              {addMember.error && (
                <p className="mb-3 text-xs text-red-600">{addMember.error}</p>
              )}
              {addMember.successMessage && (
                <p className="mb-3 text-xs text-emerald-600">{addMember.successMessage}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block font-medium text-slate-700">
                      Member Type
                    </label>
                    <select
                      value={addMember.memberType}
                      onChange={(e) => addMember.setMemberType(e.target.value as any)}
                      className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="member">Member</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={addMember.form.firstName}
                        onChange={(e) => addMember.handleChange("firstName", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={addMember.form.lastName}
                        onChange={(e) => addMember.handleChange("lastName", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        Gender
                      </label>
                      <select
                        value={addMember.form.gender}
                        onChange={(e) => addMember.handleChange("gender", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={addMember.form.dateOfBirth}
                        onChange={(e) => addMember.handleChange("dateOfBirth", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-slate-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={addMember.form.phoneNumber}
                      onChange={(e) => addMember.handleChange("phoneNumber", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={addMember.form.email}
                      onChange={(e) => addMember.handleChange("email", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        Join Date
                      </label>
                      <input
                        type="date"
                        value={addMember.form.joinDate}
                        onChange={(e) => addMember.handleChange("joinDate", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        Referral Source Id
                      </label>
                      <input
                        type="number"
                        value={addMember.form.referralSourceId}
                        onChange={(e) => addMember.handleChange("referralSourceId", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        City
                      </label>
                      <input
                        type="text"
                        value={addMember.form.city}
                        onChange={(e) => addMember.handleChange("city", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        Specific Location
                      </label>
                      <input
                        type="text"
                        value={addMember.form.specificLocation}
                        onChange={(e) => addMember.handleChange("specificLocation", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-slate-700">
                      Membership Plan
                    </label>
                    <select
                      value={addMember.form.membershipPlanId}
                      onChange={(e) => addMember.handleChange("membershipPlanId", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="">Select a plan</option>
                      {addMember.plansData?.membershipPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                    {addMember.loadingPlans && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        Loading plans...
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-800">
                      Emergency Contact
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block font-medium text-slate-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={addMember.form.emergencyContactName}
                          onChange={(e) => addMember.handleChange("emergencyContactName", e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-slate-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={addMember.form.emergencyContactPhoneNumber}
                          onChange={(e) => addMember.handleChange("emergencyContactPhoneNumber", e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-slate-700">
                        Relation
                      </label>
                      <input
                        type="text"
                        value={addMember.form.emergencyContactRelation}
                        onChange={(e) => addMember.handleChange("emergencyContactRelation", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addMember.handleSubmit}
                  disabled={addMember.submitting}
                  className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {addMember.submitting ? "Saving..." : "Save Member"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
