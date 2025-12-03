"use client";

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-9 w-72 bg-slate-200 rounded-lg" />
              <div className="h-5 w-56 bg-slate-200 rounded mt-2" />
            </div>
            <div className="h-8 w-24 bg-slate-200 rounded-full" />
          </div>
        </header>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-slate-200 h-36" />
          ))}
        </div>

        {/* Payment Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-slate-200 h-80" />
          <div className="rounded-2xl bg-slate-200 h-80" />
        </div>
      </div>
    </div>
  );
}

// Members Page Skeleton
export function MembersSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-64 bg-slate-200 rounded mt-2" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-slate-200 rounded-lg" />
            <div className="h-10 w-24 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Search Bar Skeleton */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="h-10 w-80 bg-slate-200 rounded-lg" />
          <div className="h-10 w-40 bg-slate-200 rounded-lg" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="h-6 w-full bg-slate-200 rounded" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-200 rounded mt-1" />
                </div>
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-6 w-16 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Billing Page Skeleton
export function BillingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="h-4 w-48 bg-slate-200 rounded mt-2" />
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 w-36 bg-slate-200 rounded-lg" />
          <div className="h-10 w-36 bg-slate-200 rounded-lg" />
          <div className="h-10 w-36 bg-slate-200 rounded-lg" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-slate-200 p-6 h-32" />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="h-6 w-full bg-slate-200 rounded" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border-b border-slate-100">
              <div className="h-5 w-full bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Marketing Page Skeleton
export function MarketingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-4 w-56 bg-slate-200 rounded mt-2" />
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-slate-200 p-6 h-28" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white border border-slate-200 p-6 h-96" />
          <div className="rounded-xl bg-white border border-slate-200 p-6 h-96" />
        </div>
      </div>
    </div>
  );
}

// Settings Page Skeleton
export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="h-4 w-48 bg-slate-200 rounded mt-2" />
      </div>

      <div className="p-6 space-y-6">
        {/* Settings Sections Skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white border border-slate-200 p-6">
            <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
            <div className="space-y-4">
              <div className="h-10 w-full bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-200 rounded" />
              <div className="h-10 w-2/3 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
