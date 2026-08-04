import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useAuthStore } from "../../store/authStore";
import { useWalletStore } from "../../store/walletStore";
import { fetchTransactionsPage } from "../../services/wallet.service";
import BalanceCard from "../../components/wallet/BalanceCard";
import TransactionRow from "../../components/wallet/TransactionRow";
import EmptyState from "../../components/common/EmptyState";
import { ListRowSkeleton } from "../../components/common/Skeleton";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Transaction } from "../../types/models";

export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const { wallet, isLoading: walletLoading, subscribe } = useWalletStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribe(firebaseUser.uid);
  }, [firebaseUser, subscribe]);

  const loadFirstPage = useCallback(async () => {
    if (!firebaseUser) return;
    setIsLoadingPage(true);
    setError(null);
    try {
      const res = await fetchTransactionsPage(firebaseUser.uid);
      setTransactions(res.transactions);
      setCursor(res.lastDoc);
      setHasMore(res.hasMore);
    } catch {
      setError("Could not load transaction history. Pull down to retry.");
    } finally {
      setIsLoadingPage(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  async function loadMore() {
    if (!firebaseUser || !hasMore || isLoadingMore || !cursor) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchTransactionsPage(firebaseUser.uid, cursor);
      setTransactions((prev) => [...prev, ...res.transactions]);
      setCursor(res.lastDoc);
      setHasMore(res.hasMore);
    } catch {
      // silent — user can scroll again to retry
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (walletLoading || !wallet) {
    return <ListRowSkeleton />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TransactionRow transaction={item} />}
      onEndReachedThreshold={0.4}
      onEndReached={loadMore}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Wallet</Text>
          <BalanceCard coins={wallet.coins} totalEarned={wallet.totalEarned} />
          {wallet.pendingWithdrawal > 0 && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>
                {wallet.pendingWithdrawal.toLocaleString()} coins held for a pending withdrawal
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.withdrawButton, wallet.pendingWithdrawal > 0 && styles.withdrawButtonDisabled]}
              onPress={() => navigation.navigate("WithdrawalRequest")}
              disabled={wallet.pendingWithdrawal > 0}
            >
              <Text style={styles.withdrawButtonText}>
                {wallet.pendingWithdrawal > 0 ? "Withdrawal pending" : "Withdraw"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.historyLink}
              onPress={() => navigation.navigate("WithdrawalHistory")}
            >
              <Text style={styles.historyLinkText}>Withdrawal history</Text>
            </Pressable>
          </View>

          <Text style={styles.historyTitle}>Transaction history</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          {isLoadingPage && (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          )}
        </>
      }
      ListEmptyComponent={
        !isLoadingPage ? (
          <EmptyState title="No transactions yet" body="Earn coins from games, tasks, and daily rewards." />
        ) : null
      }
      ListFooterComponent={
        isLoadingMore ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typeScale.h2, color: colors.textPrimary, marginBottom: spacing.md },
  pendingBanner: {
    backgroundColor: "rgba(255,176,32,0.12)",
    borderRadius: 12,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  pendingText: { ...typeScale.caption, color: colors.coin },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  withdrawButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  withdrawButtonText: { ...typeScale.bodyMedium, color: colors.textOnPrimary },
  withdrawButtonDisabled: { backgroundColor: colors.bgElevated2 },
  historyLink: { paddingVertical: spacing.sm },
  historyLinkText: { ...typeScale.caption, color: colors.primary },
  historyTitle: { ...typeScale.h3, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
  error: { ...typeScale.caption, color: colors.danger, marginBottom: spacing.sm },
});
