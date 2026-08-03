import { create } from "zustand";
import { subscribeToActiveOffers } from "../services/offers.service";
import type { Offer } from "../types/models";

interface OffersState {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  subscribe: () => () => void;
}

export const useOffersStore = create<OffersState>((set) => ({
  offers: [],
  isLoading: true,
  error: null,

  subscribe: () => {
    set({ isLoading: true, error: null });
    return subscribeToActiveOffers(
      (offers) => set({ offers, isLoading: false }),
      (error) => set({ error: error.message, isLoading: false })
    );
  },
}));
