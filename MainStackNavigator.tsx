import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "./MainTabNavigator";
import LeaderboardScreen from "../screens/leaderboard/LeaderboardScreen";
import WithdrawalRequestScreen from "../screens/withdrawal/WithdrawalRequestScreen";
import WithdrawalHistoryScreen from "../screens/withdrawal/WithdrawalHistoryScreen";
import { colors } from "../theme/colors";

export type MainStackParamList = {
  Tabs: undefined;
  Leaderboard: undefined;
  WithdrawalRequest: undefined;
  WithdrawalHistory: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Wraps the 5-tab bottom navigator so screens that don't deserve their own
 * tab slot (Leaderboard, Withdrawal request/history) can still be pushed
 * on top from anywhere — e.g. Wallet's "Withdraw" button calls
 * navigation.navigate("WithdrawalRequest") and React Navigation resolves
 * it here automatically since it's not a route inside the tab navigator
 * itself.
 */
export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgBase },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ title: "Leaderboard" }}
      />
      <Stack.Screen
        name="WithdrawalRequest"
        component={WithdrawalRequestScreen}
        options={{ title: "Withdraw" }}
      />
      <Stack.Screen
        name="WithdrawalHistory"
        component={WithdrawalHistoryScreen}
        options={{ title: "Withdrawal History" }}
      />
    </Stack.Navigator>
  );
}
