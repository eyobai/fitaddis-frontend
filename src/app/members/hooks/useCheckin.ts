"use client";

import { useState } from "react";
import {
  MemberSearchMember,
  searchMemberByCheckInCode,
  searchMemberByName,
  recordMemberCheckIn,
} from "@/lib/api/fitnessCenterService";

export type CheckinMode = "code" | "name";

export function useCheckin() {
  const [mode, setMode] = useState<CheckinMode>("code");
  const [codeInput, setCodeInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [member, setMember] = useState<MemberSearchMember | null>(null);
  const [nameResults, setNameResults] = useState<MemberSearchMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkinSuccess, setCheckinSuccess] = useState<string | null>(null);

  function reset() {
    setCodeInput("");
    setNameInput("");
    setMember(null);
    setNameResults([]);
    setError(null);
  }

  async function handleCheckIn(memberId: number) {
    let targetMember =
      member?.id === memberId
        ? member
        : nameResults.find((m) => m.id === memberId) ?? null;

    if (!targetMember) {
      setError("Select a member before checking in");
      setCheckinSuccess(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCheckinSuccess(null);

      const hasBillingInfo = Boolean(
        targetMember.latest_billing_status ?? targetMember.latestBillingStatus,
      );

      if (!hasBillingInfo && targetMember.check_in_code) {
        const refreshed = await searchMemberByCheckInCode(targetMember.check_in_code);
        targetMember = refreshed.member;
        setMember(refreshed.member);
      }

      const billingStatus =
        targetMember.latest_billing_status?.toLowerCase() ??
        targetMember.latestBillingStatus?.toLowerCase();
      const paymentPending = billingStatus && billingStatus !== "paid";

      if (paymentPending) {
        setError(
          "This member's subscription payment is pending. Please collect payment to renew before check-in.",
        );
        return;
      }

      await recordMemberCheckIn({ memberId });
      setCheckinSuccess("Member checked in successfully.");
    } catch (e) {
      setError("Failed to record check-in");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchByCode() {
    if (!codeInput) return;
    try {
      setLoading(true);
      setError(null);
      setCheckinSuccess(null);
      const res = await searchMemberByCheckInCode(codeInput);
      setMember(res.member);
      setNameResults([]);
    } catch (e) {
      setMember(null);
      setError("Member not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchByName() {
    const term = nameInput.trim();
    if (!term) return;
    try {
      setLoading(true);
      setError(null);
      const res = await searchMemberByName(term);
      setMember(null);
      setNameResults(res.members || []);
      if (!res.members || res.members.length === 0) {
        setError("No members found");
      }
    } catch (e) {
      setMember(null);
      setNameResults([]);
      setError("Member not found");
    } finally {
      setLoading(false);
    }
  }

  function appendDigit(digit: string) {
    setCodeInput((prev) => (prev + digit).slice(0, 10));
  }

  function backspace() {
    setCodeInput((prev) => prev.slice(0, -1));
  }

  function clear() {
    setCodeInput("");
  }

  function selectMember(m: MemberSearchMember) {
    setMember(m);
  }

  return {
    mode,
    setMode,
    codeInput,
    nameInput,
    setNameInput,
    member,
    nameResults,
    loading,
    error,
    checkinSuccess,
    appendDigit,
    backspace,
    clear,
    handleSearchByCode,
    handleSearchByName,
    handleCheckIn,
    selectMember,
    reset,
  };
}
