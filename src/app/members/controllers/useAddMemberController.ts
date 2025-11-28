"use client";

import { useEffect, useState } from "react";
import {
  fetchFitnessCenterMembershipPlans,
  FitnessCenterMembershipPlansResponse,
  MembershipPlan,
  RegisterMemberPayload,
  registerMember,
} from "@/lib/api/fitnessCenterService";

export type MemberTypeOption = "member" | "visitor";

export function useAddMemberController(onSuccess?: () => void) {
  const [fitnessCenterId, setFitnessCenterId] = useState<number | null>(null);
  const [plansData, setPlansData] =
    useState<FitnessCenterMembershipPlansResponse | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [memberType, setMemberType] = useState<MemberTypeOption>("member");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "male",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    joinDate: "",
    city: "",
    specificLocation: "",
    membershipPlanId: "",
    referralSourceId: "1",
    emergencyContactName: "",
    emergencyContactPhoneNumber: "",
    emergencyContactRelation: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFitnessCenter = localStorage.getItem("fitnessCenter");
    if (!storedFitnessCenter) {
      setError("No fitness center is logged in");
      return;
    }

    try {
      const parsed = JSON.parse(storedFitnessCenter) as { id?: number };
      if (!parsed.id) {
        setError("Invalid fitness center information");
        return;
      }
      setFitnessCenterId(parsed.id);
      loadPlans(parsed.id);
    } catch (e) {
      console.error("Failed to parse fitnessCenter from localStorage", e);
      setError("Unable to read fitness center information");
    }
  }, []);

  async function loadPlans(id: number) {
    try {
      setLoadingPlans(true);
      const response = await fetchFitnessCenterMembershipPlans(id);
      setPlansData(response);
    } catch (err) {
      setError("Unable to load membership plans");
    } finally {
      setLoadingPlans(false);
    }
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(): string | null {
    if (!form.firstName.trim()) {
      return "First name is required";
    }
    if (!form.lastName.trim()) {
      return "Last name is required";
    }
    if (!form.dateOfBirth) {
      return "Date of birth is required";
    }
    if (!form.phoneNumber.trim()) {
      return "Phone number is required";
    }
    // Basic phone validation (at least 9 digits)
    const phoneDigits = form.phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      return "Phone number must have at least 9 digits";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Please enter a valid email address";
    }
    if (!form.joinDate) {
      return "Join date is required";
    }
    if (!form.city.trim()) {
      return "City is required";
    }
    if (!form.membershipPlanId) {
      return "Please select a membership plan";
    }
    if (!form.emergencyContactName.trim()) {
      return "Emergency contact name is required";
    }
    if (!form.emergencyContactPhoneNumber.trim()) {
      return "Emergency contact phone number is required";
    }
    if (!form.emergencyContactRelation.trim()) {
      return "Emergency contact relation is required";
    }
    return null;
  }

  async function handleSubmit() {
    if (!fitnessCenterId) {
      setError("No fitness center available");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const payload: RegisterMemberPayload = {
        fitnessCenterId,
        memberTypeId: memberType === "member" ? 2 : 1,
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        phoneNumber: form.phoneNumber,
        email: form.email,
        joinDate: form.joinDate,
        city: form.city,
        specificLocation: form.specificLocation,
        membershipPlanId: Number(form.membershipPlanId),
        referralSourceId: Number(form.referralSourceId || "1"),
        emergencyContact: {
          contactName: form.emergencyContactName,
          phoneNumber: form.emergencyContactPhoneNumber,
          relation: form.emergencyContactRelation,
        },
      };

      console.log("Registration payload:", JSON.stringify(payload, null, 2));
      await registerMember(payload);
      setSuccessMessage("Member registered successfully.");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      let errorMessage = "Failed to register member. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosErr.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    fitnessCenterId,
    plansData,
    loadingPlans,
    submitting,
    error,
    successMessage,
    memberType,
    setMemberType,
    form,
    handleChange,
    handleSubmit,
  };
}
