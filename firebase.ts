import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
// @ts-expect-error - no official types for this subpath, this is the documented RN pattern
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// All values come from environment variables — never hardcode Firebase keys
// in source. Populate these in a .env file (see .env.example) and load them
// with `expo-constants` / `react-native-dotenv` per your Expo setup.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function assertConfigPresent() {
  const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
  if (missing.length > 0) {
    throw new Error(
      `PlayVerse: missing Firebase config values: ${missing
        .map(([k]) => k)
        .join(", ")}. Check your .env file against .env.example.`
    );
  }
}
assertConfigPresent();

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth with AsyncStorage persistence must only run once per app
// instance, otherwise Firebase throws on hot reload — guard with getApps().
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}
export { auth };

export const db = (() => {
  try {
    return initializeFirestore(app, { experimentalForceLongPolling: false });
  } catch {
    return getFirestore(app);
  }
})();

export const storage = getStorage(app);
export const functions = getFunctions(app);
