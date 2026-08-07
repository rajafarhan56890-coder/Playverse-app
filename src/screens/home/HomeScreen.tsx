import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { useWalletStore } from "../../store/walletStore";
import { useGamesStore } from "../../store/gamesStore";
import { useOffersStore } from "../../store/offersStore";
import { claimDailyReward, fetchTransactionsPage } from "../../services/wallet.service";
import BalanceCard from "../../components/wallet/BalanceCard";
import TransactionRow from "../../components/wallet/TransactionRow";
import GameCard from "../../components/games/GameCard";
import EmptyState from "../../components/common/EmptyState";
import { HomeSkeleton } from "../../components/common/Skeleton";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Transaction } from "../../types/models";

/** Level thresholds derived from lifetime coins earned — real data, no placeholder tiers. */
function levelFromTotalEarned(totalEarned: number): { level: number; label: string } {
  if (totalEarned >= 100_000) return { level: 5, label: "Legend" };
  if (totalEarned >= 25_000) return { level: 4, label: "Elite" };
  if (totalEarned >= 5_000) return { level: 3, label: "Pro" };
  if (totalEarned >= 1_000) return { level: 2, label: "Rising" };
  return { level: 1, label: "Rookie" };
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const profile = useAuthStore((s) => s.profile);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const { wallet, isLoading: walletLoading, subscribe: subscribeWallet } = useWalletStore();
  const { games, subscribe: subscribeGames } = useGamesStore();
  const { offers, subscribe: subscribeOffers } = useOffersStore();

  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubWallet = subscribeWallet(firebaseUser.uid);
    const unsubGames = subscribeGames();
    const unsubOffers = subscribeOffers();
    return () => {
      unsubWallet();
      unsubGames();
      unsubOffers();
    };
  }, [firebaseUser, subscribeWallet, subscribeGames, subscribeOffers]);

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;
    setTxLoading(true);
    fetchTransactionsPage(firebaseUser.uid)
      .then((res) => {
        if (!cancelled) setRecentTx(res.transactions.slice(0, 5));
      })
      .finally(() => {
        if (!cancelled) setTxLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [firebaseUser, wallet?.coins]); // refetch after a claim changes the balance

  async function handleClaimDaily() {
    setClaimMessage(null);
    setIsClaiming(true);
    const result = await claimDailyReward();
    setIsClaiming(false);

    if (result.success) {
      setClaimMessage({
        text: `+${result.amountCredited} coins claimed!`,
        isError: false,
      });
    } else {
      setClaimMessage({ text: result.error ?? "Could not claim reward.", isError: true });
    }
  }

  if (walletLoading && !wallet) {
  return <HomeSkeleton />;
}

const displayWallet = wallet || {
  coins: 0,
  totalEarned: 0,
  pendingWithdrawal: 0,
};

  const { level, label } = levelFromTotalEarned(wallet.totalEarned);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
          </Text>
          <Text style={styles.levelText}>Level {level} · {label}</Text>
        </View>
      </View>

      <BalanceCard coins={wallet.coins} totalEarned={wallet.totalEarned} />

      <Pressable
        style={[styles.dailyButton, isClaiming && styles.dailyButtonDisabled]}
        onPress={handleClaimDaily}
        disabled={isClaiming}
      >
        {isClaiming ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.dailyButtonText}>Claim daily reward</Text>
        )}
      </Pressable>
      {claimMessage && (
        <Text
          style={[
            styles.claimMessage,
            { color: claimMessage.isError ? colors.danger : colors.success },
          ]}
        >
          {claimMessage.text}
        </Text>
      )}

      <SectionHeader title="Games" onSeeAll={() => navigation.navigate("Games")} />
      {games.length === 0 ? (
        <EmptyState title="No games available yet" body="Check back soon." />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {games.slice(0, 6).map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => navigation.navigate("Games", { screen: "GameDetail", params: { gameId: game.id } })}
            />
          ))}
        </ScrollView>
      )}

      <SectionHeader title="Offers & Tasks" onSeeAll={() => navigation.navigate("Offers")} />
      <Text style={styles.offersSummary}>
        {offers.length} available right now
      </Text>

      <Pressable style={styles.leaderboardCard} onPress={() => navigation.navigate("Leaderboard")}>
        <View>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          <Text style={styles.leaderboardSubtitle}>See how you rank against other players</Text>
        </View>
        <Text style={styles.leaderboardArrow}>›</Text>
      </Pressable>

      <SectionHeader title="Recent activity" onSeeAll={() => navigation.navigate("Wallet")} />
      {txLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : recentTx.length === 0 ? (
        <EmptyState title="No transactions yet" body="Complete a game or task to see it here." />
      ) : (
        <View style={styles.txCard}>
          {recentTx.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onSeeAll}>
        <Text style={styles.seeAll}>See all</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  headerRow: { marginBottom: spacing.md },
  greeting: { ...typeScale.h2, color: colors.textPrimary },
  levelText: { ...typeScale.caption, color: colors.textSecondary, marginTop: 2 },
  dailyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  dailyButtonDisabled: { opacity: 0.6 },
  dailyButtonText: { ...typeScale.bodyMedium, color: colors.textOnPrimary },
  claimMessage: { ...typeScale.caption, textAlign: "center", marginTop: spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typeScale.h3, color: colors.textPrimary },
  seeAll: { ...typeScale.caption, color: colors.primary },
  offersSummary: { ...typeScale.body, color: colors.textSecondary },
  leaderboardCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  leaderboardTitle: { ...typeScale.bodyMedium, color: colors.textPrimary },
  leaderboardSubtitle: { ...typeScale.caption, color: colors.textSecondary, marginTop: 2 },
  leaderboardArrow: { ...typeScale.h2, color: colors.textMuted },
  txCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
