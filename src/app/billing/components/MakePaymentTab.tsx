"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchFitnessCenterMembers,
  FitnessCenterMember,
} from "@/lib/api/fitnessCenterService";
import { formatCurrency, formatDate, ToastMessage } from "../utils/billingUtils";
import { Search, X, User, CreditCard } from "lucide-react";
import { BASE_URL } from "@/lib/api/config";

interface MakePaymentTabProps {
  fitnessCenterId: number | null;
}

export function MakePaymentTab({ fitnessCenterId }: MakePaymentTabProps) {
  const [allMembers, setAllMembers] = useState<FitnessCenterMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Payment modal state
  const [selectedMember, setSelectedMember] = useState<FitnessCenterMember | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<ToastMessage>(null);

  // Fetch all members on mount
  useEffect(() => {
    if (!fitnessCenterId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchFitnessCenterMembers(fitnessCenterId)
      .then((res) => {
        if (!isMounted) return;
        setAllMembers(res.members);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load members");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allMembers;
    const query = searchQuery.toLowerCase();
    return allMembers.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const phone = member.phone_number?.toLowerCase() || "";
      const checkInCode = member.check_in_code?.toLowerCase() || "";
      return fullName.includes(query) || phone.includes(query) || checkInCode.includes(query);
    });
  }, [allMembers, searchQuery]);

  const openPaymentModal = (member: FitnessCenterMember) => {
    setSelectedMember(member);
    setPaymentAmount(member.membership_price || "");
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedMember) return;

    setProcessing(true);
    setPaymentMessage(null);

    try {
      const payload = {
        memberId: selectedMember.member_id,
        amount: Number(paymentAmount),
        status: "paid" as const,
      };

      const res = await fetch(`${BASE_URL}/make-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Payment request failed");
      }

      setPaymentMessage({
        type: "success",
        text: `Payment of ${formatCurrency(Number(paymentAmount))} recorded for ${selectedMember.first_name} ${selectedMember.last_name}`,
      });

      // Update the member in the list
      setAllMembers((prev) =>
        prev.map((m) =>
          m.member_id === selectedMember.member_id
            ? { ...m, latest_billing_status: "paid", latest_billing_amount: paymentAmount }
            : m
        )
      );

      setShowPaymentModal(false);
      setSelectedMember(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to process payment";
      setPaymentMessage({ type: "error", text: message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Make Payment</h2>
              <p className="text-sm text-slate-500">
                Search for a member by name, phone, or check-in code to record a payment.
              </p>
            </div>
            <div className="rounded-full bg-violet-50 px-4 py-1 text-sm font-semibold text-violet-600 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {loading ? "Loading..." : `${allMembers.length} members`}
            </div>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or check-in code..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-500">
              Showing {filteredMembers.length} of {allMembers.length} members
            </p>
          )}
        </div>

        {/* Payment Message */}
        {paymentMessage && (
          <div
            className={`mx-6 my-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              paymentMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {paymentMessage.text}
          </div>
        )}

        {error && (
          <p className="px-6 py-5 text-sm text-rose-600">{error}</p>
        )}

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Last Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      {searchQuery ? `No members found matching "${searchQuery}"` : "No members found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const fullName = `${member.first_name} ${member.last_name}`;
                  const status = member.latest_billing_status || "N/A";
                  
                  return (
                    <tr key={member.member_id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </div>
                          <div>
                            {fullName}
                            <div className="text-xs font-normal text-slate-400">Code: {member.check_in_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{member.phone_number}</td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                            {member.membership_name}
                          </span>
                          <div className="text-xs text-slate-400 mt-1">{formatCurrency(Number(member.membership_price))}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {member.latest_billing_amount ? (
                          <div>
                            <span className="font-semibold text-slate-900">{formatCurrency(Number(member.latest_billing_amount))}</span>
                            {member.latest_billing_date && (
                              <div className="text-xs text-slate-400">{formatDate(member.latest_billing_date)}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">No payments</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          status === "paid"
                            ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                            : status === "pending" || status === "overdue"
                            ? "border border-amber-100 bg-amber-50 text-amber-700"
                            : "border border-slate-100 bg-slate-50 text-slate-700"
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${
                            status === "paid" ? "bg-emerald-500" : status === "pending" || status === "overdue" ? "bg-amber-500" : "bg-slate-400"
                          }`} />
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openPaymentModal(member)}
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
                        >
                          {status === "paid" ? "Renew" : "Pay now"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {selectedMember.latest_billing_status === "paid" ? "Renew membership" : "Confirm payment"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedMember.latest_billing_status === "paid" 
                ? "Extend the membership by recording an early payment."
                : "Review the details before submitting."}
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Member</p>
                <p className="text-base font-semibold text-slate-900">
                  {selectedMember.first_name} {selectedMember.last_name}
                </p>
                <p className="text-sm text-slate-500">{selectedMember.phone_number}</p>
              </div>
              <label className="flex flex-col text-sm font-medium text-slate-600">
                Amount (ETB)
                <input
                  type="number"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedMember(null);
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processing || !paymentAmount}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {processing ? "Processing..." : "Confirm & pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
