import { create } from "zustand";
import { subscribeToLeaderboard } from "../services/leaderboard.service";
import type { LeaderboardEntry } from "../types/models";

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  subscribe: () => () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  isLoading: true,
  error: null,

  subscribe: () => {
    set({ isLoading: true, error: null });
    return subscribeToLeaderboard(
      (entries) => set({ entries, isLoading: false }),
      (error) => set({ error: error.message, isLoading: false })
    );
  },
}));
