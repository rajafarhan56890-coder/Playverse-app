import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { Game } from "../types/models";
import type { ClaimResult } from "./wallet.service";

export function subscribeToActiveGames(
  callback: (games: Game[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "games"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as Game)),
    (error) => onError?.(error)
  );
}

export async function completeGame(gameId: string): Promise<ClaimResult> {
  try {
    const callable = httpsCallable(functions, "completeGame");
    const result = await callable({ gameId });
    const data = result.data as { amountCredited: number };
    return { success: true, amountCredited: data.amountCredited };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}
