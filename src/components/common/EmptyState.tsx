import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

interface Props {
  title: string;
  body?: string;
}

export default function EmptyState({ title, body }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: "center" },
  title: { ...typeScale.bodyMedium, color: colors.textSecondary, textAlign: "center" },
  body: {
    ...typeScale.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
