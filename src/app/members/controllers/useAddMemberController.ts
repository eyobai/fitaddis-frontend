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

  async function handleSubmit() {
    if (!fitnessCenterId) {
      setError("No fitness center available");
      return;
    }

    if (!form.membershipPlanId) {
      setError("Please select a membership plan");
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

      await registerMember(payload);
      setSuccessMessage("Member registered successfully.");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to register member. Please try again.");
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
