"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchOverdueMembersByInterval,
  fetchExpiringMembers,
  sendBulkSms,
  sendMemberSms,
  FitnessCenterOverdueMember,
  FitnessCenterExpiringMember,
} from "@/lib/api/fitnessCenterService";
import {
  getDefaultRange,
  formatCurrency,
  formatDate,
  normalizePhoneNumber,
  DateRange,
  ToastMessage,
} from "../utils/billingUtils";
import {
  MessageSquare,
  Send,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

const MESSAGE_MEMBER_TABS = [
  { id: "overdue", label: "Overdue Members", icon: AlertTriangle, description: "Members with pending payments" },
  { id: "comingSoon", label: "Expiring Soon", icon: Clock, description: "Memberships expiring soon" },
] as const;

type MessageMemberTabId = (typeof MESSAGE_MEMBER_TABS)[number]["id"];

interface MessageMembersTabProps {
  fitnessCenterId: number | null;
}

export function MessageMembersTab({ fitnessCenterId }: MessageMembersTabProps) {
  // Overdue members state
  const [messagePendingRange, setMessagePendingRange] = useState<DateRange>(() => getDefaultRange());
  const [messageAppliedRange, setMessageAppliedRange] = useState<DateRange>(() => getDefaultRange());
  const [messageMembers, setMessageMembers] = useState<FitnessCenterOverdueMember[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Expiring members state
  const [expiringDaysInput, setExpiringDaysInput] = useState("7");
  const [expiringDaysApplied, setExpiringDaysApplied] = useState<number | null>(null);
  const [expiringMembers, setExpiringMembers] = useState<FitnessCenterExpiringMember[]>([]);
  const [expiringLoading, setExpiringLoading] = useState(false);
  const [expiringError, setExpiringError] = useState<string | null>(null);

  // Shared state
  const [selectedMessageMemberIds, setSelectedMessageMemberIds] = useState<number[]>([]);
  const [messageBody, setMessageBody] = useState(
    "Hi there! Your Fit Addis subscription payment is overdue. Please renew to keep enjoying your workouts.",
  );
  const [expiringMessageBody, setExpiringMessageBody] = useState(
    "Hi there! Your Fit Addis membership is expiring soon. Please renew to continue enjoying your workouts.",
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

  // Fetch expiring members when days are applied
  useEffect(() => {
    if (!fitnessCenterId || expiringDaysApplied === null) return;

    let isMounted = true;
    setExpiringLoading(true);
    setExpiringError(null);

    fetchExpiringMembers(fitnessCenterId, expiringDaysApplied)
      .then((res) => {
        if (!isMounted) return;
        setExpiringMembers(res.members);
        setSelectedMessageMemberIds([]);
      })
      .catch(() => {
        if (!isMounted) return;
        setExpiringError("Unable to load expiring members");
      })
      .finally(() => {
        if (!isMounted) return;
        setExpiringLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fitnessCenterId, expiringDaysApplied]);

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

  const handleApplyExpiringDays = () => {
    const days = parseInt(expiringDaysInput, 10);
    if (isNaN(days) || days < 1) {
      setExpiringError("Please enter a valid number of days (minimum 1)");
      return;
    }
    setExpiringError(null);
    setExpiringDaysApplied(days);
  };

  const visibleMessageMembers = useMemo(() => {
    if (activeMessageTab === "overdue") {
      return messageMembers;
    }
    return [];
  }, [activeMessageTab, messageMembers]);

  const visibleSelectedCount = useMemo(() => {
    return visibleMessageMembers.filter((member) =>
      selectedMessageMemberIds.includes(member.member_id),
    ).length;
  }, [selectedMessageMemberIds, visibleMessageMembers]);

  const expiringSelectedCount = useMemo(() => {
    return expiringMembers.filter((member) =>
      selectedMessageMemberIds.includes(member.member_id),
    ).length;
  }, [selectedMessageMemberIds, expiringMembers]);

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

  const toggleSelectAllExpiring = () => {
    if (expiringMembers.length === 0) return;

    const targetIds = expiringMembers.map((member) => member.member_id);
    const allSelected = targetIds.every((id) => selectedMessageMemberIds.includes(id));

    if (allSelected) {
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

  const handleSendExpiringMemberMessage = async (member: FitnessCenterExpiringMember) => {
    if (!expiringMessageBody.trim()) {
      setMessageToast({ type: "error", text: "Message body cannot be empty" });
      return;
    }

    setMessageToast(null);
    setSendingMemberId(member.member_id);
    try {
      await sendMemberSms({
        to: normalizePhoneNumber(member.phone_number),
        message: expiringMessageBody,
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

  const handleSendBulkExpiringMessage = async () => {
    if (selectedMessageMemberIds.length === 0) {
      setMessageToast({ type: "error", text: "Select at least one member" });
      return;
    }

    if (!expiringMessageBody.trim()) {
      setMessageToast({ type: "error", text: "Message body cannot be empty" });
      return;
    }

    const recipients = expiringMembers
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
        message: expiringMessageBody,
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
    <section className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">SMS Reminders</h2>
                <p className="text-violet-200 text-sm">Send payment reminders to your members</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {activeMessageTab === "overdue" ? messageMembers.length : expiringMembers.length}
            </div>
            <div className="text-violet-200 text-sm">Members loaded</div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-3">
        {MESSAGE_MEMBER_TABS.map((tab) => {
          const isActive = tab.id === activeMessageTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMessageTab(tab.id);
                setSelectedMessageMemberIds([]);
              }}
              className={`flex-1 flex items-center gap-3 rounded-xl p-4 transition-all ${
                isActive
                  ? "bg-white border-2 border-violet-500 shadow-md"
                  : "bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isActive ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-500"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className={`font-semibold ${isActive ? "text-violet-700" : "text-slate-700"}`}>
                  {tab.label}
                </div>
                <div className="text-xs text-slate-500">{tab.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Compose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filter Card */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Filter className="h-4 w-4" />
              Filter Members
            </div>
          </div>
          <div className="p-4 space-y-4">
            {activeMessageTab === "overdue" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        value={messagePendingRange.start}
                        onChange={(e) => setMessagePendingRange((prev) => ({ ...prev, start: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        value={messagePendingRange.end}
                        onChange={(e) => setMessagePendingRange((prev) => ({ ...prev, end: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleApplyMessageRange}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Load Members
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Days Until Expiry</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      value={expiringDaysInput}
                      onChange={(e) => setExpiringDaysInput(e.target.value)}
                      placeholder="e.g., 7"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>
                <button
                  onClick={handleApplyExpiringDays}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Load Expiring Members
                </button>
              </>
            )}

            {(messageError || expiringError) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{messageError || expiringError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Composer Card */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare className="h-4 w-4" />
              Compose Message
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Recipients</label>
              {selectedMessageMemberIds.length > 0 ? (
                <div className="w-full p-2.5 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium text-violet-700">
                      {selectedMessageMemberIds.length} selected
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedMessageMemberIds([])}
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <span className="text-sm text-slate-500">No members selected</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
              <textarea
                value={activeMessageTab === "overdue" ? messageBody : expiringMessageBody}
                onChange={(e) => activeMessageTab === "overdue" ? setMessageBody(e.target.value) : setExpiringMessageBody(e.target.value)}
                rows={3}
                placeholder="Type your reminder message..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-400">
                  {(activeMessageTab === "overdue" ? messageBody : expiringMessageBody).length} characters
                </p>
                {/* Toast Message inline */}
                {messageToast && (
                  <div className={`flex items-center gap-1.5 ${
                    messageToast.type === "success" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {messageToast.type === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    <p className="text-xs font-medium">{messageToast.text}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={activeMessageTab === "overdue" ? handleSendBulkMessage : handleSendBulkExpiringMessage}
              disabled={sendingBulk || selectedMessageMemberIds.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              {sendingBulk ? "Sending..." : `Send to ${selectedMessageMemberIds.length || "Selected"} Members`}
            </button>
          </div>
        </div>
      </div>

      {/* Members Table - Full Width Below */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="h-4 w-4" />
                {activeMessageTab === "overdue" ? "Overdue Members" : "Expiring Members"}
              </div>
              {((activeMessageTab === "overdue" && visibleMessageMembers.length > 0) ||
                (activeMessageTab === "comingSoon" && expiringMembers.length > 0)) && (
                <button
                  onClick={activeMessageTab === "overdue" ? toggleSelectAllMessages : toggleSelectAllExpiring}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  {(activeMessageTab === "overdue"
                    ? visibleMessageMembers.every((m) => selectedMessageMemberIds.includes(m.member_id))
                    : expiringMembers.every((m) => selectedMessageMemberIds.includes(m.member_id)))
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              {activeMessageTab === "overdue" ? (
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={visibleMessageMembers.length > 0 && visibleMessageMembers.every((m) => selectedMessageMemberIds.includes(m.member_id))}
                          onChange={toggleSelectAllMessages}
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                      </th>
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Overdue</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {messageLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                            <p className="text-sm text-slate-500">Loading members...</p>
                          </div>
                        </td>
                      </tr>
                    ) : visibleMessageMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-10 w-10 text-slate-300" />
                            <p className="text-sm text-slate-500">No overdue members found</p>
                            <p className="text-xs text-slate-400">Try adjusting your date range</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibleMessageMembers.map((member) => (
                        <tr
                          key={`message-${member.billing_id}-${member.member_id}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            selectedMessageMemberIds.includes(member.member_id) ? "bg-violet-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedMessageMemberIds.includes(member.member_id)}
                              onChange={() => toggleMessageSelection(member.member_id)}
                              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                                {member.first_name[0]}{member.last_name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{member.first_name} {member.last_name}</p>
                                <p className="text-xs text-slate-500">{member.phone_number}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-900">{formatCurrency(Number(member.amount))}</span>
                            <p className="text-xs text-slate-500">{formatDate(member.billing_date)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              (member.days_overdue ?? 0) > 30
                                ? "bg-red-100 text-red-700"
                                : (member.days_overdue ?? 0) > 14
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {member.days_overdue ?? 0}d
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleSendMemberMessage(member)}
                              disabled={sendingMemberId === member.member_id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="h-3 w-3" />
                              {sendingMemberId === member.member_id ? "Sending..." : "Send"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={expiringMembers.length > 0 && expiringMembers.every((m) => selectedMessageMemberIds.includes(m.member_id))}
                          onChange={toggleSelectAllExpiring}
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                      </th>
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Expires In</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expiringLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                            <p className="text-sm text-slate-500">Loading members...</p>
                          </div>
                        </td>
                      </tr>
                    ) : expiringDaysApplied === null ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Clock className="h-10 w-10 text-slate-300" />
                            <p className="text-sm text-slate-500">Enter days and load members</p>
                            <p className="text-xs text-slate-400">Set how many days until expiry to filter</p>
                          </div>
                        </td>
                      </tr>
                    ) : expiringMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                            <p className="text-sm text-slate-500">No expiring members</p>
                            <p className="text-xs text-slate-400">No memberships expiring within {expiringDaysApplied} days</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      expiringMembers.map((member) => (
                        <tr
                          key={`expiring-${member.member_id}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            selectedMessageMemberIds.includes(member.member_id) ? "bg-violet-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedMessageMemberIds.includes(member.member_id)}
                              onChange={() => toggleMessageSelection(member.member_id)}
                              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                                {member.first_name[0]}{member.last_name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{member.first_name} {member.last_name}</p>
                                <p className="text-xs text-slate-500">{member.phone_number}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {member.membership_plan_name}
                            </span>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(member.expiry_date)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              (member.days_until_expiry?.days ?? 0) <= 3
                                ? "bg-red-100 text-red-700"
                                : (member.days_until_expiry?.days ?? 0) <= 7
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {member.days_until_expiry?.days ?? "N/A"}d
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleSendExpiringMemberMessage(member)}
                              disabled={sendingMemberId === member.member_id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="h-3 w-3" />
                              {sendingMemberId === member.member_id ? "Sending..." : "Send"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
        </div>
      </div>
    </section>
  );
}
