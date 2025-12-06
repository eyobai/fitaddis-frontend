"use client";

import { useState } from "react";
import { useBillingAuth } from "./hooks/useBillingAuth";
import { OverdueMembersTab } from "./components/OverdueMembersTab";
import { ExpiringSoonTab } from "./components/ExpiringSoonTab";
import { MakePaymentTab } from "./components/MakePaymentTab";
import { MessageMembersTab } from "./components/MessageMembersTab";
import { BillingSkeleton } from "../components/PageSkeleton";

type TabId = "overdue" | "expiring" | "payment" | "messages";

export default function BillingPage() {
  const { fitnessCenterId, fitnessCenterName } = useBillingAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overdue");

  // Show skeleton while fitness center ID is loading
  if (!fitnessCenterId) {
    return <BillingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Billing Overview</h1>
          <p className="mt-2 text-slate-500">
            Track payments within any date range that matters to you.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-3 border-b border-slate-200 pb-2 text-sm font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab("overdue")}
            className={`rounded-full px-4 py-2 transition-all ${
              activeTab === "overdue"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Overdue Members
          </button>
          <button
            onClick={() => setActiveTab("expiring")}
            className={`rounded-full px-4 py-2 transition-all ${
              activeTab === "expiring"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Expiring Soon
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`rounded-full px-4 py-2 transition-all ${
              activeTab === "payment"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Make Payment
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`rounded-full px-4 py-2 transition-all ${
              activeTab === "messages"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Message Members
          </button>
        </div>

        {activeTab === "overdue" && (
          <OverdueMembersTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "expiring" && (
          <ExpiringSoonTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "payment" && (
          <MakePaymentTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "messages" && (
          <MessageMembersTab fitnessCenterId={fitnessCenterId} fitnessCenterName={fitnessCenterName} />
        )}
      </div>
    </div>
  );
}
