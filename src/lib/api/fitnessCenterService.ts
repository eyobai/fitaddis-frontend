/**
 * @deprecated This file is kept for backward compatibility.
 * Please import from '@/lib/api' or specific modules like '@/lib/api/members' instead.
 * 
 * New structure:
 * - @/lib/api/types.ts - All type definitions
 * - @/lib/api/auth.ts - Authentication APIs
 * - @/lib/api/members.ts - Member-related APIs
 * - @/lib/api/visitors.ts - Visitor APIs
 * - @/lib/api/billing.ts - Billing APIs
 * - @/lib/api/membership-plans.ts - Membership plan APIs
 * - @/lib/api/notifications.ts - Notification APIs
 * - @/lib/api/sms.ts - SMS APIs
 * - @/lib/api/config.ts - API configuration
 */

// Re-export everything from the new modular structure
export * from "./index";
