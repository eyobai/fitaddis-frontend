"use client";

import { useEffect, useState } from "react";
import { useMembersController } from "./controllers/useMembersController";
import { useAddMemberController } from "./controllers/useAddMemberController";
import { useCheckinController } from "./controllers/useCheckinController";
import { useDailyCheckinsController } from "./controllers/useDailyCheckinsController";
import { useVisitorsController } from "./controllers/useVisitorsController";

import { PageHeader } from "./components/PageHeader";
import { MembersTab } from "./components/MembersTab";
import { CheckinTab } from "./components/CheckinTab";
import { AddMemberModal } from "./components/AddMemberModal";
import type { TabId } from "./components/types";

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<TabId>("members");
  const [fitnessCenterId, setFitnessCenterId] = useState<number | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const { data, loading, error } = useMembersController();
  const visitors = useVisitorsController();
  const checkin = useCheckinController();
  const dailyCheckins = useDailyCheckinsController(fitnessCenterId);
  const addMember = useAddMemberController(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    if (storedFitnessCenter) {
      try {
        const parsed = JSON.parse(storedFitnessCenter) as { id?: number };
        if (parsed.id) {
          setFitnessCenterId(parsed.id);
        }
      } catch (e) {
        console.error("Failed to parse fitnessCenter from localStorage", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Page Header */}
      <PageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalMembers={data?.members.length ?? 0}
        todayCheckins={dailyCheckins.data?.members.length ?? 0}
        showStats={!!data && !loading}
      />

      {/* Main Content */}
      <div className="p-6">
        {activeTab === "members" && (
          <MembersTab
            data={data}
            loading={loading}
            error={error}
            visitorsData={visitors.data}
            visitorsLoading={visitors.loading}
            visitorsError={visitors.error}
            onAddMember={() => setShowAddMember(true)}
          />
        )}

        {activeTab === "checkin" && (
          <CheckinTab checkin={checkin} dailyCheckins={dailyCheckins} />
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <AddMemberModal
            addMember={addMember}
            onClose={() => {
              setShowAddMember(false);
              addMember.reset();
            }}
          />
        )}
      </div>
    </div>
  );
}
