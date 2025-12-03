"use client";

import { useState } from "react";
import { AlertTriangle, X, Clock, Phone, Mail, MessageCircle } from "lucide-react";

interface TrialWarningBannerProps {
  daysLeft: number;
  trialEndDate: string;
}

export function TrialWarningBanner({ daysLeft, trialEndDate }: TrialWarningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  if (isDismissed) return null;

  const formattedDate = new Date(trialEndDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Determine urgency level for styling
  const isUrgent = daysLeft <= 2;
  const bgColor = isUrgent 
    ? "bg-gradient-to-r from-red-500 to-rose-500" 
    : "bg-gradient-to-r from-amber-500 to-orange-500";

  const getMessage = () => {
    if (daysLeft === 0) {
      return "Your trial expires today!";
    } else if (daysLeft === 1) {
      return "Your trial expires tomorrow!";
    } else {
      return `Your trial expires in ${daysLeft} days`;
    }
  };

  return (
    <>
      <div className={`${bgColor} text-white shadow-lg`}>
        {/* Main Banner */}
        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {isUrgent ? (
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-bold text-lg">{getMessage()}</span>
                <span className="text-sm opacity-90">
                  Trial ends on {formattedDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Contact Us Button - Highly Visible */}
              <button
                onClick={() => setShowContactModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                  isUrgent
                    ? "bg-white text-red-600 hover:bg-red-50 shadow-lg"
                    : "bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
                }`}
              >
                <Phone className="h-4 w-4" />
                <span>Contact Us Now</span>
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowContactModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`${bgColor} text-white p-6`}>
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Phone className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold">Contact Us</h2>
                <p className="text-sm opacity-90 mt-1">
                  Get in touch to activate your subscription
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Phone */}
              <a
                href="tel:+251956960198"
                className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">Call Us</p>
                  <p className="font-semibold text-slate-900 text-lg">+251 95 696 0198</p>
                </div>
                <div className="text-violet-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:support@fitaddis.com"
                className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">Email Us</p>
                  <p className="font-semibold text-slate-900 text-lg">support@fitaddis.com</p>
                </div>
                <div className="text-violet-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/fitaddis"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">Telegram</p>
                  <p className="font-semibold text-slate-900 text-lg">@fitaddis</p>
                </div>
                <div className="text-violet-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <p className="text-sm text-amber-800 text-center">
                  Our team is available <strong>Mon-Sat, 9AM-6PM</strong> to help you activate your subscription.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
