import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
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
  const { wallet, isLoading: walletLoading, subscribe, error: walletError } =
    useWalletStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to wallet updates
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribe = subscribe(firebaseUser.uid);
    return unsubscribe;
  }, [firebaseUser, subscribe]);

  // Load first page of transactions
  const loadFirstPage = useCallback(async () => {
    if (!firebaseUser) return;
    setIsLoadingPage(true);
    setError(null);
    try {
      const res = await fetchTransactionsPage(firebaseUser.uid);
      setTransactions(res.transactions);
      setCursor(res.lastDoc);
      setHasMore(res.hasMore);
    } catch (err) {
      setError("Could not load transaction history. Pull down to retry.");
      console.error("Error loading transactions:", err);
    } finally {
      setIsLoadingPage(false);
    }
  }, [firebaseUser]);

  // Load transactions when component mounts
  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // Handle pagination
  const loadMore = async () => {
    if (!firebaseUser || !hasMore || isLoadingMore || !cursor) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchTransactionsPage(firebaseUser.uid, cursor);
      setTransactions((prev) => [...prev, ...res.transactions]);
      setCursor(res.lastDoc);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error("Error loading more transactions:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadFirstPage();
    } finally {
      setIsRefreshing(false);
    }
  };

  // BUG FIX: If wallet is null after loading, show empty state instead of skeleton
  if (walletLoading && !wallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  // Default wallet if none exists
  const displayWallet = wallet || {
    coins: 0,
    totalEarned: 0,
    pendingWithdrawal: 0,
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={transactions}
      keyExtractor={(item, idx) => item.id || `tx-${idx}`}
      renderItem={({ item }) => <TransactionRow transaction={item} />}
      onEndReachedThreshold={0.4}
      onEndReached={loadMore}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Wallet</Text>

          {/* Balance Card */}
          <BalanceCard
            coins={displayWallet.coins}
            totalEarned={displayWallet.totalEarned}
          />

          {/* Pending Withdrawal Banner */}
          {displayWallet.pendingWithdrawal > 0 && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>
                {displayWallet.pendingWithdrawal.toLocaleString()} coins held
                for a pending withdrawal
              </Text>
            </View>
          )}

          {/* Withdraw & Convert Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                navigation.navigate("WithdrawalRequest", {
                  availableCoins: displayWallet.coins,
                })
              }
            >
              <Text style={styles.actionBtnText}>Withdraw</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                navigation.navigate("ConversionCalculator", {
                  coins: displayWallet.coins,
                })
              }
            >
              <Text style={styles.actionBtnText}>Convert Coins</Text>
            </Pressable>
          </View>

          {/* Transaction History Header */}
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {walletError && !error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{walletError}</Text>
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        !isLoadingPage ? (
          <EmptyState
            title="No Transactions"
            description="Your transactions will appear here"
            icon="📋"
          />
        ) : null
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.loadMoreIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      scrollEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typeScale.body,
    color: colors.text.secondary,
  },
  title: {
    fontSize: typeScale.title,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typeScale.subtitle,
    fontWeight: "600",
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  pendingBanner: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warning + "15",
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  pendingText: {
    fontSize: typeScale.body,
    color: colors.warning,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: typeScale.body,
    fontWeight: "600",
    color: colors.text.light,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.error + "15",
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    fontSize: typeScale.body,
    color: colors.error,
    fontWeight: "500",
  },
  loadMoreIndicator: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
});
