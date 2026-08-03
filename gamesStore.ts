import { create } from "zustand";
import { subscribeToActiveGames } from "../services/games.service";
import type { Game } from "../types/models";

interface GamesState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  subscribe: () => () => void;
}

export const useGamesStore = create<GamesState>((set) => ({
  games: [],
  isLoading: true,
  error: null,

  subscribe: () => {
    set({ isLoading: true, error: null });
    return subscribeToActiveGames(
      (games) => set({ games, isLoading: false }),
      (error) => set({ error: error.message, isLoading: false })
    );
  },
}));
