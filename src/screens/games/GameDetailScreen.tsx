import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuthStore } from "../../store/authStore";
import { completeGame } from "../../services/games.service";
import { hasClaimedToday } from "../../services/wallet.service";
import { tryOpenDeepLink } from "../../utils/deepLink";
import ScreenLoader from "../../components/common/ScreenLoader";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Game } from "../../types/models";
import type { GamesStackParamList } from "../../navigation/GamesNavigator";

type DetailRoute = RouteProp<GamesStackParamList, "GameDetail">;

export default function GameDetailScreen() {
  const route = useRoute<DetailRoute>();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const { gameId } = route.params;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimedToday, setIsClaimedToday] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  async function handlePlay() {
    if (!game) return;
    setIsLaunching(true);
    const openedNatively = await tryOpenDeepLink(game);
    setIsLaunching(false);
    if (!openedNatively) {
      setShowWebView(true);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const snap = await getDoc(doc(db, "games", gameId));
      if (!cancelled && snap.exists()) {
        setGame(snap.data() as Game);
      }
      if (firebaseUser) {
        const claimed = await hasClaimedToday(firebaseUser.uid, "game_reward", gameId);
        if (!cancelled) setIsClaimedToday(claimed);
      }
      if (!cancelled) setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [gameId, firebaseUser]);

  async function handleClaim() {
    setMessage(null);
    setIsClaiming(true);
    const result = await completeGame(gameId);
    setIsClaiming(false);

    if (result.success) {
      setIsClaimedToday(true);
      setMessage({ text: `+${result.amountCredited} coins credited!`, isError: false });
    } else {
      setMessage({ text: result.error ?? "Could not claim reward.", isError: true });
    }
  }

  if (isLoading) return <ScreenLoader />;

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>This game could not be found.</Text>
      </View>
    );
  }

  if (showWebView) {
    return (
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: game.gameURL }}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.primary} />
          )}
          onError={() => Linking.openURL(game.gameURL)}
        />
        <Pressable style={styles.closeButton} onPress={() => setShowWebView(false)}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {game.imageURL && !imageFailed ? (
        <Image
          source={{ uri: game.imageURL }}
          style={styles.hero}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={[styles.hero, styles.heroFallback]}>
          <Text style={styles.heroFallbackText}>{game.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.category}>{game.category}</Text>
        <Text style={styles.name}>{game.name}</Text>
        <Text style={styles.description}>{game.description}</Text>

        <View style={styles.rewardBox}>
          <Text style={styles.rewardLabel}>Reward</Text>
          <Text style={styles.rewardValue}>+{game.reward.toLocaleString()} coins</Text>
        </View>

        <Pressable style={styles.playButton} onPress={handlePlay} disabled={isLaunching}>
          <Text style={styles.playButtonText}>{isLaunching ? "Opening…" : "Play now"}</Text>
        </Pressable>

        <Pressable
          style={[
            styles.claimButton,
            (isClaiming || isClaimedToday) && styles.claimButtonDisabled,
          ]}
          onPress={handleClaim}
          disabled={isClaiming || isClaimedToday}
        >
          {isClaiming ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.claimButtonText}>
              {isClaimedToday ? "Claimed today" : "Claim reward"}
            </Text>
          )}
        </Pressable>

        {message && (
          <Text style={[styles.message, { color: message.isError ? colors.danger : colors.success }]}>
            {message.text}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  notFound: { ...typeScale.body, color: colors.textSecondary, padding: spacing.lg },
  hero: { width: "100%", height: 200, backgroundColor: colors.bgElevated2 },
  heroFallback: { alignItems: "center", justifyContent: "center" },
  heroFallbackText: { ...typeScale.h1, color: colors.primary },
  body: { padding: spacing.lg },
  category: { ...typeScale.caption, color: colors.textMuted, textTransform: "uppercase" },
  name: { ...typeScale.h2, color: colors.textPrimary, marginTop: spacing.xs },
  description: { ...typeScale.body, color: colors.textSecondary, marginTop: spacing.sm },
  rewardBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  rewardLabel: { ...typeScale.caption, color: colors.textSecondary },
  rewardValue: { ...typeScale.h3, color: colors.coin, marginTop: 2 },
  playButton: {
    backgroundColor: colors.bgElevated2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  playButtonText: { ...typeScale.bodyMedium, color: colors.textPrimary },
  claimButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  claimButtonDisabled: { opacity: 0.5 },
  claimButtonText: { ...typeScale.bodyMedium, color: colors.textOnPrimary },
  message: { ...typeScale.caption, textAlign: "center", marginTop: spacing.md },
  webViewContainer: { flex: 1, backgroundColor: colors.bgBase },
  webView: { flex: 1 },
  closeButton: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  closeButtonText: { ...typeScale.caption, color: colors.textPrimary },
});
