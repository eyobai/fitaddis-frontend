"use client";

import { useState } from "react";
import { DailyCheckinsPanel } from "./DailyCheckinsPanel";
import { MemberSelectionModal } from "./MemberSelectionModal";
import type { CheckinControllerReturn, DailyCheckinsControllerReturn } from "./types";

interface CheckinTabProps {
  checkin: CheckinControllerReturn;
  dailyCheckins: DailyCheckinsControllerReturn;
}

export function CheckinTab({ checkin, dailyCheckins }: CheckinTabProps) {
  const [showCheckinDetails, setShowCheckinDetails] = useState(false);
  const [showNameResults, setShowNameResults] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Check-in Panel */}
      <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
        <MemberSelectionModal
          checkin={checkin}
          showCheckinDetails={showCheckinDetails}
          setShowCheckinDetails={setShowCheckinDetails}
          onClose={() => setShowNameResults(false)}
        />
      )}

      {/* Daily Check-ins Panel */}
      <DailyCheckinsPanel dailyCheckins={dailyCheckins} />
    </div>
  );
}
