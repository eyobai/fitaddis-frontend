"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerFitnessCenter, RegisterPayload, AuthResponse } from "@/lib/api/fitnessCenterService";

export function useRegisterController() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterPayload>({
    name: "",
    city: "",
    specificLocation: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof RegisterPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response: AuthResponse = await registerFitnessCenter(form);

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("fitnessCenter", JSON.stringify(response.fitnessCenter));
      }

      router.push("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
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
