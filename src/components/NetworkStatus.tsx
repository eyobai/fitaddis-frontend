"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-200 bg-white px-8 py-6 shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <WifiOff className="h-8 w-8 text-rose-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">No Internet Connection</h3>
          <p className="mt-1 text-sm text-slate-500">Please check your network and try again.</p>
        </div>
      </div>
    </div>
  );
}
