"use client";

import { useEffect, useState } from "react";
import {
  fetchPaymentDuePreview,
  sendMemberSms,
  PaymentDueMember,
} from "@/lib/api/fitnessCenterService";
import {
  CreditCard,
  Send,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";

interface PaymentDueTabProps {
  fitnessCenterId: number | null;
}

export function PaymentDueTab({ fitnessCenterId }: PaymentDueTabProps) {
  const [members, setMembers] = useState<PaymentDueMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());

  // Fixed range: 0 to 7 days
  const minDays = 0;
  const maxDays = 7;

  const loadPreview = async (clearMessages = true) => {
    if (!fitnessCenterId) return;

    setLoading(true);
    if (clearMessages) {
      setError(null);
      setSuccess(null);
    }

    try {
      const data = await fetchPaymentDuePreview(fitnessCenterId, minDays, maxDays);
      setMembers(data.members);
      setTotalMembers(data.totalMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [fitnessCenterId]);

  const handleSendNotifications = async () => {
    if (!fitnessCenterId || selectedMembers.size === 0) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      // Get selected members data
      const selectedMembersList = members.filter((m) =>
        selectedMembers.has(m.memberId)
      );

      // Send SMS to each selected member
      let sentCount = 0;
      for (const member of selectedMembersList) {
        await sendMemberSms({
          to: member.phoneNumber,
          message: member.previewMessage,
        });
        sentCount++;
      }

      setSuccess(`Successfully sent ${sentCount} payment reminder(s)!`);
      // Clear selection and refresh the preview (keep success message)
      setSelectedMembers(new Set());
      await loadPreview(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notifications");
    } finally {
      setSending(false);
    }
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
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map((m) => m.memberId)));
    }
  };

  const getDaysColor = (days: number) => {
    if (days <= 1) return "text-rose-600 bg-rose-100";
    if (days <= 3) return "text-amber-600 bg-amber-100";
    return "text-emerald-600 bg-emerald-100";
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
      parseFloat(amount) || 0
    ) + " ETB";
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Payment Due Reminders</h3>
        <p className="text-sm text-slate-500 mt-1">Members with payments due within the next 7 days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Members with Due Payments</p>
              <p className="text-2xl font-bold text-slate-900">{totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Due Within</p>
              <p className="text-xl font-bold text-slate-900">7 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Selected</p>
              <p className="text-2xl font-bold text-slate-900">{selectedMembers.size}</p>
            </div>
          </div>
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

      {/* Send Controls */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Payment Reminders
            </h3>
            <p className="text-amber-100 text-sm mt-1">
              Send SMS to {selectedMembers.size} selected member{selectedMembers.size !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleSendNotifications}
            disabled={sending || selectedMembers.size === 0}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send SMS ({selectedMembers.size})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Members with Upcoming Payments</h3>
                <p className="text-sm text-slate-500">Preview of payment due reminders</p>
              </div>
            </div>
            {members.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {selectedMembers.size === members.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-5 w-5 bg-slate-200 rounded" />
                  <div className="h-10 w-10 bg-slate-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No members with upcoming payments</p>
            <p className="text-sm text-slate-400">Try adjusting the day range</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.memberId}
                className={`p-4 hover:bg-slate-50 transition-colors ${
                  selectedMembers.has(member.memberId) ? "bg-amber-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedMembers.has(member.memberId)}
                    onChange={() => toggleMember(member.memberId)}
                    className="mt-3 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-600">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phoneNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(member.amount)}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{member.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getDaysColor(member.daysUntilDue)}`}>
                        <Clock className="h-3 w-3" />
                        {member.daysUntilDue === 0 ? "Due today" : `${member.daysUntilDue} day${member.daysUntilDue !== 1 ? "s" : ""} until due`}
                      </span>
                    </div>
                    {/* Preview Message */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5" />
                        <p className="text-sm text-slate-600">{member.previewMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
