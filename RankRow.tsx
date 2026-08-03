import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { LeaderboardEntry } from "../../types/models";

const MEDAL_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

function RankRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const medalColor = MEDAL_COLORS[entry.rank];

  return (
    <View style={[styles.row, isCurrentUser && styles.rowHighlighted]}>
      <View style={styles.rankBadge}>
        <Text style={[styles.rankText, medalColor && { color: medalColor }]}>
          {entry.rank}
        </Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {entry.name}
        {isCurrentUser ? " (You)" : ""}
      </Text>
      <Text style={styles.earned}>{entry.totalEarned.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowHighlighted: {
    backgroundColor: "rgba(123,92,255,0.1)",
    borderRadius: radius.sm,
  },
  rankBadge: { width: 36, alignItems: "center" },
  rankText: { ...typeScale.bodyMedium, color: colors.textSecondary },
  name: { ...typeScale.bodyMedium, color: colors.textPrimary, flex: 1, marginLeft: spacing.sm },
  earned: { ...typeScale.coinInline, color: colors.coin },
});

export default React.memo(RankRow);
