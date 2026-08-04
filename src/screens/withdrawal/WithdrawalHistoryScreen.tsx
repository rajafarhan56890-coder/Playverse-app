import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { subscribeToWithdrawalHistory } from "../../services/withdrawal.service";
import EmptyState from "../../components/common/EmptyState";
import ScreenLoader from "../../components/common/ScreenLoader";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Withdrawal } from "../../types/models";

const STATUS_STYLE: Record<Withdrawal["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: colors.coin },
  approved: { label: "Approved", color: colors.success },
  rejected: { label: "Rejected", color: colors.danger },
};

const METHOD_LABEL: Record<Withdrawal["payoutMethod"], string> = {
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
};

function formatDate(ts: Withdrawal["requestedAt"]): string {
  if (!ts || typeof (ts as any).toDate !== "function") return "";
  return (ts as any).toDate().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WithdrawalHistoryScreen() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeToWithdrawalHistory(firebaseUser.uid, (list) => {
      setWithdrawals(list);
      setIsLoading(false);
    });
  }, [firebaseUser]);

  if (isLoading) return <ScreenLoader />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={withdrawals}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={styles.title}>Withdrawal history</Text>}
      ListEmptyComponent={
        <EmptyState title="No withdrawals yet" body="Your withdrawal requests will appear here." />
      }
      renderItem={({ item }) => {
        const statusInfo = STATUS_STYLE[item.status];
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.amount}>{item.amount.toLocaleString()} coins</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}22` }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {METHOD_LABEL[item.payoutMethod]} · {item.accountNumber}
            </Text>
            <Text style={styles.meta}>{formatDate(item.requestedAt)}</Text>
            {item.status === "rejected" && item.rejectionReason && (
              <Text style={styles.rejectionReason}>Reason: {item.rejectionReason}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typeScale.h2, color: colors.textPrimary, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { ...typeScale.coinInline, color: colors.textPrimary },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  statusText: { ...typeScale.caption, fontWeight: "600" },
  meta: { ...typeScale.caption, color: colors.textSecondary, marginTop: spacing.xs },
  rejectionReason: { ...typeScale.caption, color: colors.danger, marginTop: spacing.xs },
});
