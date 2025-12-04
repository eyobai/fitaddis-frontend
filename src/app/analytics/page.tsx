"use client";

import { useState } from "react";
import { useAnalyticsAuth } from "./hooks/useAnalyticsAuth";
import { NewMembersTab } from "./components/NewMembersTab";
import { DemographicsTab } from "./components/DemographicsTab";
import { CheckinAnalyticsTab } from "./components/CheckinAnalyticsTab";
import { MembershipPlanReportsTab } from "./components/MembershipPlanReportsTab";
import { VisitorConversionTab } from "./components/VisitorConversionTab";
import { UserPlus, Users, PieChart, Activity, CreditCard, UserCheck } from "lucide-react";

type TabId = "new-members" | "retention" | "demographics" | "checkins" | "plans" | "conversion";

const TABS = [
  { id: "new-members" as const, label: "New Members", icon: UserPlus },
  { id: "checkins" as const, label: "Check-ins", icon: Activity },
  { id: "conversion" as const, label: "Visitor Conversion", icon: UserCheck },
  { id: "plans" as const, label: "Membership Plans", icon: CreditCard },
  { id: "demographics" as const, label: "Demographics", icon: PieChart },
  { id: "retention" as const, label: "Retention Rate", icon: Users },
];

export default function AnalyticsPage() {
  const { fitnessCenterId } = useAnalyticsAuth();
  const [activeTab, setActiveTab] = useState<TabId>("new-members");

  // Show skeleton while fitness center ID is loading
  if (!fitnessCenterId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-200 rounded w-72" />
            <div className="flex gap-3">
              <div className="h-10 bg-slate-200 rounded-full w-32" />
              <div className="h-10 bg-slate-200 rounded-full w-32" />
              <div className="h-10 bg-slate-200 rounded-full w-32" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-slate-200 rounded-2xl" />
              <div className="h-32 bg-slate-200 rounded-2xl" />
              <div className="h-32 bg-slate-200 rounded-2xl" />
            </div>
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Member Analytics</h1>
          <p className="mt-2 text-slate-500">
            Track member growth, retention, and demographics.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-3 border-b border-slate-200 pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isComingSoon = tab.id === "retention";
            
            return (
              <button
                key={tab.id}
                onClick={() => !isComingSoon && setActiveTab(tab.id)}
                disabled={isComingSoon}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow"
                    : isComingSoon
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isComingSoon && (
                  <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Soon</span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "new-members" && (
          <NewMembersTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "retention" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Retention Rate</h3>
            <p className="text-slate-500 mt-2">Coming soon...</p>
          </div>
        )}

        {activeTab === "demographics" && (
          <DemographicsTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "checkins" && (
          <CheckinAnalyticsTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "plans" && (
          <MembershipPlanReportsTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "conversion" && (
          <VisitorConversionTab fitnessCenterId={fitnessCenterId} />
        )}
      </div>
    </div>
  );
}
