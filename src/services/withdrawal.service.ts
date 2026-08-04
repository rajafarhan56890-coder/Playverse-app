import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { Withdrawal } from "../types/models";

export interface WithdrawalRequestInput {
  amount: number;
  payoutMethod: "easypaisa" | "jazzcash";
  accountNumber: string;
  accountName: string;
}

export interface WithdrawalResult {
  success: boolean;
  withdrawalId?: string;
  error?: string;
}

export async function submitWithdrawalRequest(
  input: WithdrawalRequestInput
): Promise<WithdrawalResult> {
  try {
    const callable = httpsCallable(functions, "requestWithdrawal");
    const result = await callable(input);
    const data = result.data as { withdrawalId: string };
    return { success: true, withdrawalId: data.withdrawalId };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}

export function subscribeToWithdrawalHistory(
  uid: string,
  callback: (withdrawals: Withdrawal[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "withdrawals"),
    where("uid", "==", uid),
    orderBy("requestedAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as Withdrawal)),
    (error) => onError?.(error)
  );
}
