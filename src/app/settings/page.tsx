"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createMembershipPlan,
  fetchFitnessCenterMembershipPlans,
  CreateMembershipPlanPayload,
  MembershipPlan,
  FitnessCenter,
} from "@/lib/api/fitnessCenterService";
import { Plus, Package } from "lucide-react";
import { SettingsSkeleton } from "../components/PageSkeleton";

export default function SettingsPage() {
  const router = useRouter();
  const [fitnessCenter, setFitnessCenter] = useState<FitnessCenter | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [form, setForm] = useState<CreateMembershipPlanPayload>({
    name: "",
    durationMonths: 1,
    price: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("fitnessCenter");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as FitnessCenter;
      setFitnessCenter(parsed);
      loadPlans(parsed.id);
    } catch {
      router.push("/login");
    }
  }, [router]);

  async function loadPlans(fitnessCenterId: number) {
    try {
      setLoadingPlans(true);
      const response = await fetchFitnessCenterMembershipPlans(fitnessCenterId);
      setPlans(response.membershipPlans || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  }

  function handleChange(field: keyof CreateMembershipPlanPayload, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAddPlan() {
    if (!fitnessCenter) return;

    if (!form.name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (form.durationMonths < 1) {
      setError("Duration must be at least 1 month");
      return;
    }
    if (form.price < 0) {
      setError("Price cannot be negative");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const newPlan = await createMembershipPlan(fitnessCenter.id, form);
      setPlans((prev) => [...prev, newPlan]);
      setForm({ name: "", durationMonths: 1, price: 0 });
      setSuccess("Membership plan added successfully!");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to create membership plan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!fitnessCenter) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
      <p className="text-slate-500 mb-8">Manage your fitness center settings</p>

      {/* Membership Plans Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Package className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Membership Plans</h2>
              <p className="text-sm text-slate-500">Add and manage your membership plans</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Add Plan Form */}
          <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Add New Plan</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Gym + Spa + Swimming"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Duration (months)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.durationMonths}
                  onChange={(e) => handleChange("durationMonths", parseInt(e.target.value) || 1)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Price (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <button
              onClick={handleAddPlan}
              disabled={submitting}
              className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {submitting ? "Adding..." : "Add Plan"}
            </button>
          </div>

          {/* Plans List */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Your Membership Plans</h3>

            {loadingPlans ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <Package className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">No membership plans yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your first plan above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((plan, index) => (
                  <div
                    key={plan.id || index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 font-semibold text-sm">
                        {plan.duration_months}M
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{plan.name}</p>
                        <p className="text-sm text-slate-500">
                          {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""} • ETB {plan.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
