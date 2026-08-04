import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  type AuthError,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../config/firebase";
import type { UserProfile } from "../types/models";

/**
 * Every Auth/Firestore error surfaced to the UI goes through this mapper so
 * screens never show a raw Firebase error code to the user.
 */
function mapAuthError(error: unknown): string {
  const code = (error as AuthError)?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  referralCode?: string;
}

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Registers a new user.
 *
 * IMPORTANT: this function does NOT create the Firestore `users` or `wallets`
 * documents itself — that is done server-side by the `onUserCreate` Cloud
 * Function triggered by Firebase Auth, guaranteeing every account gets
 * exactly one wallet starting at 0 coins with no client-side race condition
 * or way to fake a starting balance.
 *
 * If a referralCode was provided, it's applied via a callable function AFTER
 * the account (and therefore the wallet) exists, since the referral bonus
 * needs a wallet to credit.
 */
export async function registerWithEmail(
  input: RegisterInput
): Promise<AuthResult<User>> {
  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      input.email.trim(),
      input.password
    );

    await updateProfile(cred.user, { displayName: input.name.trim() });

    // Persist name/phone onto the profile doc the Cloud Function just created.
    // Retry briefly in case the trigger hasn't finished writing yet.
    await waitForProfileDoc(cred.user.uid);
    await updateDoc(doc(db, "users", cred.user.uid), {
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
    });

    if (input.referralCode?.trim()) {
      const applyReferral = httpsCallable(functions, "applyReferralBonus");
      try {
        await applyReferral({ referralCode: input.referralCode.trim() });
      } catch (referralError) {
        // Registration itself succeeded; a bad/expired referral code should
        // not block account creation. Surface it softly instead of throwing.
        console.warn("Referral bonus not applied:", referralError);
      }
    }

    return { success: true, data: cred.user };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
}

/** Polls briefly for the onUserCreate trigger to finish provisioning the profile doc. */
async function waitForProfileDoc(uid: string, attempts = 5): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) return;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(
    "Account created but profile setup is taking longer than expected. Please restart the app."
  );
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResult<User>> {
  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const profileRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(profileRef);
    if (snap.exists() && (snap.data() as UserProfile).status === "blocked") {
      await signOut(auth);
      return {
        success: false,
        error: "This account has been suspended. Contact support.",
      };
    }

    await updateDoc(profileRef, { lastLoginAt: serverTimestamp() }).catch(
      () => {
        /* non-fatal — login already succeeded */
      }
    );

    return { success: true, data: cred.user };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<AuthResult<null>> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function fetchUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}
