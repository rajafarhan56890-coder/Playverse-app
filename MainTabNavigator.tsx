import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import GamesNavigator from "./GamesNavigator";
import OffersListScreen from "../screens/offers/OffersListScreen";
import WalletScreen from "../screens/wallet/WalletScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import { colors } from "../theme/colors";

export type MainTabParamList = {
  Home: undefined;
  Games: undefined;
  Offers: undefined;
  Wallet: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: "🏠",
  Games: "🎮",
  Offers: "🎁",
  Wallet: "💰",
  Profile: "👤",
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bgBase },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: () => (
          <Text style={{ fontSize: 20 }}>
            {TAB_ICONS[route.name as keyof MainTabParamList]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "PlayVerse" }} />
      <Tab.Screen name="Games" component={GamesNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Offers" component={OffersListScreen} options={{ title: "Tasks & Offers" }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: "Wallet" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
