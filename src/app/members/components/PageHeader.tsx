import { TABS, TabId } from "./types";

interface PageHeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  totalMembers: number;
  todayCheckins: number;
  showStats: boolean;
}

export function PageHeader({
  activeTab,
  setActiveTab,
  totalMembers,
  todayCheckins,
  showStats,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your gym members and check-ins
          </p>
        </div>
        {showStats && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {totalMembers}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                Total Members
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {todayCheckins}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                Today&apos;s Check-ins
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="mt-6 flex gap-1">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.id === "members" && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              )}
              {tab.id === "checkin" && (
                <svg
                  className="h-4 w-4"
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
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
