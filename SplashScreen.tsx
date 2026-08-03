import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { typeScale } from "../theme/typography";
import { spacing, radius } from "../theme/spacing";

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoMark, { transform: [{ scale }], opacity }]}>
        <Text style={styles.logoText}>PV</Text>
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity }]}>PlayVerse</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity }]}>
        Play. Earn. Level up.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  logoText: { ...typeScale.h1, color: colors.textOnPrimary },
  title: { ...typeScale.h1, color: colors.textPrimary },
  tagline: { ...typeScale.body, color: colors.textSecondary, marginTop: spacing.xs },
});
