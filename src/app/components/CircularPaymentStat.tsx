"use client";

import React from "react";

type CircularPaymentStatProps = {
  paid: number; // value to visualize
  expected: number; // total
  label: string;
  paidColor?: string;
  trackColor?: string;
};

export function CircularPaymentStat({
  paid,
  expected,
  label,
  paidColor = "stroke-emerald-400",
  trackColor = "stroke-slate-200",
}: CircularPaymentStatProps) {
  const total = expected > 0 ? expected : paid;
  const clampedPaid = total > 0 ? Math.max(Math.min(paid, total), 0) : 0;
  const percent = total === 0 ? 0 : (clampedPaid / total) * 100;

  const radius = 48;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (percent / 100) * circumference;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(paid || 0);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-32 w-32">
        <svg
          className="h-full w-full -rotate-90"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            className={`${trackColor} fill-none`}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            className={`${paidColor} fill-none transition-all duration-500 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold text-slate-900">
            {formattedAmount}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{label}</p>
    </div>
  );
}
