// Types for PlayVerse App

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "admin";
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  totalReferrals: number;
  referralBonus: number;
  totalEarned: number;
  totalWithdrawn: number;
}

// Game Types
export interface Game {
  id: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  category: "action" | "puzzle" | "casual";
  difficulty: "easy" | "medium" | "hard";
  totalCoins: number;
  totalLevels: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameLevel {
  levelNumber: number;
  coins: number;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GameTask extends GameLevel {
  completed: boolean;
  locked: boolean;
}

export interface UserGameProgress {
  gameId: string;
  completedLevels: number[];
  totalCoinsEarned: number;
  lastCompletedLevel: number;
  lastCompletedAt: Date;
}

// Wallet & Transaction Types
export interface Wallet {
  coins: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  lastUpdatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "game_reward" | "referral_bonus" | "withdrawal" | "conversion";
  gameId?: string;
  levelNumber?: number;
  coinsAwarded?: number;
  coinsDeducted?: number;
  amount?: number; // For cash transactions
  description: string;
  walletBalance: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: "mobile" | "bank" | "wallet";
  enabled: boolean;
  minPayout: number;
  maxPayout: number;
  fee: number; // Processing fee in percentage
  fields?: {
    label: string;
    placeholder: string;
    type: "text" | "email" | "phone";
  }[];
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  coins: number;
  amount: number; // In PKR
  paymentMethod: string;
  paymentDetails: Record<string, string>;
  fee: number;
  netAmount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

// Referral Types
export interface ReferralCode {
  code: string;
  userId: string;
  createdAt: Date;
  usedCount: number;
  tier1Count: number; // Direct referrals
  tier2Count: number; // Friends of friends
  totalBonus: number;
}

export interface ReferralTransaction {
  id: string;
  referrerId: string;
  referredUserId: string;
  bonusCoins: number;
  tier: 1 | 2;
  timestamp: Date;
}

// Admin Types
export interface AdminLog {
  id: string;
  adminId: string;
  action:
    | "UPDATE_SETTINGS"
    | "UPDATE_PAYMENT_METHODS"
    | "ADD_GAME"
    | "EDIT_GAME"
    | "DELETE_GAME"
    | "APPROVE_WITHDRAWAL"
    | "REJECT_WITHDRAWAL"
    | "VIEW_USER"
    | "VIEW_TRANSACTIONS";
  targetId?: string;
  changes?: Record<string, any>;
  timestamp: Date;
}

// Global Settings
export interface GlobalSettings {
  coinToCurrencyRate: number; // 1 PKR = X coins
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  dailyRewardAmount: number;
  referralBonusReferrer: number;
  referralBonusReferred: number;
  referralTier2Bonus: number;
  gameRewardMultiplier: number;
  processingFeePercent: number;
  maxDailyWithdrawals: number;
  updatedBy: string;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// For completeGameLevel cloud function
export interface CompleteGameLevelRequest {
  gameId: string;
  levelNumber: number;
}

export interface CompleteGameLevelResponse {
  success: boolean;
  coinsAwarded?: number;
  totalCoins?: number;
  error?: string;
}

// For withdrawal processing
export interface ProcessWithdrawalRequest {
  withdrawalRequestId: string;
  status: "approved" | "rejected";
  notes?: string;
}

// For payment method updates
export interface UpdatePaymentMethodsRequest {
  methods: PaymentMethod[];
}

// For settings updates
export interface UpdateGameSettingsRequest {
  settings: Partial<GlobalSettings>;
}
