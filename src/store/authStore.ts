import { create } from "zustand";
import { doc, onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../config/firebase";
import { subscribeToAuthState } from "../services/auth.service";
import type { UserProfile } from "../types/models";

interface AuthState {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean; // true until the very first auth check resolves
  isBlocked: boolean;
  init: () => () => void; // call once at app root; returns unsubscribe
}

let profileUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  isLoading: true,
  isBlocked: false,

  init: () => {
    const unsubscribeAuth = subscribeToAuthState((user) => {
      set({ firebaseUser: user, isLoading: false });

      profileUnsubscribe?.();
      profileUnsubscribe = null;

      if (!user) {
        set({ profile: null, isBlocked: false });
        return;
      }

      // Real-time profile subscription — status flips to "blocked" or level
      // changes from the admin panel reflect instantly without a re-login.
      profileUnsubscribe = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          if (!snap.exists()) return;
          const profile = snap.data() as UserProfile;
          set({ profile, isBlocked: profile.status === "blocked" });
        },
        (error) => {
          console.error("Profile subscription error:", error);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      profileUnsubscribe?.();
    };
  },
}));
