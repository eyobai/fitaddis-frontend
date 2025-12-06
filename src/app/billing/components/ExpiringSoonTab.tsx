"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchExpiringMembers,
  FitnessCenterExpiringMember,
} from "@/lib/api/fitnessCenterService";
import { formatCurrency, formatDate, ToastMessage } from "../utils/billingUtils";
import { Search, X, Clock, Send } from "lucide-react";
import { BASE_URL } from "@/lib/api/config";
import { sendMemberSms } from "@/lib/api/fitnessCenterService";

interface ExpiringSoonTabProps {
  fitnessCenterId: number | null;
}

export function ExpiringSoonTab({ fitnessCenterId }: ExpiringSoonTabProps) {
  const [expiringMembers, setExpiringMembers] = useState<FitnessCenterExpiringMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalExpiring, setTotalExpiring] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [sendingReminders, setSendingReminders] = useState(false);

  // Payment modal state
  const [selectedMember, setSelectedMember] = useState<FitnessCenterExpiringMember | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<ToastMessage>(null);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return expiringMembers;
    const query = searchQuery.toLowerCase();
    return expiringMembers.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const phone = member.phone_number?.toLowerCase() || "";
      return fullName.includes(query) || phone.includes(query);
    });
  }, [expiringMembers, searchQuery]);

  useEffect(() => {
    if (!fitnessCenterId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchExpiringMembers(fitnessCenterId, 117)
      .then((res) => {
        if (!isMounted) return;
        setExpiringMembers(res.members);
        setTotalExpiring(res.totalMembers);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load expiring members");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId]);

  const getDaysToExpireColor = (days: number) => {
    if (days <= 2) return "border-red-100 bg-red-50 text-red-700";
    if (days <= 5) return "border-amber-100 bg-amber-50 text-amber-700";
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  };

  const toggleMember = (memberId: number) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.member_id)));
    }
  };

  const handleSendReminders = async () => {
    if (selectedMembers.size === 0) return;

    setSendingReminders(true);
    setPaymentMessage(null);

    try {
      const selectedMembersList = expiringMembers.filter((m) =>
        selectedMembers.has(m.member_id)
      );

      let sentCount = 0;
      for (const member of selectedMembersList) {
        const daysToExpire = member.days_until_expiry?.days ?? 0;
        const message = `Dear ${member.first_name}, your membership expires in ${daysToExpire} day${daysToExpire !== 1 ? "s" : ""}. Please renew your membership to continue enjoying our services. Thank you!`;
        await sendMemberSms({
          to: member.phone_number,
          message,
        });
        sentCount++;
      }

      setPaymentMessage({
        type: "success",
        text: `Successfully sent ${sentCount} reminder(s)!`,
      });
      setSelectedMembers(new Set());
    } catch (err) {
      setPaymentMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to send reminders",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  const openPaymentModal = (member: FitnessCenterExpiringMember) => {
    setSelectedMember(member);
    setPaymentAmount(member.last_billing_amount || "");
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

      // Remove the member from the expiring list after successful payment
      setExpiringMembers((prev) =>
        prev.filter((m) => m.member_id !== selectedMember.member_id)
      );
      setTotalExpiring((prev) => prev - 1);

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
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Expiring Soon</h2>
            <p className="text-sm text-slate-500">
              Members whose membership expires within the next 7 days.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedMembers.size > 0 && (
              <>
                <div className="rounded-full bg-violet-50 px-4 py-1 text-sm font-semibold text-violet-600">
                  {selectedMembers.size} selected
                </div>
                <button
                  onClick={handleSendReminders}
                  disabled={sendingReminders}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {sendingReminders ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Reminder ({selectedMembers.size})
                    </>
                  )}
                </button>
              </>
            )}
            <div className="rounded-full bg-amber-50 px-4 py-1 text-sm font-semibold text-amber-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {loading ? "Loading..." : `${totalExpiring} expiring`}
            </div>
          </div>
        </div>
        {/* Search Field */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone number..."
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
            Showing {filteredMembers.length} of {expiringMembers.length} members
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

      {error ? (
        <p className="px-6 py-5 text-sm text-rose-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={filteredMembers.length > 0 && selectedMembers.size === filteredMembers.length}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Billing Date</th>
                <th className="px-6 py-4">Days to Expire</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-slate-500">
                    Loading expiring members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-slate-500">
                    {searchQuery ? "No members match your search" : "No members expiring soon 🎉"}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const fullName = `${member.first_name} ${member.last_name}`;
                  const daysToExpire = member.days_until_expiry?.days ?? 0;
                  const isSelected = selectedMembers.has(member.member_id);
                  return (
                    <tr 
                      key={member.member_id} 
                      className={`hover:bg-slate-50/60 ${isSelected ? "bg-violet-50/50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMember(member.member_id)}
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {fullName}
                        <div className="text-xs font-normal text-slate-400">ID: {member.member_id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{member.phone_number}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          {member.membership_plan_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(Number(member.last_billing_amount))}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {member.last_billing_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(member.last_billing_date)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${getDaysToExpireColor(daysToExpire)}`}>
                          {daysToExpire} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openPaymentModal(member)}
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
                        >
                          Renew
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Renew membership</h3>
            <p className="mt-1 text-sm text-slate-500">Confirm the renewal payment details.</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Member</p>
                <p className="text-base font-semibold text-slate-900">
                  {selectedMember.first_name} {selectedMember.last_name}
                </p>
                <p className="text-sm text-slate-500">{selectedMember.phone_number}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Plan</p>
                <p className="text-sm text-slate-700">{selectedMember.membership_plan_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Expires in</p>
                <p className="text-sm text-amber-600 font-medium">{selectedMember.days_until_expiry?.days ?? 0} days</p>
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
    </section>
  );
}
