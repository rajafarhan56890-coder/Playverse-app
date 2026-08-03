/**
 * PlayVerse brand palette.
 * Deep space-violet base (not pure black) with an electric violet primary
 * and warm amber reserved specifically for coins/rewards, so "money" always
 * reads as a distinct color language from the rest of the UI.
 */
export const colors = {
  // Backgrounds
  bgBase: "#0F0B1E", // deep space violet, app background
  bgElevated: "#181129", // cards, sheets
  bgElevated2: "#221A38", // nested cards, input fields

  // Brand
  primary: "#7B5CFF", // electric violet — primary actions, active states
  primaryPressed: "#6647E0",
  secondary: "#FF5CA8", // magenta — secondary accents, highlights

  // Coins / rewards — never reused for anything else in the UI
  coin: "#FFB020",
  coinGlow: "#FFD37A",

  // Semantic
  success: "#2DD4BF",
  danger: "#FF5C5C",
  warning: "#FFB020",

  // Text
  textPrimary: "#F3F1FF",
  textSecondary: "#A79FCB",
  textMuted: "#6B6488",
  textOnPrimary: "#0F0B1E",

  // Borders / dividers
  border: "#2C2447",

  // Utility
  overlay: "rgba(15, 11, 30, 0.7)",
} as const;

export type ColorToken = keyof typeof colors;
