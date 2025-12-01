"use client";

import type { AddMemberControllerReturn } from "./types";

interface AddMemberModalProps {
  addMember: AddMemberControllerReturn;
  onClose: () => void;
}

export function AddMemberModal({ addMember, onClose }: AddMemberModalProps) {
  // Type Selection Step
  if (addMember.step === "select-type") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col transform transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add New</h2>
              <p className="text-sm text-slate-500">Select the type of registration</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-3">
            <button
              type="button"
              onClick={() => addMember.selectType("member")}
              className="w-full flex items-center gap-4 rounded-xl border-2 border-slate-200 p-4 text-left hover:border-slate-900 hover:bg-slate-50 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-900 transition-colors">
                <svg className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Member</h3>
                <p className="text-sm text-slate-500">Full registration with membership plan</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => addMember.selectType("visitor")}
              className="w-full flex items-center gap-4 rounded-xl border-2 border-slate-200 p-4 text-left hover:border-slate-900 hover:bg-slate-50 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-900 transition-colors">
                <svg className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Visitor</h3>
                <p className="text-sm text-slate-500">Quick registration for guests</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Visitor Form
  if (addMember.memberType === "visitor") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col transform transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add Visitor</h2>
              <p className="text-sm text-slate-500">Quick registration for guests</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {(addMember.error || addMember.successMessage) && (
            <div
              className={`px-6 py-3 text-xs font-medium border-b ${
                addMember.error
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}
            >
              {addMember.error || addMember.successMessage}
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                  First Name
                </label>
                <input
                  type="text"
                  value={addMember.form.firstName}
                  onChange={(e) => addMember.handleChange("firstName", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                  Last Name
                </label>
                <input
                  type="text"
                  value={addMember.form.lastName}
                  onChange={(e) => addMember.handleChange("lastName", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                Phone Number
              </label>
              <input
                type="tel"
                value={addMember.form.phoneNumber}
                onChange={(e) => addMember.handleChange("phoneNumber", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                placeholder="+251912345678"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                Gender
              </label>
              <select
                value={addMember.form.gender}
                onChange={(e) => addMember.handleChange("gender", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Visitor"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Member Form (existing form without member type toggle)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add New Member</h2>
            <p className="text-sm text-slate-500">Register a new member with full details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Status Bar */}
        {(addMember.error || addMember.successMessage) && (
          <div
            className={`px-6 py-3 text-xs font-medium border-b ${
              addMember.error
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}
          >
            {addMember.error || addMember.successMessage}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column: Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  1
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={addMember.form.firstName}
                    onChange={(e) => addMember.handleChange("firstName", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    Last Name
                  </label>
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
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    Gender
                  </label>
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
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={addMember.form.dateOfBirth}
                    onChange={(e) => addMember.handleChange("dateOfBirth", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={addMember.form.email}
                  onChange={(e) => addMember.handleChange("email", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                  Phone Number
                </label>
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
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  2
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Membership Details</h3>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500 uppercase">
                  Membership Plan
                </label>
                {addMember.loadingPlans ? (
                  <div className="flex items-center justify-center py-8">
                    <svg
                      className="animate-spin h-5 w-5 text-slate-400"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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
                              ? "border-slate-900 bg-slate-900 text-white shadow-md"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-sm font-semibold truncate ${
                                  isSelected ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {plan.name}
                              </div>
                              <div
                                className={`mt-0.5 text-xs ${
                                  isSelected ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""}{" "}
                                duration
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div
                                className={`text-sm font-bold ${
                                  isSelected ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {plan.price ? `${plan.price}` : "0.00"}
                              </div>
                              <div
                                className={`text-[10px] ${
                                  isSelected ? "text-slate-300" : "text-slate-400"
                                }`}
                              >
                                ETB
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
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
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={addMember.form.joinDate}
                    onChange={(e) => addMember.handleChange("joinDate", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    Referral ID
                  </label>
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
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    value={addMember.form.city}
                    onChange={(e) => addMember.handleChange("city", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                    Location
                  </label>
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                !
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Emergency Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={addMember.form.emergencyContactName}
                  onChange={(e) => addMember.handleChange("emergencyContactName", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={addMember.form.emergencyContactPhoneNumber}
                  onChange={(e) =>
                    addMember.handleChange("emergencyContactPhoneNumber", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                  Relation
                </label>
                <input
                  type="text"
                  value={addMember.form.emergencyContactRelation}
                  onChange={(e) =>
                    addMember.handleChange("emergencyContactRelation", e.target.value)
                  }
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
            onClick={onClose}
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
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Member"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
