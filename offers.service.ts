import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { Offer } from "../types/models";
import type { ClaimResult } from "./wallet.service";

export function subscribeToActiveOffers(
  callback: (offers: Offer[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "offers"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as Offer)),
    (error) => onError?.(error)
  );
}

export async function completeTask(offerId: string): Promise<ClaimResult> {
  try {
    const callable = httpsCallable(functions, "completeTask");
    const result = await callable({ offerId });
    const data = result.data as { amountCredited: number };
    return { success: true, amountCredited: data.amountCredited };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}
