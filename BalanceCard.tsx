import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";

interface Props {
  coins: number;
  totalEarned: number;
}

export default function BalanceCard({ coins, totalEarned }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Your balance</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balance}>{coins.toLocaleString()}</Text>
        <Text style={styles.unit}>coins</Text>
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>Total earned</Text>
        <Text style={styles.footerValue}>{totalEarned.toLocaleString()} coins</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.coin,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  label: { ...typeScale.caption, color: colors.textSecondary },
  balanceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: spacing.xs,
  },
  balance: { ...typeScale.coinBalance, color: colors.coin },
  unit: {
    ...typeScale.bodyMedium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLabel: { ...typeScale.caption, color: colors.textMuted },
  footerValue: { ...typeScale.coinInline, color: colors.textSecondary },
});
