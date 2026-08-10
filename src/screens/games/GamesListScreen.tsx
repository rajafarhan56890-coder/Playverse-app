import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGamesStore } from "../../store/gamesStore";
import GameCard from "../../components/games/GameCard";
import EmptyState from "../../components/common/EmptyState";
import ScreenLoader from "../../components/common/ScreenLoader";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { GamesStackParamList } from "../../navigation/GamesNavigator";
import type { Game } from "../../types/models";

type Nav = NativeStackNavigationProp<GamesStackParamList, "GamesList">;

export default function GamesListScreen() {
  const navigation = useNavigation<Nav>();
  const { games, isLoading, subscribe } = useGamesStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => subscribe(), [subscribe]);

  const categories = useMemo(
    () => Array.from(new Set(games.map((g) => g.category))).sort(),
    [games]
  );

  // `games` arrives from Firestore already ordered by createdAt desc, so it
  // doubles as the "Recently Added" list with zero extra reads/indexes.
  const recentlyAdded = games.slice(0, 10);
  const featured = games.filter((g) => g.isFeatured).slice(0, 10);
  const popular = useMemo(
    () => [...games].sort((a, b) => b.playCount - a.playCount).slice(0, 10),
    [games]
  );

  const isSearching = searchQuery.trim().length > 0;

  const filteredGames = useMemo(() => {
    let list = games;
    if (activeCategory) list = list.filter((g) => g.category === activeCategory);
    if (isSearching) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (g) => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [games, activeCategory, isSearching, searchQuery]);

  function openGame(gameId: string) {
    navigation.navigate("GameDetail", { gameId });
  }

  if (isLoading) return <ScreenLoader />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filteredGames}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: spacing.md }}
      ListHeaderComponent={
        <View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search games or categories"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {!isSearching && (
            <>
              {featured.length > 0 && (
                <HorizontalSection title="Featured" games={featured} onPress={openGame} />
              )}
              {popular.length > 0 && (
                <HorizontalSection title="Popular" games={popular} onPress={openGame} />
              )}
              {recentlyAdded.length > 0 && (
                <HorizontalSection title="Recently added" games={recentlyAdded} onPress={openGame} />
              )}

              <Text style={styles.allGamesTitle}>All games</Text>
              {categories.length > 0 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={["All", ...categories]}
                  keyExtractor={(item) => item}
                  contentContainerStyle={styles.chipRow}
                  renderItem={({ item }) => {
                    const isActive =
                      item === "All" ? activeCategory === null : activeCategory === item;
                    return (
                      <Pressable
                        style={[styles.chip, isActive && styles.chipActive]}
                        onPress={() => setActiveCategory(item === "All" ? null : item)}
                      >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                          {item}
                        </Text>
                      </Pressable>
                    );
                  }}
                />
              )}
            </>
          )}
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title={isSearching ? "No games match your search" : "No games available"}
          body={isSearching ? "Try a different search term." : "Check back soon for new games."}
        />
      }
      renderItem={({ item }) => (
        <Pressable style={styles.gridItem} onPress={() => openGame(item.id)}>
          <View style={styles.thumb}>
            <Text style={styles.thumbInitial}>{item.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.reward}>{item.totalLevels} levels</Text>
        </Pressable>
      )}
    />
  );
}

function HorizontalSection({
  title,
  games,
  onPress,
}: {
  title: string;
  games: Game[];
  onPress: (id: string) => void;
}) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} onPress={() => onPress(item.id)} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  searchInput: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...typeScale.body,
  },
  sectionTitle: { ...typeScale.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  allGamesTitle: { ...typeScale.h3, color: colors.textPrimary, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipRow: { paddingBottom: spacing.md, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typeScale.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.textOnPrimary, fontWeight: "600" },
  gridItem: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: {
    height: 80,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  thumbInitial: { ...typeScale.h2, color: colors.primary },
  name: { ...typeScale.bodyMedium, color: colors.textPrimary },
  reward: { ...typeScale.coinInline, color: colors.coin, marginTop: 2 },
});
