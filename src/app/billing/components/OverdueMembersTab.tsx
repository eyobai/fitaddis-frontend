"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchFitnessCenterOverdueMembers,
  FitnessCenterOverdueMember,
} from "@/lib/api/fitnessCenterService";
import { formatCurrency, formatDate, ToastMessage } from "../utils/billingUtils";
import { PaymentConfirmModal } from "./PaymentConfirmModal";
import { Search, X } from "lucide-react";

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
            <div className="rounded-full bg-red-50 px-4 py-1 text-sm font-semibold text-red-600">
              {overdueLoading ? "Loading..." : `${totalOverdue} overdue`}
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
          <div className="overflow-x-auto">
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
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Billing date</th>
                  <th className="px-6 py-4">Days Passed</th>
                  <th className="px-6 py-4 text-center">Actions</th>
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
                    return (
                      <tr key={`${member.billing_id}-${member.member_id}`} className="hover:bg-slate-50/60">
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
                          {formatCurrency(Number(member.amount))}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(member.billing_date)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            member.days_overdue > 30
                              ? "border border-red-100 bg-red-50 text-red-700"
                              : member.days_overdue > 14
                              ? "border border-amber-100 bg-amber-50 text-amber-700"
                              : "border border-slate-100 bg-slate-50 text-slate-700"
                          }`}>
                            {member.days_overdue} days
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openConfirmModal(member)}
                            disabled={payingMemberId === member.member_id}
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {payingMemberId === member.member_id ? "Processing..." : "Pay now"}
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
