"use client";

import { useState, useEffect } from "react";
import type { FitnessCenterMember, FitnessCenterMembershipPlansResponse } from "./types";
import { fetchFitnessCenterMembershipPlans } from "@/lib/api/fitnessCenterService";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  Clock,
  Hash,
  AlertCircle,
  Edit3,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface MemberDetailModalProps {
  member: FitnessCenterMember;
  onClose: () => void;
  onMemberUpdated?: (updatedMember: FitnessCenterMember) => void;
}

interface EditableFields {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  city: string;
  specificLocation: string;
  membershipPlanId: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function updateMember(memberId: number, data: Partial<EditableFields>): Promise<void> {
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    phoneNumber: data.phoneNumber,
    email: data.email,
    city: data.city,
    specificLocation: data.specificLocation,
    membershipPlanId: data.membershipPlanId,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    emergencyContactRelation: data.emergencyContactRelation,
  };

  const res = await fetch(`http://localhost:3000/members/${memberId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update member");
  }
}

export function MemberDetailModal({ member, onClose, onMemberUpdated }: MemberDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [membershipPlans, setMembershipPlans] = useState<FitnessCenterMembershipPlansResponse | null>(null);
  
  const [formData, setFormData] = useState<EditableFields>({
    firstName: member.first_name,
    lastName: member.last_name,
    gender: member.gender,
    dateOfBirth: formatDateForInput(member.date_of_birth),
    phoneNumber: member.phone_number,
    email: member.email,
    city: member.city,
    specificLocation: member.specific_location,
    membershipPlanId: member.membership_plan_id,
    emergencyContactName: member.emergency_contact_name,
    emergencyContactPhone: member.emergency_contact_phone,
    emergencyContactRelation: member.emergency_contact_relation,
  });

  // Load membership plans when editing starts
  useEffect(() => {
    if (isEditing && !membershipPlans) {
      const fitnessCenterData = localStorage.getItem("fitnessCenter");
      if (fitnessCenterData) {
        const fitnessCenter = JSON.parse(fitnessCenterData);
        fetchFitnessCenterMembershipPlans(fitnessCenter.id)
          .then(setMembershipPlans)
          .catch(console.error);
      }
    }
  }, [isEditing, membershipPlans]);

  const handleChange = (field: keyof EditableFields, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return (
      formData.firstName !== member.first_name ||
      formData.lastName !== member.last_name ||
      formData.gender !== member.gender ||
      formData.dateOfBirth !== formatDateForInput(member.date_of_birth) ||
      formData.phoneNumber !== member.phone_number ||
      formData.email !== member.email ||
      formData.city !== member.city ||
      formData.specificLocation !== member.specific_location ||
      formData.membershipPlanId !== member.membership_plan_id ||
      formData.emergencyContactName !== member.emergency_contact_name ||
      formData.emergencyContactPhone !== member.emergency_contact_phone ||
      formData.emergencyContactRelation !== member.emergency_contact_relation
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setToast(null);

    try {
      await updateMember(member.member_id, formData);
      setToast({ type: "success", text: "Member updated successfully" });
      setIsEditing(false);
      
      // Notify parent of update
      if (onMemberUpdated) {
        const updatedMember: FitnessCenterMember = {
          ...member,
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth,
          phone_number: formData.phoneNumber,
          email: formData.email,
          city: formData.city,
          specific_location: formData.specificLocation,
          membership_plan_id: formData.membershipPlanId,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          emergency_contact_relation: formData.emergencyContactRelation,
        };
        onMemberUpdated(updatedMember);
      }
    } catch (error) {
      setToast({ type: "error", text: "Failed to update member" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: member.first_name,
      lastName: member.last_name,
      gender: member.gender,
      dateOfBirth: formatDateForInput(member.date_of_birth),
      phoneNumber: member.phone_number,
      email: member.email,
      city: member.city,
      specificLocation: member.specific_location,
      membershipPlanId: member.membership_plan_id,
      emergencyContactName: member.emergency_contact_name,
      emergencyContactPhone: member.emergency_contact_phone,
      emergencyContactRelation: member.emergency_contact_relation,
    });
    setIsEditing(false);
  };

  const fullName = `${formData.firstName} ${formData.lastName}`;
  const initials = `${formData.firstName[0] || ""}${formData.lastName[0] || ""}`.toUpperCase();
  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0;
  const billingStatus = member.latest_billing_status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 rounded-t-2xl">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Edit member"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold capitalize">{fullName}</h2>
              <div className="flex items-center gap-3 mt-1 text-violet-200">
                <span className="capitalize">{formData.gender}</span>
                <span>•</span>
                <span>{age} years old</span>
                <span>•</span>
                <span>ID: {member.member_id}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{member.total_check_ins}</div>
              <div className="text-xs text-violet-200">Total Check-ins</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{member.duration_months}</div>
              <div className="text-xs text-violet-200">Month Plan</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold capitalize ${
                billingStatus === "paid" ? "text-emerald-300" : 
                billingStatus === "overdue" ? "text-red-300" : "text-amber-300"
              }`}>
                {billingStatus}
              </div>
              <div className="text-xs text-violet-200">Billing Status</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Toast Message */}
          {toast && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              toast.type === "success"
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <p className={`text-sm font-medium ${
                toast.type === "success" ? "text-emerald-700" : "text-red-700"
              }`}>
                {toast.text}
              </p>
            </div>
          )}

          {/* Personal Information - Editable */}
          {isEditing && (
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Contact Information */}
          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Specific Location</label>
                  <input
                    type="text"
                    value={formData.specificLocation}
                    onChange={(e) => handleChange("specificLocation", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{formData.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{formData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg sm:col-span-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="font-medium text-slate-900">{formData.specificLocation}, {formData.city}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Membership Details */}
          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Membership Details
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Membership Plan</label>
                  <select
                    value={formData.membershipPlanId}
                    onChange={(e) => handleChange("membershipPlanId", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  >
                    {membershipPlans?.membershipPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.duration_months} month(s) - {plan.price} ETB
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Check-in Code</p>
                    <p className="font-medium text-slate-900 font-mono">{member.check_in_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Join Date</p>
                    <p className="font-medium text-slate-900">{formatDate(member.join_date)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Plan</p>
                    <p className="font-medium text-slate-900">{member.membership_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Check-in Code</p>
                    <p className="font-medium text-slate-900 font-mono">{member.check_in_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Join Date</p>
                    <p className="font-medium text-slate-900">{formatDate(member.join_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Referral Source</p>
                    <p className="font-medium text-slate-900">{member.referral_source_name}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Billing Information */}
          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Billing Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Plan Price</p>
                <p className="text-xl font-bold text-slate-900">{member.membership_price} ETB</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Latest Amount</p>
                <p className="text-xl font-bold text-slate-900">{member.latest_billing_amount} ETB</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Billing Date</p>
                <p className="text-lg font-semibold text-slate-900">{formatDate(member.latest_billing_date)}</p>
              </div>
            </div>
          </section>

          {/* Check-in History */}
          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Check-in Activity
            </h3>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Check-in</p>
                <p className="font-medium text-slate-900">{formatDateTime(member.last_check_in_time)}</p>
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Emergency Contact
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Relation</label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleChange("emergencyContactRelation", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 capitalize">{formData.emergencyContactName}</p>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full capitalize">
                        {formData.emergencyContactRelation}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{formData.emergencyContactPhone}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
