/**
 * Type system:
 * - Display: "Sora" — geometric, confident, used for headings and the coin balance.
 * - Body: "Inter" — neutral, highly legible at small sizes.
 * - Numeric: "JetBrains Mono" — used ONLY for coin counts/amounts, so every
 *   number in the app that represents money reads with tabular, ticking-counter
 *   precision distinct from prose text.
 *
 * Install via @expo-google-fonts/sora, @expo-google-fonts/inter,
 * @expo-google-fonts/jetbrains-mono and load with `useFonts` in App.tsx.
 */
export const fonts = {
  displayBold: "Sora_700Bold",
  displaySemiBold: "Sora_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  numeric: "JetBrainsMono_600SemiBold",
} as const;

export const typeScale = {
  h1: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: fonts.displaySemiBold, fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: fonts.displaySemiBold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  coinBalance: { fontFamily: fonts.numeric, fontSize: 36, lineHeight: 42 },
  coinInline: { fontFamily: fonts.numeric, fontSize: 15, lineHeight: 20 },
} as const;
