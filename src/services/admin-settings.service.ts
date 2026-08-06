// Admin Settings Service
// Handles configuration for coin rates, payment methods, and app settings

import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { GlobalSettings } from "../types/models";

export interface AdminSettingsUpdateRequest {
  coinToCurrencyRate?: number;
  minWithdrawalAmount?: number;
  maxWithdrawalAmount?: number;
  dailyRewardAmount?: number;
  referralBonusReferrer?: number;
  referralBonusReferred?: number;
  referralTier2Bonus?: number;
  gameRewardMultiplier?: number;
}

export interface AdminSettingsResponse {
  success: boolean;
  data?: GlobalSettings;
  error?: string;
}

export interface PaymentMethodConfig {
  id: string;
  method: "upi" | "phonepay" | "googlepay" | "bank_transfer";
  name: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  processingTimeHours: number;
  description: string;
}

/**
 * Get current global settings
 */
export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    if (!settingsDoc.exists()) {
      console.warn("Global settings document does not exist");
      return null;
    }

    return settingsDoc.data() as GlobalSettings;
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return null;
  }
}

/**
 * Subscribe to global settings changes in real-time
 */
export function subscribeToGlobalSettings(
  callback: (settings: GlobalSettings | null) => void,
  onError?: (error: Error) => void
): () => void {
  return onSnapshot(
    doc(db, "settings", "global"),
    (snap) => {
      callback(snap.exists() ? (snap.data() as GlobalSettings) : null);
    },
    (error) => onError?.(error)
  );
}

/**
 * Update global settings (Admin only)
 */
export async function updateGlobalSettings(
  data: AdminSettingsUpdateRequest
): Promise<AdminSettingsResponse> {
  try {
    const callable = httpsCallable(functions, "updateGlobalSettings");
    const result = await callable(data);
    const responseData = result.data as {
      success: boolean;
      data?: GlobalSettings;
    };

    return {
      success: responseData.success,
      data: responseData.data,
    };
  } catch (error) {
    return {
      success: false,
      error: mapFunctionsError(error),
    };
  }
}

/**
 * Update coin to currency rate (Admin only)
 */
export async function updateCoinRate(rate: number): Promise<AdminSettingsResponse> {
  if (rate <= 0) {
    return {
      success: false,
      error: "Rate must be greater than 0",
    };
  }

  return updateGlobalSettings({ coinToCurrencyRate: rate });
}

/**
 * Update referral bonuses (Admin only)
 */
export async function updateReferralBonuses(
  referrerBonus: number,
  referredBonus: number,
  tier2Bonus: number = 0
): Promise<AdminSettingsResponse> {
  if (referrerBonus < 0 || referredBonus < 0 || tier2Bonus < 0) {
    return {
      success: false,
      error: "Bonuses cannot be negative",
    };
  }

  return updateGlobalSettings({
    referralBonusReferrer: referrerBonus,
    referralBonusReferred: referredBonus,
    referralTier2Bonus: tier2Bonus,
  });
}

/**
 * Update withdrawal limits (Admin only)
 */
export async function updateWithdrawalLimits(
  minAmount: number,
  maxAmount: number
): Promise<AdminSettingsResponse> {
  if (minAmount <= 0 || maxAmount <= 0 || minAmount > maxAmount) {
    return {
      success: false,
      error: "Invalid withdrawal limits",
    };
  }

  return updateGlobalSettings({
    minWithdrawalAmount: minAmount,
    maxWithdrawalAmount: maxAmount,
  });
}

/**
 * Update game reward multiplier (Admin only)
 */
export async function updateGameRewardMultiplier(
  multiplier: number
): Promise<AdminSettingsResponse> {
  if (multiplier <= 0) {
    return {
      success: false,
      error: "Multiplier must be greater than 0",
    };
  }

  return updateGlobalSettings({ gameRewardMultiplier: multiplier });
}

/**
 * Get all enabled payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  try {
    // For now, return default payment methods
    // In future, this can be fetched from Firestore
    return [
      {
        id: "upi-001",
        method: "upi",
        name: "UPI",
        enabled: true,
        minAmount: 100,
        maxAmount: 50000,
        processingTimeHours: 0,
        description: "Unified Payments Interface - Instant",
      },
      {
        id: "gp-001",
        method: "googlepay",
        name: "Google Pay",
        enabled: true,
        minAmount: 100,
        maxAmount: 100000,
        processingTimeHours: 1,
        description: "Fast and secure payments",
      },
      {
        id: "pp-001",
        method: "phonepay",
        name: "PhonePe",
        enabled: true,
        minAmount: 100,
        maxAmount: 100000,
        processingTimeHours: 0,
        description: "Quick mobile transfers",
      },
      {
        id: "bank-001",
        method: "bank_transfer",
        name: "Bank Transfer",
        enabled: true,
        minAmount: 500,
        maxAmount: 500000,
        processingTimeHours: 48,
        description: "Direct bank account transfer",
      },
    ];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
}

/**
 * Enable/Disable payment method (Admin only)
 */
export async function updatePaymentMethod(
  methodId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const callable = httpsCallable(functions, "updatePaymentMethod");
    const result = await callable({ methodId, enabled });
    const data = result.data as { success: boolean };

    return { success: data.success };
  } catch (error) {
    return {
      success: false,
      error: mapFunctionsError(error),
    };
  }
}

/**
 * Get audit log of settings changes
 */
export async function getSettingsAuditLog(limit: number = 50): Promise<any[]> {
  try {
    // This would be implemented if audit logging is added to backend
    return [];
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return [];
  }
}

/**
 * Validate admin access before allowing changes
 */
export async function validateAdminAccess(): Promise<{ hasAccess: boolean; role?: string }> {
  try {
    const callable = httpsCallable(functions, "validateAdminAccess");
    const result = await callable();
    const data = result.data as { hasAccess: boolean; role?: string };

    return data;
  } catch (error) {
    return {
      hasAccess: false,
    };
  }
}

/**
 * Get suggested coin rate based on market conditions
 */
export function getSuggestedCoinRate(): {
  rate: number;
  reason: string;
  preset: string;
} {
  // This could be enhanced to fetch from API
  // For now, return standard rate
  return {
    rate: 0.5,
    reason: "Standard market rate",
    preset: "STANDARD",
  };
}

/**
 * Calculate revenue impact of rate change
 */
export function calculateRateImpact(
  oldRate: number,
  newRate: number,
  activeUsers: number,
  averageWithdrawalCoins: number
): {
  rateChange: number;
  percentChange: number;
  revenueImpact: string;
  estimatedMonthlyImpact: number;
} {
  const changePercentage = ((newRate - oldRate) / oldRate) * 100;
  const monthlyWithdrawals = activeUsers * averageWithdrawalCoins;
  const oldRevenue = monthlyWithdrawals * oldRate;
  const newRevenue = monthlyWithdrawals * newRate;
  const impact = newRevenue - oldRevenue;

  return {
    rateChange: newRate - oldRate,
    percentChange: changePercentage,
    revenueImpact: impact >= 0 ? `+${impact}` : `${impact}`,
    estimatedMonthlyImpact: Math.floor(impact),
  };
}
