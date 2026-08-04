import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../config/firebase";
import type { LeaderboardEntry } from "../types/models";

const LEADERBOARD_LIMIT = 100;

export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "leaderboard"),
    orderBy("rank", "asc"),
    limit(LEADERBOARD_LIMIT)
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as LeaderboardEntry)),
    (error) => onError?.(error)
  );
}
