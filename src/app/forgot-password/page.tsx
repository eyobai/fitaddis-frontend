"use client";

import Link from "next/link";
import { usePasswordResetController } from "../auth/controllers/usePasswordResetController";
import { ArrowLeft, Phone, KeyRound, Lock, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const {
    step,
    phoneNumber,
    otp,
    newPassword,
    confirmPassword,
    loading,
    error,
    success,
    setField,
    requestOtp,
    verifyOtp,
    resetPassword,
    goBack,
  } = usePasswordResetController();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-slate-200">
        {/* Header */}
        <div className="mb-6">
          {step !== "request" && step !== "success" && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          
          <h1 className="text-2xl font-bold text-slate-900">
            {step === "request" && "Forgot Password"}
            {step === "verify" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
            {step === "success" && "Password Reset"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === "request" && "Enter your phone number to receive a verification code."}
            {step === "verify" && "Enter the 6-digit code sent to your phone."}
            {step === "reset" && "Create a new password for your account."}
            {step === "success" && "Your password has been reset successfully."}
          </p>
        </div>

        {/* Progress Steps */}
        {step !== "success" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {["request", "verify", "reset"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s
                      ? "bg-violet-600 text-white"
                      : ["request", "verify", "reset"].indexOf(step) > i
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {["request", "verify", "reset"].indexOf(step) > i ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div
                    className={`w-12 h-1 mx-1 rounded ${
                      ["request", "verify", "reset"].indexOf(step) > i
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && step !== "success" && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-600">
            {success}
          </div>
        )}

        {/* Step: Request OTP */}
        {step === "request" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setField("phoneNumber", e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        )}

        {/* Step: Verify OTP */}
        {step === "verify" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setField("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Didn&apos;t receive the code?{" "}
                <button
                  onClick={() => {
                    setField("step", "request");
                    setField("otp", "");
                  }}
                  className="text-violet-600 font-medium hover:underline"
                >
                  Resend
                </button>
              </p>
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        )}

        {/* Step: Reset Password */}
        {step === "reset" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setField("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              onClick={resetPassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <Link
              href="/login"
              className="block w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors text-center"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Back to Login Link */}
        {step !== "success" && (
          <p className="mt-6 text-xs text-slate-500 text-center">
            Remember your password?{" "}
            <Link href="/login" className="text-violet-600 font-medium hover:underline">
              Back to Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
