"use client";

import { FitnessCenterOverdueMember } from "@/lib/api/fitnessCenterService";

interface PaymentConfirmModalProps {
  selectedMember: FitnessCenterOverdueMember;
  editableAmount: string;
  setEditableAmount: (amount: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function PaymentConfirmModal({
  selectedMember,
  editableAmount,
  setEditableAmount,
  onConfirm,
  onCancel,
  isProcessing,
}: PaymentConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Confirm payment</h3>
        <p className="mt-1 text-sm text-slate-500">Review the details before submitting.</p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Member</p>
            <p className="text-base font-semibold text-slate-900">
              {selectedMember.first_name} {selectedMember.last_name}
            </p>
          </div>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            Amount (ETB)
            <input
              type="number"
              min="0"
              value={editableAmount}
              onChange={(e) => setEditableAmount(e.target.value)}
              className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isProcessing ? "Processing..." : "Confirm & pay"}
          </button>
        </div>
      </div>
    </div>
  );
}
