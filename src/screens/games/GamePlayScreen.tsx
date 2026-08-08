import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { useWalletStore } from "../../store/walletStore";
import { completeGameLevel } from "../../services/games.service";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import FlappyBirdsGame from "./games/FlappyBirdsGame";
import CoinClickerGame from "./games/CoinClickerGame";
import ColorMatchGame from "./games/ColorMatchGame";

export default function GamePlayScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const wallet = useWalletStore((s) => s.wallet);

  const { gameId, levelNumber, coinsReward, gameName } = route.params;

  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGameComplete = async (finalScore: number) => {
    setScore(finalScore);
    setIsGameOver(true);

    // Check if score meets requirement (simple: score >= levelNumber * 10)
    const requiredScore = levelNumber * 10;
    if (finalScore >= requiredScore) {
      // Auto claim after 2 seconds
      setTimeout(() => {
        handleClaimReward();
      }, 2000);
    }
  };

  const handleClaimReward = async () => {
    setIsSubmitting(true);
    try {
      const result = await completeGameLevel(gameId, levelNumber);
      if (result.success) {
        setMessage(`🎉 +${coinsReward} coins awarded!`);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setMessage("❌ " + (result.error || "Failed to claim reward"));
      }
    } catch (error) {
      setMessage("❌ Error claiming reward");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGame = () => {
    switch (gameId) {
      case "flappy-birds":
        return (
          <FlappyBirdsGame
            levelNumber={levelNumber}
            onGameComplete={handleGameComplete}
          />
        );
      case "coin-clicker":
        return (
          <CoinClickerGame
            levelNumber={levelNumber}
            onGameComplete={handleGameComplete}
          />
        );
      case "color-match":
        return (
          <ColorMatchGame
            levelNumber={levelNumber}
            onGameComplete={handleGameComplete}
          />
        );
      default:
        return <Text>Game not found</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Game Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.gameTitle}>{gameName}</Text>
          <Text style={styles.levelText}>Level {levelNumber}</Text>
        </View>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>+{coinsReward}</Text>
          <Text style={styles.coinText}>coins</Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>{renderGame()}</View>

      {/* Game Over Modal */}
      <Modal visible={isGameOver} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {score >= levelNumber * 10 ? "🎉 Level Complete!" : "❌ Try Again"}
            </Text>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.requiredScore}>
                Required: {levelNumber * 10}
              </Text>
            </View>

            {score >= levelNumber * 10 ? (
              <>
                <Text style={styles.rewardMessage}>
                  ✨ You earned {coinsReward} coins!
                </Text>
                <Pressable
                  style={styles.claimButton}
                  onPress={handleClaimReward}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.textOnPrimary} />
                  ) : (
                    <Text style={styles.claimButtonText}>Claim Reward</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.retryMessage}>
                  Get a score of {levelNumber * 10} or more to pass this level!
                </Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => {
                    setIsGameOver(false);
                    setScore(0);
                  }}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </Pressable>
              </>
            )}

            {message && (
              <Text style={styles.statusMessage}>{message}</Text>
            )}

            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back to Levels</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gameTitle: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  levelText: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  rewardBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  rewardText: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  coinText: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textOnPrimary,
  },
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bgBase,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: typeScale.h2.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  scoreBox: {
    backgroundColor: colors.bgElevated2,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: typeScale.h1.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  requiredScore: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  rewardMessage: {
    fontSize: typeScale.body.fontSize,
    color: colors.success,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  retryMessage: {
    fontSize: typeScale.body.fontSize,
    color: colors.warning,
    fontWeight: "600",
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  claimButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  claimButtonText: {
    color: colors.textOnPrimary,
    fontSize: typeScale.body.fontSize,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  retryButtonText: {
    color: colors.textOnPrimary,
    fontSize: typeScale.body.fontSize,
    fontWeight: "600",
  },
  statusMessage: {
    fontSize: typeScale.body.fontSize,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.bgElevated2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: typeScale.body.fontSize,
    fontWeight: "600",
  },
});
