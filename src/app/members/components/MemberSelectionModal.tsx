import type { CheckinControllerReturn } from "./types";

interface MemberSelectionModalProps {
  checkin: CheckinControllerReturn;
  showCheckinDetails: boolean;
  setShowCheckinDetails: (show: boolean) => void;
  onClose: () => void;
}

export function MemberSelectionModal({
  checkin,
  showCheckinDetails,
  setShowCheckinDetails,
  onClose,
}: MemberSelectionModalProps) {
  const pendingPaymentError = checkin.error
    ?.toLowerCase()
    .includes("subscription payment is pending");
  if (checkin.nameResults.length === 0 && !checkin.member) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Select Member</h2>
            <p className="text-sm text-slate-300">
              Choose a member to check in
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Member List */}
        <div className="max-h-64 overflow-y-auto">
          {checkin.nameResults.map((m) => {
            const initials = `${m.first_name[0]}${m.last_name[0]}`.toUpperCase();
            const isSelected = checkin.member?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  checkin.selectMember(m);
                  setShowCheckinDetails(true);
                }}
                className={`w-full px-6 py-4 text-left flex items-center gap-4 border-b border-slate-100 transition-colors ${
                  isSelected ? "bg-slate-50" : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${
                    isSelected
                      ? "bg-emerald-600"
                      : "bg-gradient-to-br from-slate-600 to-slate-800"
                  }`}
                >
                  {isSelected ? (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">
                    {m.first_name} {m.last_name}
                  </div>
                  <div className="text-sm text-slate-500 truncate">
                    {m.email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-400 uppercase">
                    Code
                  </div>
                  <div className="text-sm font-mono font-semibold text-slate-700">
                    {m.check_in_code}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Member Details */}
        {checkin.member && showCheckinDetails && (
          <div className="border-t border-slate-200 bg-slate-50 p-6">
            {/* Member Name Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {checkin.member.first_name[0]}{checkin.member.last_name[0]}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {checkin.member.first_name} {checkin.member.last_name}
                </div>
                <div className="text-sm text-slate-500">
                  Code: <span className="font-mono font-semibold">{checkin.member.check_in_code}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Phone
                </div>
                <div className="font-medium text-slate-900">
                  {checkin.member.phone_number}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Location
                </div>
                <div className="font-medium text-slate-900">
                  {checkin.member.city}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => checkin.handleCheckIn(checkin.member!.id)}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Confirm Check-in
              </button>
            </div>
            {pendingPaymentError && (
              <p className="mt-3 text-sm font-medium text-rose-600">
                {checkin.error}
              </p>
            )}
            {checkin.checkinSuccess && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                <svg
                  className="h-5 w-5 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-emerald-700">
                  {checkin.checkinSuccess}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
