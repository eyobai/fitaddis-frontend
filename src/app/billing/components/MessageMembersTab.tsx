"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchOverdueMembersByInterval,
  sendBulkSms,
  sendMemberSms,
  FitnessCenterOverdueMember,
} from "@/lib/api/fitnessCenterService";
import {
  getDefaultRange,
  formatCurrency,
  formatDate,
  normalizePhoneNumber,
  DateRange,
  ToastMessage,
} from "../utils/billingUtils";

const MESSAGE_MEMBER_TABS = [
  { id: "overdue", label: "Overdue Members" },
  { id: "comingSoon", label: "Coming Soon Expire" },
] as const;

type MessageMemberTabId = (typeof MESSAGE_MEMBER_TABS)[number]["id"];

const COMING_SOON_WINDOW_DAYS = 7;

interface MessageMembersTabProps {
  fitnessCenterId: number | null;
}

export function MessageMembersTab({ fitnessCenterId }: MessageMembersTabProps) {
  const [messagePendingRange, setMessagePendingRange] = useState<DateRange>(() => getDefaultRange());
  const [messageAppliedRange, setMessageAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [messageMembers, setMessageMembers] = useState<FitnessCenterOverdueMember[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [selectedMessageMemberIds, setSelectedMessageMemberIds] = useState<number[]>([]);
  const [messageBody, setMessageBody] = useState(
    "Hi there! Your Fit Addis subscription payment is overdue. Please renew to keep enjoying your workouts.",
  );
  const [messageToast, setMessageToast] = useState<ToastMessage>(null);
  const [sendingMemberId, setSendingMemberId] = useState<number | null>(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [activeMessageTab, setActiveMessageTab] = useState<MessageMemberTabId>("overdue");

  useEffect(() => {
    if (!fitnessCenterId) return;
    const { start, end } = messageAppliedRange;
    if (!start || !end) return;

    let isMounted = true;
    setMessageLoading(true);
    setMessageError(null);

    fetchOverdueMembersByInterval(fitnessCenterId, start, end)
      .then((res) => {
        if (!isMounted) return;
        setMessageMembers(res.members);
        setSelectedMessageMemberIds([]);
      })
      .catch(() => {
        if (!isMounted) return;
        setMessageError("Unable to load members for the selected window");
      })
      .finally(() => {
        if (!isMounted) return;
        setMessageLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId, messageAppliedRange]);

  const handleApplyMessageRange = () => {
    if (!messagePendingRange.start || !messagePendingRange.end) {
      setMessageError("Both dates are required");
      return;
    }

    if (new Date(messagePendingRange.start) > new Date(messagePendingRange.end)) {
      setMessageError("Start date cannot be after end date");
      return;
    }

    setMessageError(null);
    setMessageAppliedRange({ ...messagePendingRange });
  };

  const partitionedMessageMembers = useMemo(() => {
    const now = new Date();
    const soonThreshold = new Date(now);
    soonThreshold.setDate(now.getDate() + COMING_SOON_WINDOW_DAYS);

    const overdue = messageMembers.filter((member) => new Date(member.billing_date) < now);
    const comingSoon = messageMembers.filter((member) => {
      const billingDate = new Date(member.billing_date);
      return billingDate >= now && billingDate <= soonThreshold;
    });

    return { overdue, comingSoon };
  }, [messageMembers]);

  const visibleMessageMembers = useMemo(() => {
    return activeMessageTab === "overdue"
      ? partitionedMessageMembers.overdue
      : partitionedMessageMembers.comingSoon;
  }, [activeMessageTab, partitionedMessageMembers]);

  const visibleSelectedCount = useMemo(() => {
    return visibleMessageMembers.filter((member) =>
      selectedMessageMemberIds.includes(member.member_id),
    ).length;
  }, [selectedMessageMemberIds, visibleMessageMembers]);

  const toggleMessageSelection = (memberId: number) => {
    setSelectedMessageMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const toggleSelectAllMessages = () => {
    const targetMembers = visibleMessageMembers;
    if (targetMembers.length === 0) {
      return;
    }

    const targetIds = targetMembers.map((member) => member.member_id);
    const allVisibleSelected = targetIds.every((id) => selectedMessageMemberIds.includes(id));

    if (allVisibleSelected) {
      setSelectedMessageMemberIds((prev) => prev.filter((id) => !targetIds.includes(id)));
    } else {
      setSelectedMessageMemberIds((prev) => Array.from(new Set([...prev, ...targetIds])));
    }
  };

  const handleSendMemberMessage = async (member: FitnessCenterOverdueMember) => {
    if (!messageBody.trim()) {
      setMessageToast({ type: "error", text: "Message body cannot be empty" });
      return;
    }

    setMessageToast(null);
    setSendingMemberId(member.member_id);
    try {
      await sendMemberSms({
        to: normalizePhoneNumber(member.phone_number),
        message: messageBody,
      });
      setMessageToast({
        type: "success",
        text: `Reminder sent to ${member.first_name} ${member.last_name}`,
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to send SMS";
      setMessageToast({ type: "error", text });
    } finally {
      setSendingMemberId(null);
    }
  };

  const handleSendBulkMessage = async () => {
    if (selectedMessageMemberIds.length === 0) {
      setMessageToast({ type: "error", text: "Select at least one member" });
      return;
    }

    if (!messageBody.trim()) {
      setMessageToast({ type: "error", text: "Message body cannot be empty" });
      return;
    }

    const recipients = messageMembers
      .filter((member) => selectedMessageMemberIds.includes(member.member_id))
      .map((member) => normalizePhoneNumber(member.phone_number))
      .filter(Boolean) as string[];

    if (recipients.length === 0) {
      setMessageToast({ type: "error", text: "Selected members have no valid phone numbers" });
      return;
    }

    setMessageToast(null);
    setSendingBulk(true);
    try {
      await sendBulkSms({
        recipients,
        message: messageBody,
      });
      setMessageToast({
        type: "success",
        text: `Reminder sent to ${recipients.length} member(s)`,
      });
      setSelectedMessageMemberIds([]);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to send bulk SMS";
      setMessageToast({ type: "error", text });
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">Send Reminders</h2>
        <p className="text-sm text-slate-500">
          Filter members by date range and send SMS reminders individually or in bulk.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MESSAGE_MEMBER_TABS.map((tab) => {
            const isActive = tab.id === activeMessageTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMessageTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col text-sm font-medium text-slate-600">
            Start date
            <input
              type="date"
              value={messagePendingRange.start}
              onChange={(e) =>
                setMessagePendingRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-600">
            End date
            <input
              type="date"
              value={messagePendingRange.end}
              onChange={(e) =>
                setMessagePendingRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={handleApplyMessageRange}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
            >
              Load members
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">Message</label>
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="Type the reminder you want to send..."
          />
          <p className="mt-1 text-xs text-slate-400">This text is used for both single and bulk messages.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {visibleSelectedCount} selected in this tab
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSendBulkMessage}
              disabled={sendingBulk || selectedMessageMemberIds.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {sendingBulk ? "Sending..." : "Send bulk message"}
            </button>
            <button
              onClick={() => setSelectedMessageMemberIds([])}
              disabled={selectedMessageMemberIds.length === 0}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
            >
              Clear selection
            </button>
          </div>
        </div>

        {messageToast && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              messageToast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {messageToast.text}
          </div>
        )}

        {activeMessageTab === "comingSoon" && (
          <p className="text-sm text-slate-500">
            Showing members whose billing date is within the next {COMING_SOON_WINDOW_DAYS} days.
            Adjust the date range to widen the search window.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={
                      visibleMessageMembers.length > 0 &&
                      visibleMessageMembers.every((member) =>
                        selectedMessageMemberIds.includes(member.member_id),
                      )
                    }
                    onChange={toggleSelectAllMessages}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                </th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Billing date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {messageLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">
                    Loading members...
                  </td>
                </tr>
              ) : messageError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-rose-600">
                    {messageError}
                  </td>
                </tr>
              ) : visibleMessageMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">
                    {activeMessageTab === "comingSoon"
                      ? "No members are nearing expiry within this window"
                      : "No overdue members for this range"}
                  </td>
                </tr>
              ) : (
                visibleMessageMembers.map((member) => (
                  <tr key={`message-${member.billing_id}-${member.member_id}`} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMessageMemberIds.includes(member.member_id)}
                        onChange={() => toggleMessageSelection(member.member_id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {member.first_name} {member.last_name}
                      <div className="text-xs font-normal text-slate-400">ID: {member.member_id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{member.phone_number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatCurrency(Number(member.amount))}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(member.billing_date)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSendMemberMessage(member)}
                        disabled={sendingMemberId === member.member_id}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        {sendingMemberId === member.member_id ? "Sending..." : "Send SMS"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
