"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchBirthdaysToday,
  BirthdayMember,
} from "@/lib/api/fitnessCenterService";
import { fetchBirthdayMembersSms, sendBirthdaySms } from "@/lib/api/sms";
import {
  Cake,
  Send,
  Phone,
  AlertCircle,
  CheckCircle,
  Gift,
  PartyPopper,
  MessageSquare,
  RotateCcw,
} from "lucide-react";

interface BirthdayTabProps {
  fitnessCenterId: number | null;
}

const DEFAULT_MESSAGE = "Happy Birthday, {firstName}! 🎂 Wishing you a fantastic day filled with joy and happiness. Thank you for being a valued member of our fitness family!";

export function BirthdayTab({ fitnessCenterId }: BirthdayTabProps) {
  const [todayMembers, setTodayMembers] = useState<BirthdayMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState("");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [smsContactStatus, setSmsContactStatus] = useState<Map<number, boolean>>(new Map());

  // Members who can be selected (not contacted today)
  const selectableMembers = useMemo(() => {
    return todayMembers.filter(
      (m) => !(smsContactStatus.get(m.memberId) ?? false)
    );
  }, [todayMembers, smsContactStatus]);

  const loadSmsContactStatus = useCallback(async () => {
    if (!fitnessCenterId) return;
    try {
      const data = await fetchBirthdayMembersSms(fitnessCenterId);
      const statusMap = new Map<number, boolean>();
      data.members.forEach((m) => {
        statusMap.set(m.memberId, m.contactedToday);
      });
      setSmsContactStatus(statusMap);
    } catch {
      // Silently fail - contact status is optional
    }
  }, [fitnessCenterId]);

  const loadData = async () => {
    if (!fitnessCenterId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const todayData = await fetchBirthdaysToday(fitnessCenterId);
      setTodayMembers(todayData.members);
      setTodayDate(todayData.date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load birthday data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadSmsContactStatus();
  }, [fitnessCenterId, loadSmsContactStatus]);

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
      setSelectedMembers(new Set(selectableMembers.map((m) => m.memberId)));
    }
  };

  const handleSendBirthdayWishes = async () => {
    if (!fitnessCenterId || selectedMembers.size === 0) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      let sentCount = 0;
      for (const memberId of selectedMembers) {
        await sendBirthdaySms(fitnessCenterId, memberId);
        sentCount++;
      }
      setSuccess(`Successfully sent ${sentCount} birthday wish(es)!`);
      setSelectedMembers(new Set());
      await loadSmsContactStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send birthday wishes");
    } finally {
      setSending(false);
    }
  };

  const handleResetMessage = () => {
    setMessage(DEFAULT_MESSAGE);
  };

  const getPreviewMessage = (member: BirthdayMember) => {
    return message.replace(/{firstName}/g, member.firstName).replace(/{lastName}/g, member.lastName);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="space-y-6">
      {/* Today's Birthdays Banner */}
      <div className={`rounded-2xl p-6 shadow-lg ${
        todayMembers.length > 0 
          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white" 
          : "bg-white border border-slate-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
              todayMembers.length > 0 ? "bg-white/20" : "bg-pink-100"
            }`}>
              {todayMembers.length > 0 ? (
                <PartyPopper className="h-7 w-7 text-white" />
              ) : (
                <Cake className="h-7 w-7 text-pink-500" />
              )}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${todayMembers.length > 0 ? "text-white" : "text-slate-900"}`}>
                {todayMembers.length > 0 
                  ? `${todayMembers.length} Birthday${todayMembers.length !== 1 ? "s" : ""} Today!`
                  : "No Birthdays Today"
                }
              </h2>
              <p className={todayMembers.length > 0 ? "text-pink-100" : "text-slate-500"}>
                {todayDate ? formatDate(todayDate) : "Loading..."}
              </p>
            </div>
          </div>
          {todayMembers.length > 0 && (
            <div className="flex items-center gap-3">
              {selectableMembers.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors"
                >
                  {selectedMembers.size === selectableMembers.length ? "Deselect All" : "Select All"}
                </button>
              )}
              <button
                onClick={handleSendBirthdayWishes}
                disabled={sending || selectedMembers.size === 0}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-pink-600 hover:bg-pink-50 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Wishes {selectedMembers.size > 0 && `(${selectedMembers.size})`}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-emerald-600">{success}</p>
        </div>
      )}

      {/* Message Editor */}
      {todayMembers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-pink-500" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Birthday Message</h3>
                  <p className="text-sm text-slate-500">
                    Customize your birthday wish. Use {"{firstName}"} and {"{lastName}"} as placeholders.
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetMessage}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-pink-500 focus:ring-pink-500 resize-none"
              placeholder="Enter your birthday message..."
            />
            <p className="mt-2 text-xs text-slate-400">
              Characters: {message.length} | Available placeholders: {"{firstName}"}, {"{lastName}"}
            </p>
          </div>
        </div>
      )}

      {/* Today's Birthday Members */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-24" />
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : todayMembers.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-pink-50">
            <div className="flex items-center gap-3">
              <Cake className="h-5 w-5 text-pink-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Today&apos;s Birthday Members</h3>
                <p className="text-sm text-slate-500">Send them birthday wishes!</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {todayMembers.map((member) => {
              const isSelected = selectedMembers.has(member.memberId);
              const wasContactedToday = smsContactStatus.get(member.memberId) ?? false;
              return (
                <div 
                  key={member.memberId} 
                  className={`p-4 hover:bg-pink-50/50 transition-colors ${isSelected ? "bg-pink-50/50" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={wasContactedToday}
                      onChange={() => toggleMember(member.memberId)}
                      className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-sm font-semibold text-white">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {member.firstName} {member.lastName}
                        </p>
                        {wasContactedToday && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                            Contacted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.phoneNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
                        <Gift className="h-4 w-4" />
                        {member.age} years old
                      </span>
                    </div>
                  </div>
                  {/* Message Preview */}
                  <div className="mt-3 ml-20 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-600">{getPreviewMessage(member)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Cake className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No Birthdays Today</h3>
          <p className="text-slate-500 mt-2">Check back tomorrow for member birthdays!</p>
        </div>
      )}
    </section>
  );
}
