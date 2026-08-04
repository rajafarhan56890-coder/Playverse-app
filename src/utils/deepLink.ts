import { Linking } from "react-native";
import type { Game } from "../types/models";

/**
 * Attempts to launch a game via its native deep link (e.g. a custom URL
 * scheme that opens an already-installed app). Returns true if the OS
 * successfully handed off to another app. Callers should fall back to the
 * in-app WebView (`gameURL`) when this returns false — which covers both
 * "no deepLinkURL configured" and "device can't handle this scheme"
 * (app not installed).
 */
export async function tryOpenDeepLink(game: Game): Promise<boolean> {
  if (!game.deepLinkURL) return false;
  try {
    const canOpen = await Linking.canOpenURL(game.deepLinkURL);
    if (!canOpen) return false;
    await Linking.openURL(game.deepLinkURL);
    return true;
  } catch {
    return false;
  }
}
