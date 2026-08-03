import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import type { Transaction } from "../../types/models";

const TYPE_LABELS: Record<Transaction["type"], string> = {
  daily_reward: "Daily check-in",
  game_reward: "Game reward",
  task_reward: "Task reward",
  referral_bonus: "Referral bonus",
  bonus_reward: "Bonus reward",
  withdrawal_hold: "Withdrawal requested",
  withdrawal_approved: "Withdrawal approved",
  withdrawal_rejected: "Withdrawal refunded",
  admin_adjustment: "Balance adjustment",
};

function formatDate(ts: Transaction["createdAt"]): string {
  if (!ts || typeof (ts as { toDate?: () => Date }).toDate !== "function") return "";
  const date = (ts as { toDate: () => Date }).toDate();
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.amount >= 0;
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.label}>{TYPE_LABELS[transaction.type] ?? transaction.type}</Text>
        <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, { color: isCredit ? colors.success : colors.danger }]}>
        {isCredit ? "+" : ""}
        {transaction.amount.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flex: 1 },
  label: { ...typeScale.bodyMedium, color: colors.textPrimary },
  date: { ...typeScale.caption, color: colors.textMuted, marginTop: 2 },
  amount: { ...typeScale.coinInline },
});

export default React.memo(TransactionRow);
