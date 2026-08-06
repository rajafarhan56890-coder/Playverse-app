// Coins to Cash Conversion Utilities
// Handles all conversion calculations, formatting, and validation

export type PaymentMethod = "upi" | "phonepay" | "googlepay" | "bank_transfer";

export interface CoinExchangeInfo {
  coins: number;
  rate: number; // 1 coin = rate PKR
  rupees: number;
  charges: number;
  chargePercentage: number;
  netRupees: number;
}

export interface PaymentMethodInfo {
  method: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  processingTime: string;
  minWithdrawal: number;
  maxWithdrawal: number;
}

/**
 * Convert coins to rupees
 */
export const convertCoinsToRupees = (coins: number, rate: number): number => {
  return Math.floor(coins * rate);
};

/**
 * Convert rupees back to coins
 */
export const convertRupeesToCoins = (rupees: number, rate: number): number => {
  return Math.floor(rupees / rate);
};

/**
 * Calculate withdrawal with processing charges
 * Default charge: 2% (minimum 10 PKR)
 */
export const calculateWithdrawalAmount = (
  coins: number,
  rate: number,
  chargePercentage: number = 2
): CoinExchangeInfo => {
  const rupees = convertCoinsToRupees(coins, rate);
  const charges = Math.max(Math.floor(rupees * (chargePercentage / 100)), 10);
  const netRupees = Math.max(rupees - charges, 0);

  return {
    coins,
    rate,
    rupees,
    charges,
    chargePercentage,
    netRupees,
  };
};

/**
 * Get available payment methods with details
 */
export const getPaymentMethods = (): PaymentMethodInfo[] => [
  {
    method: "upi",
    name: "UPI",
    icon: "📱",
    description: "Unified Payments Interface",
    processingTime: "Instant - 5 minutes",
    minWithdrawal: 100,
    maxWithdrawal: 50000,
  },
  {
    method: "googlepay",
    name: "Google Pay",
    icon: "🔵",
    description: "Fast and secure",
    processingTime: "1 - 2 hours",
    minWithdrawal: 100,
    maxWithdrawal: 100000,
  },
  {
    method: "phonepay",
    name: "PhonePe",
    icon: "📲",
    description: "Quick transfers",
    processingTime: "2 - 5 minutes",
    minWithdrawal: 100,
    maxWithdrawal: 100000,
  },
  {
    method: "bank_transfer",
    name: "Bank Transfer",
    icon: "🏦",
    description: "Direct to your bank account",
    processingTime: "1 - 3 business days",
    minWithdrawal: 500,
    maxWithdrawal: 500000,
  },
];

/**
 * Get payment method info by type
 */
export const getPaymentMethodInfo = (
  method: PaymentMethod
): PaymentMethodInfo | null => {
  return getPaymentMethods().find((pm) => pm.method === method) || null;
};

/**
 * Validate payment identifier based on method type
 */
export const isValidPaymentIdentifier = (
  method: PaymentMethod,
  identifier: string
): { valid: boolean; error?: string } => {
  const cleaned = identifier.trim();

  switch (method) {
    case "upi":
      // UPI ID format: username@bankname (e.g., user@okhdfcbank)
      const upiPattern = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9]{3,}$/;
      if (!upiPattern.test(cleaned)) {
        return {
          valid: false,
          error: "Invalid UPI ID format (e.g., user@okhdfcbank)",
        };
      }
      return { valid: true };

    case "googlepay":
    case "phonepay":
      // Phone number: Pakistani format (+92XXXXXXXXXX or 03XXXXXXXXX)
      const phonePattern = /^(\+92|0)?3[0-9]{9}$/;
      const phoneDigits = cleaned.replace(/\D/g, "");

      if (!phonePattern.test(cleaned) && !phonePattern.test(`0${phoneDigits}`)) {
        return {
          valid: false,
          error: "Invalid phone number (e.g., 03XX-XXXXXXX)",
        };
      }
      return { valid: true };

    case "bank_transfer":
      // Bank account: 10-20 digits, alphanumeric
      const accountPattern = /^[a-zA-Z0-9]{10,20}$/;
      const accountCleaned = cleaned.replace(/\s/g, "");

      if (!accountPattern.test(accountCleaned)) {
        return {
          valid: false,
          error: "Invalid account number (10-20 characters)",
        };
      }
      return { valid: true };

    default:
      return { valid: false, error: "Unknown payment method" };
  }
};

/**
 * Format payment identifier for display
 * Shows masked version for privacy
 */
export const formatPaymentIdentifier = (
  method: PaymentMethod,
  identifier: string
): string => {
  const cleaned = identifier.trim();

  switch (method) {
    case "upi":
      // Show UPI partially: user***@bank
      const [username, bank] = cleaned.split("@");
      if (username.length > 3) {
        return `${username.substring(0, 3)}***@${bank}`;
      }
      return cleaned;

    case "googlepay":
    case "phonepay":
      // Show phone with mask: +92***XXXX
      const digits = cleaned.replace(/\D/g, "");
      return `+92***${digits.slice(-4)}`;

    case "bank_transfer":
      // Show account with mask: ****XXXX
      const account = cleaned.replace(/\s/g, "");
      return `****${account.slice(-4)}`;

    default:
      return cleaned;
  }
};

/**
 * Format rupees for display with currency symbol
 */
export const formatRupees = (amount: number, compact: boolean = false): string => {
  if (compact) {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
  }
  return `₹${amount.toLocaleString("en-PK")}`;
};

/**
 * Get minimum withdrawal in coins
 */
export const getMinimumWithdrawalCoins = (
  rate: number,
  minRupees: number = 100
): number => {
  return Math.ceil(minRupees / rate);
};

/**
 * Check if user can withdraw
 */
export const canWithdraw = (
  coins: number,
  rate: number,
  method: PaymentMethod,
  minRupees?: number
): { canWithdraw: boolean; reason?: string; minCoins?: number } => {
  const methodInfo = getPaymentMethodInfo(method);
  if (!methodInfo) {
    return { canWithdraw: false, reason: "Invalid payment method" };
  }

  const minCoins = getMinimumWithdrawalCoins(rate, minRupees || methodInfo.minWithdrawal);
  const maxRupees = methodInfo.maxWithdrawal;
  const maxCoins = convertRupeesToCoins(maxRupees, rate);

  if (coins < minCoins) {
    return {
      canWithdraw: false,
      reason: `Minimum ${formatRupees(minRupees || methodInfo.minWithdrawal)} (${minCoins} coins)`,
      minCoins,
    };
  }

  if (coins > maxCoins) {
    return {
      canWithdraw: false,
      reason: `Maximum ${formatRupees(maxRupees)} per withdrawal`,
    };
  }

  return { canWithdraw: true };
};

/**
 * Calculate available balance after withdrawal
 */
export const calculateAvailableBalance = (
  totalCoins: number,
  rate: number
): {
  coins: number;
  rupees: number;
  canWithdraw: boolean;
  minCoinsNeeded: number;
} => {
  const minCoinsNeeded = getMinimumWithdrawalCoins(rate);
  const availableCoins = Math.max(totalCoins - minCoinsNeeded, 0);
  const availableRupees = convertCoinsToRupees(availableCoins, rate);

  return {
    coins: availableCoins,
    rupees: availableRupees,
    canWithdraw: availableCoins >= minCoinsNeeded,
    minCoinsNeeded,
  };
};

/**
 * Format withdrawal summary for display
 */
export const getWithdrawalSummary = (
  coins: number,
  rate: number,
  chargePercentage?: number
): string => {
  const exchange = calculateWithdrawalAmount(coins, rate, chargePercentage);
  return `${coins} coins → ${formatRupees(exchange.rupees)} - ${formatRupees(exchange.charges)} fee = ${formatRupees(exchange.netRupees)}`;
};

/**
 * Get withdrawal status badge info
 */
export const getWithdrawalStatusInfo = (
  status: "pending" | "approved" | "rejected"
): {
  status: string;
  color: string;
  icon: string;
  message: string;
} => {
  const statusMap = {
    pending: {
      status: "Pending",
      color: "#FFA500",
      icon: "⏳",
      message: "Your withdrawal is under review",
    },
    approved: {
      status: "Approved",
      color: "#4CAF50",
      icon: "✅",
      message: "Your withdrawal has been processed",
    },
    rejected: {
      status: "Rejected",
      color: "#F44336",
      icon: "❌",
      message: "Your withdrawal was declined",
    },
  };

  return statusMap[status];
};

/**
 * Calculate days until withdrawal completion
 */
export const getWithdrawalTimeRemaining = (
  status: "pending" | "approved" | "rejected",
  method: PaymentMethod
): { days: number; text: string } => {
  const methodInfo = getPaymentMethodInfo(method);
  if (!methodInfo) return { days: 0, text: "Unknown" };

  const timeStr = methodInfo.processingTime;
  if (timeStr.includes("Instant")) return { days: 0, text: "1-5 minutes" };
  if (timeStr.includes("minutes")) return { days: 0, text: "5-10 minutes" };
  if (timeStr.includes("hours")) return { days: 0, text: "1-2 hours" };
  if (timeStr.includes("business days")) return { days: 3, text: "1-3 days" };

  return { days: 1, text: "1-2 days" };
};

/**
 * Export conversion rate utility for admin settings
 */
export const COIN_RATE_PRESET = {
  conservative: 0.25, // 1 coin = 0.25 PKR
  standard: 0.5, // 1 coin = 0.5 PKR
  generous: 0.75, // 1 coin = 0.75 PKR
  premium: 1.0, // 1 coin = 1 PKR
};

export const getPresetName = (rate: number): string => {
  const preset = Object.entries(COIN_RATE_PRESET).find(([_, value]) => value === rate);
  return preset ? preset[0].toUpperCase() : "CUSTOM";
};
