import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, type ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";

interface SkeletonBlockProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

/** A single shimmering placeholder block. Compose several to build a skeleton layout. */
export function SkeletonBlock({ width = "100%", height = 16, style }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, opacity },
        style,
      ]}
    />
  );
}

/** Skeleton matching the Home dashboard's balance card + list rows, shown while wallet/games/offers first load. */
export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBlock height={20} width="60%" style={{ marginBottom: 12 }} />
      <SkeletonBlock height={110} style={{ marginBottom: 24, borderRadius: radius.lg }} />
      <SkeletonBlock height={44} style={{ marginBottom: 24, borderRadius: radius.pill }} />
      <SkeletonBlock height={18} width="40%" style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <SkeletonBlock height={140} width={160} style={{ borderRadius: radius.md }} />
        <SkeletonBlock height={140} width={160} style={{ borderRadius: radius.md }} />
      </View>
    </View>
  );
}

/** Skeleton matching Wallet/transaction-list rows. */
export function ListRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <SkeletonBlock height={14} width="50%" style={{ marginBottom: 6 }} />
          <SkeletonBlock height={12} width="30%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { marginBottom: 16 },
  block: { backgroundColor: colors.bgElevated2, borderRadius: 6 },
});
