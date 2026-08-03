import { create } from "zustand";
import { subscribeToWallet } from "../services/wallet.service";
import type { Wallet } from "../types/models";

interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  subscribe: (uid: string) => () => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  isLoading: true,
  error: null,

  subscribe: (uid: string) => {
    set({ isLoading: true, error: null });
    return subscribeToWallet(
      uid,
      (wallet) => set({ wallet, isLoading: false }),
      (error) => set({ error: error.message, isLoading: false })
    );
  },

  reset: () => set({ wallet: null, isLoading: true, error: null }),
}));
