import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Game } from "../../types/models";

export default function GameDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { gameId } = route.params;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameDetails();
  }, [gameId]);

  const loadGameDetails = async () => {
    try {
      setIsLoading(true);
      const gameSnap = await getDoc(doc(db, "games", gameId));
      if (gameSnap.exists()) {
        setGame(gameSnap.data() as Game);
      }
    } catch (error) {
      console.error("Error loading game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayGame = () => {
    navigation.navigate("GameTasks", { gameId });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game not found</Text>
      </View>
    );
  }

  const difficultyColors = {
    easy: "#28a745",
    medium: "#ffc107",
    hard: "#dc3545",
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Game Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.gameTitle}>{game.name}</Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    difficultyColors[game.difficulty as keyof typeof difficultyColors],
                },
              ]}
            >
              <Text style={styles.badgeText}>{game.difficulty}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>100 Levels</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Game Description */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionTitle}>About This Game</Text>
        <Text style={styles.description}>{game.description}</Text>
      </View>

      {/* Rewards Breakdown */}
      <View style={styles.rewardsCard}>
        <Text style={styles.rewardsTitle}>💰 Earn Coins</Text>

        <View style={styles.rewardRow}>
          <View>
            <Text style={styles.rewardLabel}>Level 1</Text>
            <Text style={styles.rewardCoins}>10 coins</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View>
            <Text style={styles.rewardLabel}>Level 50</Text>
            <Text style={styles.rewardCoins}>500 coins</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View>
            <Text style={styles.rewardLabel}>Level 100</Text>
            <Text style={styles.rewardCoins}>1000 coins</Text>
          </View>
        </View>

        <View style={styles.totalRewardBox}>
          <Text style={styles.totalRewardLabel}>Maximum Total Earnings</Text>
          <Text style={styles.totalRewardValue}>
            {game.totalCoins?.toLocaleString() || "50,500"} coins
          </Text>
        </View>
      </View>

      {/* How to Play */}
      <View style={styles.howToPlayCard}>
        <Text style={styles.howToPlayTitle}>🎮 How to Play</Text>

        {game.name === "Flappy Birds" && (
          <View style={styles.steps}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Tap to make the bird flap</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Avoid hitting the pipes</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                Reach the required score to pass
              </Text>
            </View>
          </View>
        )}

        {game.name === "Coin Clicker" && (
          <View style={styles.steps}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Tap coins as quickly as possible</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Beat the time limit</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Collect all coins to earn rewards</Text>
            </View>
          </View>
        )}

        {game.name === "Color Match" && (
          <View style={styles.steps}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Look at the target color</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Tap the matching tile quickly</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Avoid making 3+ mistakes</Text>
            </View>
          </View>
        )}
      </View>

      {/* Requirements */}
      <View style={styles.requirementsCard}>
        <Text style={styles.requirementsTitle}>✓ Level Requirements</Text>
        <Text style={styles.requirementText}>
          Each level has a minimum score requirement based on the level number.
          Complete the score and coins will be awarded automatically.
        </Text>
        <View style={styles.requirementBox}>
          <Text style={styles.requirementLabel}>Score Formula:</Text>
          <Text style={styles.requirementValue}>Level Number × 10</Text>
          <Text style={styles.requirementExample}>
            Example: Level 15 requires score of 150
          </Text>
        </View>
      </View>

      {/* Play Button */}
      <Pressable style={styles.playButton} onPress={handlePlayGame}>
        <Text style={styles.playButtonText}>🎮 Start Playing</Text>
      </Pressable>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bgBase,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bgBase,
  },
  errorText: {
    fontSize: typeScale.body.fontSize,
    color: colors.danger,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  titleSection: {
    gap: spacing.md,
  },
  gameTitle: {
    fontSize: typeScale.h1.fontSize,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  badgeText: {
    fontSize: typeScale.caption.fontSize,
    fontWeight: "600",
    color: colors.textOnPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  descriptionCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionTitle: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typeScale.body.fontSize,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  rewardsCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardsTitle: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rewardLabel: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rewardCoins: {
    fontSize: typeScale.body.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  arrow: {
    fontSize: typeScale.h2.fontSize,
    color: colors.primary,
  },
  totalRewardBox: {
    backgroundColor: colors.primary + "15",
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  totalRewardLabel: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  totalRewardValue: {
    fontSize: typeScale.h2.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  howToPlayCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  howToPlayTitle: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  steps: {
    gap: spacing.md,
  },
  step: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  stepNumber: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "700",
    color: colors.primary,
    minWidth: 32,
  },
  stepText: {
    flex: 1,
    fontSize: typeScale.body.fontSize,
    color: colors.textSecondary,
  },
  requirementsCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsTitle: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  requirementText: {
    fontSize: typeScale.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  requirementBox: {
    backgroundColor: colors.primary + "15",
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  requirementLabel: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  requirementValue: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  requirementExample: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  playButtonText: {
    fontSize: typeScale.body.fontSize,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  footer: {
    height: spacing.xl,
  },
});
