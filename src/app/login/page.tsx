"use client";

import Link from "next/link";
import { useLogin } from "../auth/hooks/useLogin";

export default function LoginPage() {
  const { form, loading, error, handleChange, handleSubmit } = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md border border-slate-200">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">Login</h1>
        <p className="mb-6 text-sm text-slate-500">
          Sign in to access your fitness center dashboard.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-700">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-slate-900 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
