import React, { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { Game } from "../../types/models";

interface Props {
  game: Game;
  onPress: () => void;
}

function GameCard({ game, onPress }: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {game.imageURL && !imageFailed ? (
        <Image
          source={{ uri: game.imageURL }}
          style={styles.image}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.imageFallbackText}>{game.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.category}>{game.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{game.name}</Text>
        <View style={styles.rewardRow}>
          <Text style={styles.rewardValue}>{game.totalLevels}</Text>
          <Text style={styles.rewardUnit}>levels</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginRight: spacing.md,
  },
  image: { width: "100%", height: 90, backgroundColor: colors.bgElevated2 },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  imageFallbackText: { ...typeScale.h2, color: colors.primary },
  body: { padding: spacing.sm },
  category: { ...typeScale.caption, color: colors.textMuted, textTransform: "uppercase" },
  name: { ...typeScale.bodyMedium, color: colors.textPrimary, marginTop: 2 },
  rewardRow: { flexDirection: "row", alignItems: "baseline", marginTop: spacing.xs },
  rewardValue: { ...typeScale.coinInline, color: colors.coin },
  rewardUnit: { ...typeScale.caption, color: colors.textMuted, marginLeft: 4 },
});

export default React.memo(GameCard);
