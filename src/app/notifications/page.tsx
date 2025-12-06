"use client";

import { useState, useEffect } from "react";
import { useNotificationsAuth } from "./hooks/useNotificationsAuth";
import { PaymentDueTab } from "./components/PaymentDueTab";
import { BirthdayTab } from "./components/BirthdayTab";
import { CreditCard, Cake, Bell } from "lucide-react";
import { fetchBirthdaysToday, fetchPaymentDuePreview } from "@/lib/api/fitnessCenterService";

type TabId = "payment-due" | "birthdays";

interface Tab {
  id: TabId;
  label: string;
  icon: typeof CreditCard;
}

const TABS: Tab[] = [
  { id: "payment-due", label: "Payment Reminders", icon: CreditCard },
  { id: "birthdays", label: "Birthday Wishes", icon: Cake },
];

export default function NotificationsPage() {
  const { fitnessCenterId } = useNotificationsAuth();
  const [activeTab, setActiveTab] = useState<TabId>("payment-due");
  const [paymentDueCount, setPaymentDueCount] = useState(0);
  const [birthdayCount, setBirthdayCount] = useState(0);

  useEffect(() => {
    if (!fitnessCenterId) return;

    const fetchCounts = async () => {
      try {
        const [paymentData, birthdayData] = await Promise.all([
          fetchPaymentDuePreview(fitnessCenterId, 0, 7),
          fetchBirthdaysToday(fitnessCenterId),
        ]);
        setPaymentDueCount(paymentData.totalMembers || 0);
        setBirthdayCount(birthdayData.totalMembers || 0);
      } catch (err) {
        console.error("Failed to fetch notification counts:", err);
      }
    };

    fetchCounts();
  }, [fitnessCenterId]);

  // Show skeleton while fitness center ID is loading
  if (!fitnessCenterId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-200 rounded w-72" />
            <div className="flex gap-3">
              <div className="h-10 bg-slate-200 rounded-full w-40" />
              <div className="h-10 bg-slate-200 rounded-full w-40" />
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
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
              <Bell className="h-5 w-5 text-violet-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          </div>
          <p className="mt-2 text-slate-500">
            Send payment reminders and birthday wishes to your members.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-3 border-b border-slate-200 pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === "payment-due" ? paymentDueCount : birthdayCount;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                      isActive
                        ? "bg-white text-slate-900"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "payment-due" && (
          <PaymentDueTab fitnessCenterId={fitnessCenterId} />
        )}

        {activeTab === "birthdays" && (
          <BirthdayTab fitnessCenterId={fitnessCenterId} />
        )}
      </div>
    </div>
  );
}
