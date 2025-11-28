"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginFitnessCenter, LoginPayload, AuthResponse } from "@/lib/api/fitnessCenterService";

export function useLoginController() {
  const router = useRouter();
  const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof LoginPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);

      const response: AuthResponse = await loginFitnessCenter(form);

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("fitnessCenter", JSON.stringify(response.fitnessCenter));
      }

      router.push("/");
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    loading,
    error,
    handleChange,
    handleSubmit,
  };
}
