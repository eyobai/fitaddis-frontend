"use client";

import { useState, useCallback } from "react";

type Step = "request" | "verify" | "reset" | "success";

interface PasswordResetState {
  step: Step;
  phoneNumber: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  fitnessCenterId: number | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const API_BASE = "http://localhost:3000";

export function usePasswordResetController() {
  const [state, setState] = useState<PasswordResetState>({
    step: "request",
    phoneNumber: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    fitnessCenterId: null,
    loading: false,
    error: null,
    success: null,
  });

  const setField = useCallback(<K extends keyof PasswordResetState>(
    field: K,
    value: PasswordResetState[K]
  ) => {
    setState((prev) => ({ ...prev, [field]: value, error: null }));
  }, []);

  const requestOtp = useCallback(async () => {
    if (!state.phoneNumber.trim()) {
      setState((prev) => ({ ...prev, error: "Phone number is required" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`${API_BASE}/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: state.phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        fitnessCenterId: data.fitnessCenterId,
        step: "verify",
        success: "OTP sent successfully to your phone",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to send OTP",
      }));
    }
  }, [state.phoneNumber]);

  const verifyOtp = useCallback(async () => {
    if (!state.otp.trim()) {
      setState((prev) => ({ ...prev, error: "OTP is required" }));
      return;
    }

    if (!state.fitnessCenterId) {
      setState((prev) => ({ ...prev, error: "Session expired. Please start over." }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`${API_BASE}/verify-password-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessCenterId: state.fitnessCenterId,
          otp: state.otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      if (!data.verified) {
        throw new Error("OTP verification failed");
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        step: "reset",
        success: "OTP verified successfully",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to verify OTP",
      }));
    }
  }, [state.otp, state.fitnessCenterId]);

  const resetPassword = useCallback(async () => {
    if (!state.newPassword.trim()) {
      setState((prev) => ({ ...prev, error: "New password is required" }));
      return;
    }

    if (state.newPassword.length < 6) {
      setState((prev) => ({ ...prev, error: "Password must be at least 6 characters" }));
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      setState((prev) => ({ ...prev, error: "Passwords do not match" }));
      return;
    }

    if (!state.fitnessCenterId) {
      setState((prev) => ({ ...prev, error: "Session expired. Please start over." }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessCenterId: state.fitnessCenterId,
          otp: state.otp,
          newPassword: state.newPassword,
          confirmPassword: state.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        step: "success",
        success: "Password reset successfully! You can now login with your new password.",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to reset password",
      }));
    }
  }, [state.newPassword, state.confirmPassword, state.fitnessCenterId, state.otp]);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.step === "verify") {
        return { ...prev, step: "request", otp: "", error: null, success: null };
      }
      if (prev.step === "reset") {
        return { ...prev, step: "verify", newPassword: "", confirmPassword: "", error: null, success: null };
      }
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      step: "request",
      phoneNumber: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      fitnessCenterId: null,
      loading: false,
      error: null,
      success: null,
    });
  }, []);

  return {
    ...state,
    setField,
    requestOtp,
    verifyOtp,
    resetPassword,
    goBack,
    reset,
  };
}
