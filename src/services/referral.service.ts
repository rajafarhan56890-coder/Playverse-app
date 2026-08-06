// Referral and Invitation Code System
// Handles referral tracking, bonus distribution, and invitation code generation

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { Referral } from "../types/models";

export interface ReferralStats {
  totalReferrals: number;
  totalBonusEarned: number;
  tier2Count: number;
  recentReferrals: Referral[];
}

export interface InvitationInfo {
  code: string;
  createdAt: Date;
  expiresAt: Date | null;
  usedCount: number;
  maxUses: number | null;
  bonusAmount: number;
}

export interface ApplyReferralResult {
  success: boolean;
  referrerBonus?: number;
  referredBonus?: number;
  message?: string;
  error?: string;
}

/**
 * Generate unique referral/invitation code
 * Format: FIRST3_UID6_RANDOM4 (e.g., RAJ_ABCDEF_K9M2)
 */
export const generateReferralCode = (name: string, uid: string): string => {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const uidPart = uid.substring(0, 6).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePrefix}${uidPart}${random}`;
};

/**
 * Validate referral/invitation code format
 */
export const isValidReferralCode = (code: string): boolean => {
  const pattern = /^[A-Z0-9]{3}[A-Z0-9]{6}[A-Z0-9]{4}$/;
  return pattern.test(code) && code.length === 13;
};

/**
 * Apply referral code when user registers
 * Calls Cloud Function for atomic bonus distribution
 */
export async function applyReferralCode(
  referralCode: string
): Promise<ApplyReferralResult> {
  try {
    // Validate code format
    if (!isValidReferralCode(referralCode)) {
      return {
        success: false,
        error: "Invalid referral code format",
      };
    }

    const callable = httpsCallable(functions, "applyReferralBonus");
    const result = await callable({ referralCode });
    const data = result.data as {
      success: boolean;
      referrerBonus?: number;
      referredBonus?: number;
      message?: string;
    };

    return {
      success: data.success,
      referrerBonus: data.referrerBonus,
      referredBonus: data.referredBonus,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: mapFunctionsError(error),
    };
  }
}

/**
 * Get user's referral statistics
 */
export async function getUserReferralStats(
  uid: string
): Promise<ReferralStats | null> {
  try {
    // Get all referrals where this user is the referrer
    const q = query(
      collection(db, "referrals"),
      where("referrerUid", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    const referrals = snap.docs.map((d) => d.data() as Referral);

    const totalReferrals = referrals.length;
    const totalBonusEarned = referrals.reduce(
      (sum, ref) => sum + ref.referrerBonus + ref.tier2Bonus,
      0
    );
    const tier2Count = referrals.filter((ref) => ref.tier2Bonus > 0).length;

    return {
      totalReferrals,
      totalBonusEarned,
      tier2Count,
      recentReferrals: referrals.slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return null;
  }
}

/**
 * Subscribe to referral changes in real-time
 */
export function subscribeToReferrals(
  uid: string,
  callback: (referrals: Referral[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "referrals"),
    where("referrerUid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => d.data() as Referral));
    },
    (error) => onError?.(error)
  );
}

/**
 * Check if user was referred (has referrer)
 */
export async function getUserReferrer(uid: string): Promise<string | null> {
  try {
    const snap = await getDocs(
      query(
        collection(db, "referrals"),
        where("referredUid", "==", uid),
        limit(1)
      )
    );

    if (snap.empty) return null;

    const referral = snap.docs[0].data() as Referral;
    return referral.referrerUid;
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return null;
  }
}

/**
 * Format referral code for display with dashes
 * E.g., RAJABCD1234 → RAJ-ABC-D123-4
 */
export const formatReferralCode = (code: string): string => {
  if (code.length !== 13) return code;
  return `${code.substring(0, 3)}-${code.substring(3, 6)}-${code.substring(6, 10)}-${code.substring(10)}`;
};

/**
 * Copy referral code to clipboard
 */
export const copyReferralCodeToClipboard = async (code: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (error) {
    console.error("Failed to copy code:", error);
    return false;
  }
};

/**
 * Generate sharing message for referral
 */
export const generateReferralShareMessage = (
  userName: string,
  referralCode: string,
  bonusAmount: number
): string => {
  return `Join PlayVerse with my referral code ${referralCode}! 🎮 We both get ${bonusAmount} coins bonus! 🎁 Download now: https://playverse.app`;
};

/**
 * Share referral via different platforms
 */
export const shareReferralCode = (
  platform: "whatsapp" | "telegram" | "twitter" | "copy",
  code: string,
  userName: string = "Friend",
  bonusAmount: number = 100
) => {
  const message = generateReferralShareMessage(userName, code, bonusAmount);
  const encodedMessage = encodeURIComponent(message);

  const urls = {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    telegram: `https://t.me/share/url?url=https://playverse.app&text=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
    copy: "",
  };

  if (platform === "copy") {
    return copyReferralCodeToClipboard(code);
  }

  const url = urls[platform];
  if (url) {
    window.open(url, "_blank");
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
};
