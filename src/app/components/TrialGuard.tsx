"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { TrialExpiredModal } from "./TrialExpiredModal";
import { TrialWarningBanner } from "./TrialWarningBanner";
import { fetchFitnessCenterDetails, FitnessCenter } from "@/lib/api/fitnessCenterService";

// Pages that should be accessible even when trial is expired
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth"];

// Number of days before expiry to start showing warning
const WARNING_DAYS_THRESHOLD = 5;

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<string>("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Process fitness center data and determine trial status
  const processTrialStatus = useCallback((fitnessCenter: FitnessCenter) => {
    // If status is active, allow access without any warnings
    if (fitnessCenter.status === "active") {
      setIsTrialExpired(false);
      setShowWarning(false);
      setDaysLeft(null);
      return;
    }

    // If status is inactive, check if trial has expired or is about to expire
    if (fitnessCenter.status === "inactive" && fitnessCenter.trial_end_date) {
      const trialEnd = new Date(fitnessCenter.trial_end_date);
      const today = new Date();
      
      // Reset time to compare dates only
      trialEnd.setHours(23, 59, 59, 999);
      today.setHours(0, 0, 0, 0);

      // Calculate days remaining
      const timeDiff = trialEnd.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        // Trial has expired
        setIsTrialExpired(true);
        setShowWarning(false);
        setDaysLeft(null);
        setTrialEndDate(fitnessCenter.trial_end_date);
      } else if (daysRemaining <= WARNING_DAYS_THRESHOLD) {
        // Trial is about to expire, show warning
        setIsTrialExpired(false);
        setShowWarning(true);
        setDaysLeft(daysRemaining);
        setTrialEndDate(fitnessCenter.trial_end_date);
      } else {
        // Still have plenty of time
        setIsTrialExpired(false);
        setShowWarning(false);
        setDaysLeft(null);
      }
    }
  }, []);

  // Check fitness center status - fetch fresh data from server
  const checkTrialStatus = useCallback(async () => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    // Skip check for public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      setIsLoading(false);
      setIsTrialExpired(false);
      setShowWarning(false);
      return;
    }

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    
    if (!storedFitnessCenter) {
      // No fitness center data, user might not be logged in
      setIsLoading(false);
      return;
    }

    try {
      const localData = JSON.parse(storedFitnessCenter) as FitnessCenter;
      
      // Get the fitness center ID (handle both 'id' and 'fitness_center_id' property names)
      const fitnessCenterId = localData.id || (localData as unknown as { fitness_center_id?: number }).fitness_center_id;
      
      if (!fitnessCenterId) {
        console.warn("No fitness center ID found in localStorage data:", localData);
        processTrialStatus(localData);
        setIsLoading(false);
        return;
      }
      
      // Fetch fresh data from server
      try {
        const freshData = await fetchFitnessCenterDetails(fitnessCenterId);
        
        // Update localStorage with fresh data
        localStorage.setItem("fitnessCenter", JSON.stringify(freshData));
        
        // Process the fresh data
        processTrialStatus(freshData);
      } catch (fetchError) {
        // If fetch fails, fall back to local data
        console.warn("Failed to fetch fresh fitness center data, using cached data:", fetchError);
        processTrialStatus(localData);
      }
    } catch (error) {
      console.error("Failed to parse fitness center data:", error);
    }
    
    setIsLoading(false);
  }, [pathname, processTrialStatus]);

  useEffect(() => {
    // Check on initial load
    checkTrialStatus();

    // Check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTrialStatus();
      }
    };

    // Check when window gets focus
    const handleFocus = () => {
      checkTrialStatus();
    };

    // Listen for storage changes (in case user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fitnessCenter") {
        checkTrialStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkTrialStatus]);

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Trial Warning Banner - shows when trial is about to expire */}
      {showWarning && daysLeft !== null && (
        <TrialWarningBanner daysLeft={daysLeft} trialEndDate={trialEndDate} />
      )}
      
      {children}
      
      {/* Trial Expired Modal - blocks the app when trial has expired */}
      {isTrialExpired && <TrialExpiredModal trialEndDate={trialEndDate} />}
    </>
  );
}
