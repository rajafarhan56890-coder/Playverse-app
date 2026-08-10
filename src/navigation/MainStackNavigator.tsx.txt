import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// App Screens
import MainTabNavigator from "./MainTabNavigator";
import WithdrawalRequestScreen from "../screens/withdrawal/WithdrawalRequestScreen";
import ConversionCalculatorScreen from "../screens/wallet/ConversionCalculatorScreen";
import PrivacyPolicyScreen from "../screens/policy/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../screens/policy/TermsOfServiceScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  WithdrawalRequest: { availableCoins: number };
  ConversionCalculator: { coins: number };
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#0F0B1E" },
        animationEnabled: true,
      }}
    >
      {/* Main App Flow (includes the Games tab, which has its own nested
          stack for GamesList -> GameDetail -> GameTasks -> GamePlay) */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Wallet Screens */}
      <Stack.Group
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#7C3AED",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      >
        <Stack.Screen
          name="WithdrawalRequest"
          component={WithdrawalRequestScreen}
          options={{
            title: "Request Withdrawal",
            headerBackTitle: "Back",
          }}
        />

        <Stack.Screen
          name="ConversionCalculator"
          component={ConversionCalculatorScreen}
          options={{
            title: "Coins to Cash",
            headerBackTitle: "Back",
          }}
        />
      </Stack.Group>

      {/* Policy Screens */}
      <Stack.Group
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#7C3AED",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      >
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{
            title: "Privacy Policy",
            headerBackTitle: "Back",
          }}
        />

        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{
            title: "Terms of Service",
            headerBackTitle: "Back",
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
