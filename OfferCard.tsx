import React from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Offer } from "../../types/models";

interface Props {
  offer: Offer;
  onClaim: () => void;
  isClaiming: boolean;
  isClaimed: boolean;
}

function formatExpiry(offer: Offer): string | null {
  if (!offer.expiresAt) return null;
  const date = offer.expiresAt.toDate();
  const isExpired = date.getTime() < Date.now();
  const formatted = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return isExpired ? `Expired ${formatted}` : `Expires ${formatted}`;
}

function OfferCard({ offer, onClaim, isClaiming, isClaimed }: Props) {
  const expiryLabel = formatExpiry(offer);
  const isExpired = !!offer.expiresAt && offer.expiresAt.toDate().getTime() < Date.now();
  const isDisabled = isClaiming || isClaimed || isExpired;

  return (
    <View style={[styles.card, isExpired && styles.cardExpired]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{offer.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{offer.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.reward}>+{offer.reward.toLocaleString()} coins</Text>
          {expiryLabel && (
            <Text style={[styles.expiry, isExpired && styles.expiryUrgent]}>{expiryLabel}</Text>
          )}
        </View>
      </View>
      <Pressable
        style={[styles.claimButton, isDisabled && styles.claimButtonDisabled]}
        onPress={onClaim}
        disabled={isDisabled}
      >
        {isClaiming ? (
          <ActivityIndicator size="small" color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.claimText}>
            {isExpired ? "Expired" : isClaimed ? "Done" : "Claim"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardExpired: { opacity: 0.5 },
  textBlock: { flex: 1, marginRight: spacing.sm },
  title: { ...typeScale.bodyMedium, color: colors.textPrimary },
  description: { ...typeScale.caption, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs, gap: spacing.sm },
  reward: { ...typeScale.coinInline, color: colors.coin },
  expiry: { ...typeScale.caption, color: colors.textMuted },
  expiryUrgent: { color: colors.danger },
  claimButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 76,
    alignItems: "center",
  },
  claimButtonDisabled: { backgroundColor: colors.bgElevated2 },
  claimText: { ...typeScale.caption, color: colors.textOnPrimary, fontWeight: "600" },
});

export default React.memo(OfferCard);
