import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import MainStackNavigator from "./MainStackNavigator";
import SplashScreen from "../screens/SplashScreen";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import { typeScale } from "../theme/typography";
import { spacing } from "../theme/spacing";

export default function RootNavigator() {
  const { firebaseUser, isLoading, isBlocked, init } = useAuthStore();

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (firebaseUser && isBlocked) {
    return (
      <View style={styles.center}>
        <Text style={styles.blockedTitle}>Account suspended</Text>
        <Text style={styles.blockedBody}>
          Your PlayVerse account has been suspended. Contact support for help.
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {firebaseUser ? <MainStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bgBase,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  blockedTitle: { ...typeScale.h2, color: colors.danger, marginBottom: spacing.sm },
  blockedBody: { ...typeScale.body, color: colors.textSecondary, textAlign: "center" },
});
