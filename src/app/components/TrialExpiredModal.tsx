"use client";

import { AlertTriangle, Phone, Mail, MessageCircle } from "lucide-react";

interface TrialExpiredModalProps {
  trialEndDate: string;
}

export function TrialExpiredModal({ trialEndDate }: TrialExpiredModalProps) {
  const formattedDate = new Date(trialEndDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Trial Period Expired</h2>
          <p className="text-red-100 mt-2 text-sm">
            Your free trial ended on {formattedDate}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-slate-600">
              Your trial period has ended. To continue using FitAddis and manage your fitness center, please contact our team to activate your subscription.
            </p>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
              Contact Us
            </h3>
            
            <a
              href="tel:+251956960198"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Call Us</p>
                <p className="font-medium text-slate-900">+251 95 696 0198</p>
              </div>
            </a>

            <a
              href="mailto:support@fitaddis.com"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email Us</p>
                <p className="font-medium text-slate-900">support@fitaddis.com</p>
              </div>
            </a>

            <a
              href="https://t.me/fitaddis"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Telegram</p>
                <p className="font-medium text-slate-900">@fitaddis</p>
              </div>
            </a>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 text-center">
              <strong>Note:</strong> Your data is safe and will be available once your subscription is activated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
