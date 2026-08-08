import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height - 150;

interface Coin {
  id: number;
  x: number;
  y: number;
}

interface CoinClickerGameProps {
  levelNumber: number;
  onGameComplete: (score: number) => void;
}

export default function CoinClickerGame({
  levelNumber,
  onGameComplete,
}: CoinClickerGameProps) {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([
    { id: 1, x: SCREEN_WIDTH / 2 - 40, y: SCREEN_HEIGHT / 2 - 40 },
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per level
  const [gameOver, setGameOver] = useState(false);
  const [nextCoinId, setNextCoinId] = useState(2);

  const LEVEL_TIME = 30 - levelNumber; // Harder levels have less time

  useEffect(() => {
    if (!gameStarted || gameOver) return;

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

  const generateNewCoin = () => {
    const newCoin = {
      id: nextCoinId,
      x: Math.random() * (SCREEN_WIDTH - 80),
      y: Math.random() * (SCREEN_HEIGHT - 200) + 50,
    };
    setCoins([newCoin]);
    setNextCoinId((id) => id + 1);
  };

  const handleCoinTap = (coinId: number) => {
    if (coins.some((c) => c.id === coinId)) {
      setScore((s) => s + 1);

      // Remove tapped coin and add new ones
      if (score % 5 === 0) {
        // Every 5 coins, add difficulty with more coins
        const numCoins = Math.min(1 + Math.floor((score + 1) / 5), 3);
        const newCoins: Coin[] = [];
        for (let i = 0; i < numCoins; i++) {
          newCoins.push({
            id: nextCoinId + i,
            x: Math.random() * (SCREEN_WIDTH - 80),
            y: Math.random() * (SCREEN_HEIGHT - 200) + 50,
          });
        }
        setCoins(newCoins);
        setNextCoinId((id) => id + numCoins);
      } else {
        generateNewCoin();
      }
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setTimeLeft(LEVEL_TIME);
  };

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => {
        onGameComplete(score);
      }, 1500);
    }
  }, [gameOver]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={[styles.timer, timeLeft < 10 && styles.timerWarning]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {coins.map((coin) => (
          <Pressable
            key={coin.id}
            style={[
              styles.coin,
              {
                left: coin.x,
                top: coin.y,
              },
            ]}
            onPress={() => handleCoinTap(coin.id)}
          >
            <Text style={styles.coinEmoji}>🪙</Text>
          </Pressable>
        ))}

        {!gameStarted && (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>Tap Coins!</Text>
            <Text style={styles.instructionText}>
              Tap as many coins as you can in {LEVEL_TIME} seconds
            </Text>
            <Pressable style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </Pressable>
          </View>
        )}

        {gameOver && (
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverScore}>Score: {score}</Text>
            <Text style={styles.gameOverRequired}>
              Required: {LEVEL_TIME * levelNumber}
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
    justifyContent: "space-between",
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
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary,
  },
  timerBox: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  timer: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  timerWarning: {
    color: "#FF6B6B",
  },
  gameArea: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  coin: {
    position: "absolute",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  coinEmoji: {
    fontSize: 60,
  },
  instructionBox: {
    position: "absolute",
    top: SCREEN_HEIGHT / 2 - 100,
    left: SCREEN_WIDTH / 2 - 120,
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
    top: SCREEN_HEIGHT / 2 - 80,
    left: SCREEN_WIDTH / 2 - 120,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FF6B6B",
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
