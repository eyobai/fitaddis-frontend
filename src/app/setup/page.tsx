"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createMembershipPlan,
  CreateMembershipPlanPayload,
  MembershipPlan,
  FitnessCenter,
} from "@/lib/api/fitnessCenterService";
import { Plus, Trash2, ArrowRight } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [fitnessCenter, setFitnessCenter] = useState<FitnessCenter | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [form, setForm] = useState<CreateMembershipPlanPayload>({
    name: "",
    durationMonths: 1,
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch {
      router.push("/login");
    }
  }, [router]);

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
      setLoading(true);
      setError(null);

      const newPlan = await createMembershipPlan(fitnessCenter.id, form);
      setPlans((prev) => [...prev, newPlan]);
      setForm({ name: "", durationMonths: 1, price: 0 });
    } catch (err) {
      setError("Failed to create membership plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemovePlan(index: number) {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  }

  function handleContinue() {
    router.push("/");
  }

  if (!fitnessCenter) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md border border-slate-200">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          Welcome, {fitnessCenter.name}!
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Set up your membership plans. You can add multiple plans for your members to choose from.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Add Plan Form */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Add Membership Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Gym + Spa"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddPlan}
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Adding..." : "Add Plan"}
          </button>
        </div>

        {/* Plans List */}
        {plans.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-700 mb-3">Your Membership Plans</h2>
            <div className="space-y-2">
              {plans.map((plan, index) => (
                <div
                  key={plan.id || index}
                  className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{plan.name}</p>
                    <p className="text-xs text-slate-500">
                      {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""} • ETB {plan.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemovePlan(index)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {plans.length === 0 ? "Skip for now" : "Continue to Dashboard"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {plans.length === 0 && (
          <p className="mt-4 text-xs text-slate-400 text-center">
            You can add membership plans later from your dashboard settings.
          </p>
        )}
      </div>
    </div>
  );
}
