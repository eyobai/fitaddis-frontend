"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  fetchFitnessCenterMembers,
  fetchFitnessCenterVisitors,
  sendMemberSms,
  sendBulkSms,
  FitnessCenter,
  FitnessCenterMember,
  FitnessCenterVisitor,
} from "@/lib/api/fitnessCenterService";
import { Send, Users, User, MessageSquare, CheckCircle2, Circle } from "lucide-react";

type MessageMode = "individual" | "bulk";
type RecipientType = "members" | "visitors";

interface Recipient {
  id: number;
  name: string;
  phone: string;
  type: "member" | "visitor";
}

export default function MarketingPage() {
  const router = useRouter();
  const [fitnessCenter, setFitnessCenter] = useState<FitnessCenter | null>(null);
  const [messageMode, setMessageMode] = useState<MessageMode>("individual");
  const [recipientType, setRecipientType] = useState<RecipientType>("members");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("FitAddis");
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("fitnessCenter");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as FitnessCenter;
      setFitnessCenter(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (fitnessCenter) {
      loadRecipients();
    }
  }, [fitnessCenter, recipientType]);

  async function loadRecipients() {
    if (!fitnessCenter) return;

    try {
      setLoadingRecipients(true);
      setSelectedRecipients([]);

      if (recipientType === "members") {
        const response = await fetchFitnessCenterMembers(fitnessCenter.id);
        const mapped: Recipient[] = response.members.map((m: FitnessCenterMember) => ({
          id: m.member_id,
          name: `${m.first_name} ${m.last_name}`,
          phone: m.phone_number,
          type: "member" as const,
        }));
        setRecipients(mapped);
      } else {
        const response = await fetchFitnessCenterVisitors(fitnessCenter.id);
        const mapped: Recipient[] = response.visitors.map((v: FitnessCenterVisitor) => ({
          id: v.id,
          name: `${v.first_name} ${v.last_name}`,
          phone: v.phone_number,
          type: "visitor" as const,
        }));
        setRecipients(mapped);
      }
    } catch (err) {
      console.error("Failed to load recipients:", err);
      setError("Failed to load recipients");
    } finally {
      setLoadingRecipients(false);
    }
  }

  function toggleRecipient(recipient: Recipient) {
    if (messageMode === "individual") {
      setSelectedRecipients([recipient]);
    } else {
      const isSelected = selectedRecipients.some((r) => r.id === recipient.id && r.type === recipient.type);
      if (isSelected) {
        setSelectedRecipients(selectedRecipients.filter((r) => !(r.id === recipient.id && r.type === recipient.type)));
      } else {
        setSelectedRecipients([...selectedRecipients, recipient]);
      }
    }
  }

  function selectAll() {
    setSelectedRecipients(filteredRecipients);
  }

  function deselectAll() {
    setSelectedRecipients([]);
  }

  async function handleSend() {
    if (selectedRecipients.length === 0) {
      setError("Please select at least one recipient");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    if (!sender.trim()) {
      setError("Please enter a sender name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (messageMode === "individual") {
        await sendMemberSms({
          to: selectedRecipients[0].phone,
          message: message.trim(),
          sender: sender.trim(),
        });
        setSuccess(`Message sent to ${selectedRecipients[0].name}`);
      } else {
        const phoneNumbers = selectedRecipients.map((r) => r.phone);
        await sendBulkSms({
          recipients: phoneNumbers,
          message: message.trim(),
          sender: sender.trim(),
        });
        setSuccess(`Message sent to ${selectedRecipients.length} recipients`);
      }

      setMessage("");
      setSelectedRecipients([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecipients = recipients.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery)
  );

  if (!fitnessCenter) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Marketing</h1>
      <p className="text-slate-500 mb-6">Send SMS messages to your members and visitors</p>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Recipients */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recipients</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setRecipientType("members")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    recipientType === "members"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Members
                </button>
                <button
                  onClick={() => setRecipientType("visitors")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    recipientType === "visitors"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Visitors
                </button>
              </div>
            </div>

            {/* Message Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setMessageMode("individual");
                  setSelectedRecipients([]);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  messageMode === "individual"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Individual Message
              </button>
              <button
                onClick={() => {
                  setMessageMode("bulk");
                  setSelectedRecipients([]);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  messageMode === "bulk"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Bulk Message
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            {/* Bulk Actions */}
            {messageMode === "bulk" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={selectAll}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  Select All ({filteredRecipients.length})
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={deselectAll}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>

          {/* Recipients List */}
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {loadingRecipients ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading {recipientType}...</p>
              </div>
            ) : filteredRecipients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No {recipientType} found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecipients.map((recipient) => {
                  const isSelected = selectedRecipients.some(
                    (r) => r.id === recipient.id && r.type === recipient.type
                  );
                  return (
                    <button
                      key={`${recipient.type}-${recipient.id}`}
                      onClick={() => toggleRecipient(recipient)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                        isSelected
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {messageMode === "bulk" ? (
                        isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-violet-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                        )
                      ) : (
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex-shrink-0 ${
                            isSelected ? "border-violet-600 bg-violet-600" : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{recipient.name}</p>
                        <p className="text-sm text-slate-500">{recipient.phone}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedRecipients.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-violet-600">{selectedRecipients.length}</span>{" "}
                recipient{selectedRecipients.length > 1 ? "s" : ""} selected
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Message Composer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <MessageSquare className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Compose Message</h2>
                <p className="text-sm text-slate-500">
                  {messageMode === "individual" ? "Send to one person" : "Send to multiple people"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Sender Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sender Name
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g., FitAddis"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Selected Recipients Preview */}
            {selectedRecipients.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {selectedRecipients.slice(0, 5).map((r) => (
                    <span
                      key={`${r.type}-${r.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-md text-xs font-medium"
                    >
                      {r.name}
                    </span>
                  ))}
                  {selectedRecipients.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 rounded-md text-xs font-medium">
                      +{selectedRecipients.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
              <p className="mt-1 text-xs text-slate-400">{message.length} characters</p>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={loading || selectedRecipients.length === 0 || !message.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              {loading
                ? "Sending..."
                : messageMode === "individual"
                ? "Send Message"
                : `Send to ${selectedRecipients.length} Recipient${selectedRecipients.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
