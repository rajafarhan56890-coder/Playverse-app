import React from "react";
import { Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import GamesNavigator from "./GamesNavigator";
import OffersListScreen from "../screens/offers/OffersListScreen";
import WalletScreen from "../screens/wallet/WalletScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import { colors } from "../theme/colors";
import { typeScale } from "../theme/typography";
import { spacing } from "../theme/spacing";

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

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Home: "Home",
  Games: "Games",
  Offers: "Tasks & Offers",
  Wallet: "Wallet",
  Profile: "Profile",
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textOnPrimary, // ✅ FIXED: was colors.text.light
        headerTitleStyle: {
          fontSize: typeScale.h3.fontSize, // ✅ FIXED: was typeScale.subtitle
          fontWeight: "600",
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated, // ✅ FIXED: was colors.card
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 12,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary, // ✅ FIXED: was colors.text.secondary
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => (
          <Text
            style={[
              styles.iconText,
              {
                fontSize: focused ? 24 : 22,
                color: color,
              },
            ]}
          >
            {TAB_ICONS[route.name as keyof MainTabParamList]}
          </Text>
        ),
        tabBarLabel: ({ focused, color }) => (
          <Text
            style={[
              styles.labelText,
              {
                color: color,
                fontWeight: focused ? "600" : "500",
              },
            ]}
          >
            {TAB_LABELS[route.name as keyof MainTabParamList]}
          </Text>
        ),
      })}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerShown: true,
        }}
      />

      {/* Games Tab */}
      <Tab.Screen
        name="Games"
        component={GamesNavigator}
        options={{
          headerShown: false,
          title: "Games",
        }}
      />

      {/* Tasks & Offers Tab */}
      <Tab.Screen
        name="Offers"
        component={OffersListScreen}
        options={{
          title: "Tasks & Offers",
          headerShown: true,
        }}
      />

      {/* Wallet Tab */}
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: "Wallet",
          headerShown: true,
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconText: {
    textAlign: "center",
  },
  labelText: {
    fontSize: 11,
    marginTop: 4,
  },
});
