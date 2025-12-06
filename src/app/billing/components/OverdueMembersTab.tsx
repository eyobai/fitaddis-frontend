"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  fetchFitnessCenterOverdueMembers,
  FitnessCenterOverdueMember,
} from "@/lib/api/fitnessCenterService";
import { formatCurrency, formatDate, ToastMessage } from "../utils/billingUtils";
import { PaymentConfirmModal } from "./PaymentConfirmModal";
import { Search, X, Send } from "lucide-react";
import { sendOverdueSms, fetchOverdueMembers } from "@/lib/api/sms";

interface OverdueMembersTabProps {
  fitnessCenterId: number | null;
}

export function OverdueMembersTab({ fitnessCenterId }: OverdueMembersTabProps) {
  const [overdueMembers, setOverdueMembers] = useState<FitnessCenterOverdueMember[]>([]);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [overdueError, setOverdueError] = useState<string | null>(null);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [payingMemberId, setPayingMemberId] = useState<number | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<ToastMessage>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FitnessCenterOverdueMember | null>(null);
  const [editableAmount, setEditableAmount] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [sendingReminders, setSendingReminders] = useState(false);
  const [smsContactStatus, setSmsContactStatus] = useState<Map<number, boolean>>(new Map());

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return overdueMembers;
    const query = searchQuery.toLowerCase();
    return overdueMembers.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const phone = member.phone_number?.toLowerCase() || "";
      return fullName.includes(query) || phone.includes(query);
    });
  }, [overdueMembers, searchQuery]);

  // Members who can be selected (not contacted today)
  const selectableMembers = useMemo(() => {
    return filteredMembers.filter(
      (m) => !(smsContactStatus.get(m.member_id) ?? false)
    );
  }, [filteredMembers, smsContactStatus]);

  useEffect(() => {
    if (!fitnessCenterId) return;

    let isMounted = true;
    setOverdueLoading(true);
    setOverdueError(null);

    fetchFitnessCenterOverdueMembers(fitnessCenterId)
      .then((res) => {
        if (!isMounted) return;
        setOverdueMembers(res.members);
        setTotalOverdue(res.totalOverdueMembers);
      })
      .catch(() => {
        if (!isMounted) return;
        setOverdueError("Unable to load overdue members");
      })
      .finally(() => {
        if (!isMounted) return;
        setOverdueLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId]);

  const openConfirmModal = (member: FitnessCenterOverdueMember) => {
    setSelectedMember(member);
    setEditableAmount(String(member.amount));
    setShowConfirmModal(true);
  };

  const handlePayNow = async (
    member: FitnessCenterOverdueMember,
    overrideAmount?: string,
  ) => {
    setPaymentMessage(null);
    setPayingMemberId(member.member_id);

    try {
      const payload = {
        memberId: member.member_id,
        amount: Number(overrideAmount ?? member.amount),
        status: "paid" as const,
      };

      const res = await fetch("http://localhost:3000/make-payment", {
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
        text: `Payment sent for ${member.first_name} ${member.last_name}`,
      });

      setOverdueMembers((prev) =>
        prev.map((item) =>
          item.member_id === member.member_id
            ? { ...item, status: "paid" }
            : item,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to submit payment";
      setPaymentMessage({ type: "error", text: message });
    } finally {
      setPayingMemberId(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedMember) return;
    await handlePayNow(selectedMember, editableAmount);
    setShowConfirmModal(false);
    setSelectedMember(null);
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
    if (selectedMembers.size === selectableMembers.length && selectableMembers.length > 0) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(selectableMembers.map((m) => m.member_id)));
    }
  };

  const loadSmsContactStatus = useCallback(async () => {
    if (!fitnessCenterId) return;
    try {
      const data = await fetchOverdueMembers(fitnessCenterId);
      const statusMap = new Map<number, boolean>();
      data.members.forEach((m) => {
        statusMap.set(m.memberId, m.contactedToday);
      });
      setSmsContactStatus(statusMap);
    } catch {
      // Silently fail - contact status is optional
    }
  }, [fitnessCenterId]);

  useEffect(() => {
    loadSmsContactStatus();
  }, [loadSmsContactStatus]);

  const handleSendReminders = async () => {
    if (selectedMembers.size === 0 || !fitnessCenterId) return;

    setSendingReminders(true);
    setPaymentMessage(null);

    try {
      let sentCount = 0;
      for (const memberId of selectedMembers) {
        await sendOverdueSms(fitnessCenterId, memberId);
        sentCount++;
      }

      setPaymentMessage({
        type: "success",
        text: `Successfully sent ${sentCount} payment reminder(s)!`,
      });
      setSelectedMembers(new Set());
      // Refresh contact status
      await loadSmsContactStatus();
    } catch (err) {
      setPaymentMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to send reminders",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Overdue Members</h2>
              <p className="text-sm text-slate-500">
                Members with pending invoices and their latest billing details.
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
              <div className="rounded-full bg-red-50 px-4 py-1 text-sm font-semibold text-red-600">
                {overdueLoading ? "Loading..." : `${totalOverdue} overdue`}
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
              Showing {filteredMembers.length} of {overdueMembers.length} members
            </p>
          )}
        </div>

        {overdueError ? (
          <p className="px-6 py-5 text-sm text-rose-600">{overdueError}</p>
        ) : (
          <div>
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
            <table className="w-full divide-y divide-slate-100 table-fixed">
              <thead>
                <tr className="bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectableMembers.length > 0 && selectedMembers.size === selectableMembers.length}
                      disabled={selectableMembers.length === 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </th>
                  <th className="px-3 py-3">Member</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Billing Date</th>
                  <th className="px-3 py-3">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {overdueLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-slate-500">
                      Loading overdue members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-slate-500">
                      {searchQuery ? "No members match your search" : "No overdue members 🎉"}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const fullName = `${member.first_name} ${member.last_name}`;
                    const isSelected = selectedMembers.has(member.member_id);
                    const wasContactedToday = smsContactStatus.get(member.member_id) ?? false;
                    return (
                      <tr 
                        key={`${member.billing_id}-${member.member_id}`} 
                        className={`hover:bg-slate-50/60 ${isSelected ? "bg-violet-50/50" : ""}`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={wasContactedToday}
                            onChange={() => toggleMember(member.member_id)}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="truncate">{fullName}</span>
                            {wasContactedToday && (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                                Contacted
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-normal text-slate-400">ID: {member.member_id}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-600 truncate">{member.phone_number}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 truncate max-w-full">
                            {member.membership_plan_name}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">
                          {formatCurrency(Number(member.amount))}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-semibold capitalize text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatDate(member.billing_date)}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            member.days_overdue > 30
                              ? "border border-red-100 bg-red-50 text-red-700"
                              : member.days_overdue > 14
                              ? "border border-amber-100 bg-amber-50 text-amber-700"
                              : "border border-slate-100 bg-slate-50 text-slate-700"
                          }`}>
                            {member.days_overdue}d
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showConfirmModal && selectedMember && (
        <PaymentConfirmModal
          selectedMember={selectedMember}
          editableAmount={editableAmount}
          setEditableAmount={setEditableAmount}
          onConfirm={handleConfirmPayment}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedMember(null);
          }}
          isProcessing={payingMemberId === selectedMember.member_id}
        />
      )}

    </>
  );
}
