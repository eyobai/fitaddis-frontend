import type { DailyCheckinsControllerReturn } from "./types";

interface DailyCheckinsPanelProps {
  dailyCheckins: DailyCheckinsControllerReturn;
}

export function DailyCheckinsPanel({ dailyCheckins }: DailyCheckinsPanelProps) {
  return (
    <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Today&apos;s Check-ins
          </h2>
          <p className="text-sm text-slate-500">
            {dailyCheckins.data?.members.length || 0} members checked in
          </p>
        </div>
        <div className="relative">
          <input
            type="date"
            value={dailyCheckins.date}
            onChange={(e) => dailyCheckins.setDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
          />
        </div>
      </div>

      {/* Check-ins List */}
      <div className="max-h-[400px] overflow-y-auto">
        {dailyCheckins.loading && (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-6 w-6 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-2 text-sm text-slate-500">
              Loading check-ins...
            </span>
          </div>
        )}
        {dailyCheckins.error && !dailyCheckins.loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-2 text-sm text-red-600">{dailyCheckins.error}</p>
            </div>
          </div>
        )}
        {!dailyCheckins.loading &&
          !dailyCheckins.error &&
          dailyCheckins.data &&
          dailyCheckins.data.members.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <svg
                  className="h-7 w-7 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">
                No check-ins yet
              </p>
              <p className="text-xs text-slate-400">
                Check-ins will appear here
              </p>
            </div>
          )}
        {dailyCheckins.data && dailyCheckins.data.members.length > 0 && (
          <div className="divide-y divide-slate-100">
            {dailyCheckins.data.members.map((m) => {
              const initials =
                `${m.first_name[0]}${m.last_name[0]}`.toUpperCase();
              return (
                <div
                  key={m.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">
                      {m.first_name} {m.last_name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {m.phone_number}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {new Date(m.check_in_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
