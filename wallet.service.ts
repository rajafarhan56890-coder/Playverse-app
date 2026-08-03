import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { httpsCallable, type HttpsCallableResult } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { Wallet, Transaction } from "../types/models";

export function subscribeToWallet(
  uid: string,
  callback: (wallet: Wallet | null) => void,
  onError?: (error: Error) => void
): () => void {
  return onSnapshot(
    doc(db, "wallets", uid),
    (snap) => callback(snap.exists() ? (snap.data() as Wallet) : null),
    (error) => onError?.(error)
  );
}

const TRANSACTIONS_PAGE_SIZE = 20;

export async function fetchTransactionsPage(
  uid: string,
  cursor?: QueryDocumentSnapshot
): Promise<{
  transactions: Transaction[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}> {
  const base = [
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(TRANSACTIONS_PAGE_SIZE),
  ] as const;

  const q = cursor
    ? query(collection(db, "transactions"), ...base, startAfter(cursor))
    : query(collection(db, "transactions"), ...base);

  const snap = await getDocs(q);
  const transactions = snap.docs.map((d) => d.data() as Transaction);

  return {
    transactions,
    lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.docs.length === TRANSACTIONS_PAGE_SIZE,
  };
}

export interface ClaimResult {
  success: boolean;
  amountCredited?: number;
  error?: string;
}

export async function claimDailyReward(): Promise<ClaimResult> {
  try {
    const callable = httpsCallable(functions, "claimDailyReward");
    const result: HttpsCallableResult = await callable();
    const data = result.data as { amountCredited: number };
    return { success: true, amountCredited: data.amountCredited };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}

/**
 * Client-side read to reflect "already claimed" state in the UI (e.g. grey
 * out a Claim button). This is a UX convenience only — the actual
 * enforcement happens server-side in the Cloud Function regardless of
 * what this returns, so it's safe even if the client is out of date.
 */
export async function hasClaimedToday(
  uid: string,
  type: Transaction["type"],
  sourceId: string
): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "transactions"),
    where("uid", "==", uid),
    where("type", "==", type),
    where("sourceId", "==", sourceId),
    where("createdAt", ">=", since),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Same as above but for one-time (non-daily) claims like offers/tasks. */
export async function hasClaimedEver(
  uid: string,
  type: Transaction["type"],
  sourceId: string
): Promise<boolean> {
  const q = query(
    collection(db, "transactions"),
    where("uid", "==", uid),
    where("type", "==", type),
    where("sourceId", "==", sourceId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * UI convenience check for weekly tasks — mirrors the server's UTC ISO
 * week reset (see `weekUTC()` in the functions project) closely enough
 * for display purposes: "within the last 7 days" is a reasonable client
 * approximation. The actual reset boundary is enforced server-side
 * regardless of what this returns.
 */
export async function hasClaimedThisWeek(
  uid: string,
  type: Transaction["type"],
  sourceId: string
): Promise<boolean> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "transactions"),
    where("uid", "==", uid),
    where("type", "==", type),
    where("sourceId", "==", sourceId),
    where("createdAt", ">=", since),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
