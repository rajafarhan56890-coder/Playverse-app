import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height - 150;

const GAME_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#C7CEEA", "#FF9671"];

interface ColorTile {
  id: number;
  color: string;
  isTarget: boolean;
}

interface ColorMatchGameProps {
  levelNumber: number;
  onGameComplete: (score: number) => void;
}

export default function ColorMatchGame({
  levelNumber,
  onGameComplete,
}: ColorMatchGameProps) {
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState<ColorTile[]>([]);
  const [targetColor, setTargetColor] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [missedTaps, setMissedTaps] = useState(0);

  const LEVEL_TIME = Math.max(20, 40 - levelNumber * 2);
  const NUM_TILES = Math.min(4 + levelNumber, 9);

  const generateNewRound = () => {
    const newTiles: ColorTile[] = [];
    const randomTarget =
      GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];

    setTargetColor(randomTarget);

    // Create tiles
    const targetIndex = Math.floor(Math.random() * NUM_TILES);
    for (let i = 0; i < NUM_TILES; i++) {
      const color =
        i === targetIndex
          ? randomTarget
          : GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];

      newTiles.push({
        id: nextId + i,
        color,
        isTarget: i === targetIndex,
      });
    }

    setTiles(newTiles);
    setNextId(nextId + NUM_TILES);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    generateNewRound();

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const handleTileTap = (tile: ColorTile) => {
    if (tile.isTarget) {
      setScore((s) => s + 1);
      generateNewRound();
    } else {
      setMissedTaps((m) => m + 1);
      if (missedTaps + 1 >= 3) {
        setGameOver(true);
      }
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setTimeLeft(LEVEL_TIME);
    setScore(0);
    setMissedTaps(0);
  };

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => {
        onGameComplete(score);
      }, 1500);
    }
  }, [gameOver]);

  const TILE_SIZE = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2) / 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Matched</Text>
          <Text style={styles.score}>{score}</Text>
        </View>

        <View style={styles.targetBox}>
          <Text style={styles.targetLabel}>Match This</Text>
          <View
            style={[
              styles.targetColor,
              { backgroundColor: targetColor || "#999" },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>Time</Text>
          <Text
            style={[styles.timer, timeLeft < 10 && styles.timerWarning]}
          >
            {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Missed taps indicator */}
      <View style={styles.missedBox}>
        <Text style={styles.missedLabel}>Mistakes: {missedTaps}/3</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {!gameStarted ? (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>Match Colors!</Text>
            <Text style={styles.instructionText}>
              Tap the tile that matches the target color
            </Text>
            <Pressable style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tilesContainer}>
            {tiles.map((tile) => (
              <Pressable
                key={tile.id}
                style={[
                  styles.tile,
                  {
                    backgroundColor: tile.color,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                  },
                ]}
                onPress={() => handleTileTap(tile)}
              />
            ))}
          </View>
        )}

        {gameOver && (
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverTitle}>
              {score >= LEVEL_TIME ? "🎉 Great!" : "Game Over!"}
            </Text>
            <Text style={styles.gameOverScore}>Matched: {score}</Text>
            <Text style={styles.gameOverRequired}>
              {missedTaps >= 3
                ? "Too many mistakes!"
                : `Time's up!`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    width: SCREEN_WIDTH,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  score: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },
  timer: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },
  timerWarning: {
    color: "#FF6B6B",
  },
  targetBox: {
    alignItems: "center",
  },
  targetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  targetColor: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
  },
  missedBox: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  missedLabel: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tile: {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
  },
  instructionBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  instructionTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  gameOverBox: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  gameOverScore: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  gameOverRequired: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
