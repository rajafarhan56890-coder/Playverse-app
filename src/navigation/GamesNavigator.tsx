import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GamesListScreen from "../screens/games/GamesListScreen";
import GameDetailScreen from "../screens/games/GameDetailScreen";
import { colors } from "../theme/colors";

export type GamesStackParamList = {
  GamesList: undefined;
  GameDetail: { gameId: string };
};

const Stack = createNativeStackNavigator<GamesStackParamList>();

export default function GamesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgBase },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Stack.Screen name="GamesList" component={GamesListScreen} options={{ title: "Games" }} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}
