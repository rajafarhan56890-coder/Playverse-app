import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";

interface Props {
  title?: string;
  body?: string;
  onRetry?: () => void;
}

/**
 * Distinct from EmptyState: EmptyState means "the request succeeded and
 * there's genuinely nothing here" (no games, no transactions yet).
 * ErrorState means "the request failed" (network error, permission
 * error, unexpected exception) — different meaning, different visual
 * treatment (danger-colored, offers a retry), so they're separate
 * components rather than one with a boolean flag.
 */
export default function ErrorState({
  title = "Something went wrong",
  body = "Please check your connection and try again.",
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: "center" },
  title: { ...typeScale.bodyMedium, color: colors.danger, textAlign: "center" },
  body: {
    ...typeScale.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: { ...typeScale.caption, color: colors.danger, fontWeight: "600" },
});
