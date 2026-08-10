import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Game } from "../../types/models";

interface Level {
  level: number;
  coins: number;
  completed: boolean;
  locked: boolean;
}

export default function GameTaskScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const { gameId } = route.params;

  const [game, setGame] = useState<Game | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadGameAndProgress();
  }, [gameId, firebaseUser]);

  const loadGameAndProgress = async () => {
    try {
      setIsLoading(true);

      const gameSnap = await getDoc(doc(db, "games", gameId));
      if (!gameSnap.exists()) {
        setIsLoading(false);
        return;
      }

      const gameData = { id: gameSnap.id, ...gameSnap.data() } as Game;
      setGame(gameData);

      const totalLevels = gameData.totalLevels || 100;
      const coinsPerLevel = gameData.coinsPerLevel || 10;

      // Load user progress
      let completed: number[] = [];
      if (firebaseUser) {
        const progressSnap = await getDoc(
          doc(db, "users", firebaseUser.uid, "gameProgress", gameId)
        );
        completed = progressSnap.exists()
          ? progressSnap.data().completedLevels || []
          : [];
      }
      setCompletedCount(completed.length);

      // Generate levels from the game's real totalLevels/coinsPerLevel
      const generatedLevels: Level[] = Array.from({ length: totalLevels }, (_, i) => {
        const levelNum = i + 1;
        const coins = levelNum * coinsPerLevel;
        const isCompleted = completed.includes(levelNum);
        const isLocked = !isCompleted && levelNum > 1 && !completed.includes(levelNum - 1);

        return {
          level: levelNum,
          coins,
          completed: isCompleted,
          locked: isLocked,
        };
      });

      setLevels(generatedLevels);
    } catch (error) {
      console.error("Error loading game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayLevel = (level: Level) => {
    if (!level.locked && game) {
      navigation.navigate("GamePlay", {
        gameId,
        levelNumber: level.level,
        coinsReward: level.coins,
        gameName: game.name,
        engine: game.engine,
      });
    }
  };

  const renderLevel = ({ item: level }: { item: Level }) => (
    <Pressable
      style={[
        styles.levelCard,
        level.completed && styles.levelCardCompleted,
        level.locked && styles.levelCardLocked,
      ]}
      onPress={() => handlePlayLevel(level)}
      disabled={level.locked}
    >
      <View style={styles.levelContent}>
        <Text style={[styles.levelNumber, level.locked && styles.levelNumberLocked]}>
          {level.level}
        </Text>
        <Text style={[styles.levelCoins, level.locked && styles.levelCoinsLocked]}>
          {level.coins}
        </Text>
        <Text style={[styles.coinLabel, level.locked && styles.coinLabelLocked]}>
          coins
        </Text>
      </View>
      {level.completed && <Text style={styles.checkmark}>✓</Text>}
      {level.locked && <Text style={styles.lockIcon}>🔒</Text>}
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.danger }}>Game not found</Text>
      </View>
    );
  }

  const totalLevels = game.totalLevels || 100;
  const totalCoins = levels.reduce((sum, l) => sum + l.coins, 0);
  const earnedCoins = levels
    .filter((l) => l.completed)
    .reduce((sum, l) => sum + l.coins, 0);

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Levels</Text>
          <Text style={styles.statValue}>
            {completedCount}/{totalLevels}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Coins</Text>
          <Text style={styles.statValue}>{totalCoins.toLocaleString()}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Earned</Text>
          <Text style={styles.statValue}>{earnedCoins.toLocaleString()}</Text>
        </View>
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{game.name}</Text>
        <Text style={styles.gameDescription}>{game.description}</Text>
        <Text style={styles.rewardInfo}>
          💰 Level 1 = {game.coinsPerLevel} coins | Level {totalLevels} ={" "}
          {(totalLevels * game.coinsPerLevel).toLocaleString()} coins
        </Text>
      </View>

      {/* Levels Grid */}
      <FlatList
        data={levels}
        renderItem={renderLevel}
        keyExtractor={(item) => item.level.toString()}
        numColumns={5}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: "row",
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  gameInfo: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gameTitle: {
    fontSize: typeScale.h2.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  gameDescription: {
    fontSize: typeScale.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  rewardInfo: {
    fontSize: typeScale.caption.fontSize,
    color: colors.primary,
    fontWeight: "600",
    backgroundColor: colors.primary + "15",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  columnWrapper: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  levelCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  levelCardCompleted: {
    backgroundColor: colors.primary + "20",
    borderColor: colors.primary,
  },
  levelCardLocked: {
    opacity: 0.5,
    backgroundColor: colors.border,
    borderColor: colors.textMuted,
  },
  levelContent: {
    alignItems: "center",
  },
  levelNumber: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  levelNumberLocked: {
    color: colors.textMuted,
  },
  levelCoins: {
    fontSize: typeScale.body.fontSize,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.xs,
  },
  levelCoinsLocked: {
    color: colors.textMuted,
  },
  coinLabel: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
  },
  coinLabelLocked: {
    color: colors.textMuted,
  },
  checkmark: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    fontSize: 20,
  },
  lockIcon: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    fontSize: 18,
  },
});
