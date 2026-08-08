import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// App Screens
import MainTabNavigator from "./MainTabNavigator";
import GameDetailScreen from "../screens/games/GameDetailScreen";
import GameTaskScreen from "../screens/games/GameTaskScreen";
import GamePlayScreen from "../screens/games/GamePlayScreen";
import WithdrawalRequestScreen from "../screens/withdrawal/WithdrawalRequestScreen";
import ConversionCalculatorScreen from "../screens/wallet/ConversionCalculatorScreen";
import PrivacyPolicyScreen from "../screens/policy/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../screens/policy/TermsOfServiceScreen";

// Admin Screens (React Web - can be rendered in WebView or separate admin app)
// import AdminDashboard from "../screens/admin/AdminDashboard";
// import PaymentMethodsPage from "../screens/admin/PaymentMethodsPage";
// import GamesManagementPage from "../screens/admin/GamesManagementPage";
// import AdminSettingsPage from "../screens/admin/AdminSettingsPage";

export type RootStackParamList = {
  MainTabs: undefined;
  GameDetail: { gameId: string };
  GameTasks: { gameId: string };
  GamePlay: {
    gameId: string;
    levelNumber: number;
    coinsReward: number;
    gameName: string;
  };
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
      {/* Main App Flow */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Game Screens */}
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
          name="GameDetail"
          component={GameDetailScreen}
          options={{
            title: "Game Details",
            headerBackTitle: "Back",
          }}
        />

        <Stack.Screen
          name="GameTasks"
          component={GameTaskScreen}
          options={{
            title: "Levels",
            headerBackTitle: "Back",
          }}
        />

        <Stack.Screen
          name="GamePlay"
          component={GamePlayScreen}
          options={{
            title: "Play Game",
            headerBackTitle: "Back",
            animationEnabled: true,
          }}
        />
      </Stack.Group>

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
