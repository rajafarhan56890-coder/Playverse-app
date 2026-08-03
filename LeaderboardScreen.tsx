import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useLeaderboardStore } from "../../store/leaderboardStore";
import RankRow from "../../components/leaderboard/RankRow";
import EmptyState from "../../components/common/EmptyState";
import ScreenLoader from "../../components/common/ScreenLoader";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";

export default function LeaderboardScreen() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const { entries, isLoading, subscribe } = useLeaderboardStore();

  useEffect(() => subscribe(), [subscribe]);

  if (isLoading) return <ScreenLoader />;

  const myEntry = entries.find((e) => e.uid === firebaseUser?.uid);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={entries}
      keyExtractor={(item) => item.uid}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>Ranked by lifetime coins earned</Text>
          {myEntry ? (
            <View style={styles.myRankCard}>
              <Text style={styles.myRankLabel}>Your rank</Text>
              <Text style={styles.myRankValue}>#{myEntry.rank}</Text>
            </View>
          ) : firebaseUser ? (
            <View style={styles.myRankCard}>
              <Text style={styles.myRankLabel}>
                Keep earning to appear on the leaderboard
              </Text>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <EmptyState
          title="Leaderboard is still warming up"
          body="Rankings refresh periodically as players earn coins."
        />
      }
      renderItem={({ item }) => (
        <RankRow entry={item} isCurrentUser={item.uid === firebaseUser?.uid} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typeScale.h2, color: colors.textPrimary },
  subtitle: { ...typeScale.caption, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  myRankCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  myRankLabel: { ...typeScale.body, color: colors.textSecondary },
  myRankValue: { ...typeScale.h2, color: colors.coin },
});
