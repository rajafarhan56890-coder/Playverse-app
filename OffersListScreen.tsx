import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, SectionList, StyleSheet } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useOffersStore } from "../../store/offersStore";
import { completeTask } from "../../services/offers.service";
import { hasClaimedToday, hasClaimedThisWeek, hasClaimedEver } from "../../services/wallet.service";
import OfferCard from "../../components/offers/OfferCard";
import EmptyState from "../../components/common/EmptyState";
import ScreenLoader from "../../components/common/ScreenLoader";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import type { TaskType } from "../../types/models";

const SECTION_ORDER: { key: TaskType | "offer"; title: string }[] = [
  { key: "daily", title: "Daily tasks" },
  { key: "weekly", title: "Weekly tasks" },
  { key: "special", title: "Special events" },
  { key: "social", title: "Social tasks" },
  { key: "app_engagement", title: "App engagement" },
  { key: "offer", title: "Offers" },
];

export default function OffersListScreen() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const { offers, isLoading, subscribe } = useOffersStore();

  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribe(), [subscribe]);

  const refreshClaimedState = useCallback(async () => {
    if (!firebaseUser || offers.length === 0) return;
    const results = await Promise.all(
      offers.map((o) => {
        if (o.type === "task" && o.taskType === "daily") {
          return hasClaimedToday(firebaseUser.uid, "task_reward", o.id);
        }
        if (o.type === "task" && o.taskType === "weekly") {
          return hasClaimedThisWeek(firebaseUser.uid, "task_reward", o.id);
        }
        return hasClaimedEver(firebaseUser.uid, "task_reward", o.id);
      })
    );
    const next = new Set<string>();
    offers.forEach((o, i) => {
      if (results[i]) next.add(o.id);
    });
    setClaimedIds(next);
  }, [firebaseUser, offers]);

  useEffect(() => {
    refreshClaimedState();
  }, [refreshClaimedState]);

  async function handleClaim(offerId: string) {
    setError(null);
    setClaimingId(offerId);
    const result = await completeTask(offerId);
    setClaimingId(null);

    if (result.success) {
      setClaimedIds((prev) => new Set(prev).add(offerId));
    } else {
      setError(result.error ?? "Could not claim this offer.");
    }
  }

  const sections = useMemo(() => {
    return SECTION_ORDER.map((section) => {
      const items = offers.filter((o) =>
        section.key === "offer" ? o.type === "offer" : o.type === "task" && o.taskType === section.key
      );
      return { title: section.title, data: items };
    }).filter((section) => section.data.length > 0);
  }, [offers]);

  if (isLoading) return <ScreenLoader />;

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Tasks & Offers</Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </>
      }
      ListEmptyComponent={
        <EmptyState title="No offers right now" body="New tasks and offers appear here as they're added." />
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionTitle}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <OfferCard
          offer={item}
          onClaim={() => handleClaim(item.id)}
          isClaiming={claimingId === item.id}
          isClaimed={claimedIds.has(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typeScale.h2, color: colors.textPrimary, marginBottom: spacing.md },
  sectionTitle: { ...typeScale.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  error: { ...typeScale.caption, color: colors.danger, marginBottom: spacing.sm },
});
