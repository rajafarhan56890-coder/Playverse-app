import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../../theme/colors";
import { typeScale } from "../../../theme/typography";
import { spacing } from "../../../theme/spacing";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height - 150;
const BIRD_SIZE = 40;
const PIPE_WIDTH = 60;
const PIPE_GAP = 140;

interface Bird {
  y: number;
  vy: number; // velocity
}

interface Pipe {
  x: number;
  topHeight: number;
}

interface FlappyBirdsGameProps {
  levelNumber: number;
  onGameComplete: (score: number) => void;
}

export default function FlappyBirdsGame({
  levelNumber,
  onGameComplete,
}: FlappyBirdsGameProps) {
  const gameLoopRef = useRef<NodeJS.Timer | null>(null);
  const [bird, setBird] = useState<Bird>({ y: SCREEN_HEIGHT / 2, vy: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([
    { x: SCREEN_WIDTH, topHeight: 100 },
    { x: SCREEN_WIDTH + SCREEN_WIDTH / 2, topHeight: 150 },
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const passedPipesRef = useRef<Set<number>>(new Set());

  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -12;
  const PIPE_SPEED = 5 + levelNumber * 0.5; // Speed increases with level

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setBird((prevBird) => {
        let newBird = { ...prevBird };
        newBird.vy += GRAVITY;
        newBird.y += newBird.vy;

        // Check boundary
        if (newBird.y <= 0 || newBird.y + BIRD_SIZE >= SCREEN_HEIGHT) {
          setGameOver(true);
          return prevBird;
        }

        return newBird;
      });

      // Update pipes
      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({
            ...pipe,
            x: pipe.x - PIPE_SPEED,
          }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0);

        // Add new pipe
        if (newPipes[newPipes.length - 1].x < SCREEN_WIDTH * 0.6) {
          newPipes.push({
            x: SCREEN_WIDTH,
            topHeight: Math.random() * (SCREEN_HEIGHT - PIPE_GAP - 100) + 50,
          });
        }

        // Check collision with pipes
        newPipes.forEach((pipe) => {
          if (
            bird.y < pipe.topHeight ||
            bird.y + BIRD_SIZE > pipe.topHeight + PIPE_GAP
          ) {
            if (
              bird.x + BIRD_SIZE > pipe.x &&
              bird.x < pipe.x + PIPE_WIDTH
            ) {
              setGameOver(true);
            }
          }

          // Check if bird passed pipe
          if (
            bird.x > pipe.x + PIPE_WIDTH &&
            !passedPipesRef.current.has(pipe.x)
          ) {
            passedPipesRef.current.add(pipe.x);
            setScore((s) => s + 1);
          }
        });

        return newPipes;
      });
    }, 30);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, bird.x, bird.y]);

  const handleFlap = () => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }

    if (!gameOver) {
      setBird((prev) => ({
        ...prev,
        vy: JUMP_STRENGTH,
      }));
    }
  };

  const handleGameEnd = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    onGameComplete(score);
  };

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => {
        handleGameEnd();
      }, 1000);
    }
  }, [gameOver]);

  return (
    <Pressable style={styles.container} onPress={handleFlap}>
      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{score}</Text>
      </View>

      {/* Bird */}
      <View
        style={[
          styles.bird,
          {
            top: bird.y,
            left: 50,
          },
        ]}
      >
        <Text style={styles.birdEmoji}>🐦</Text>
      </View>

      {/* Pipes */}
      {pipes.map((pipe, i) => (
        <View key={i}>
          {/* Top pipe */}
          <View
            style={[
              styles.pipe,
              styles.pipeTop,
              {
                width: PIPE_WIDTH,
                height: pipe.topHeight,
                left: pipe.x,
              },
            ]}
          />
          {/* Bottom pipe */}
          <View
            style={[
              styles.pipe,
              styles.pipeBottom,
              {
                width: PIPE_WIDTH,
                height: SCREEN_HEIGHT - pipe.topHeight - PIPE_GAP,
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
              },
            ]}
          />
        </View>
      ))}

      {/* Start instruction */}
      {!gameStarted && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Tap to Flap!</Text>
          <Text style={styles.instructionSubText}>Avoid the pipes</Text>
        </View>
      )}

      {/* Game Over overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.finalScoreText}>Score: {score}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#87CEEB",
    position: "relative",
    overflow: "hidden",
  },
  scoreContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  score: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  bird: {
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 32,
  },
  birdEmoji: {
    fontSize: 32,
  },
  pipe: {
    backgroundColor: "#228B22",
    position: "absolute",
    borderWidth: 2,
    borderColor: "#1a6b1a",
  },
  pipeTop: {
    top: 0,
  },
  pipeBottom: {
    bottom: 0,
  },
  instructionBox: {
    position: "absolute",
    top: SCREEN_HEIGHT / 2 - 60,
    left: SCREEN_WIDTH / 2 - 80,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 15,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: spacing.sm,
  },
  instructionSubText: {
    fontSize: 16,
    color: "#CCC",
  },
  gameOverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: spacing.lg,
  },
  finalScoreText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "600",
  },
});
