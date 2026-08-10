import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GamesListScreen from "../screens/games/GamesListScreen";
import GameDetailScreen from "../screens/games/GameDetailScreen";
import GameTaskScreen from "../screens/games/GameTaskScreen";
import GamePlayScreen from "../screens/games/GamePlayScreen";
import { colors } from "../theme/colors";
import type { GameEngine } from "../types/models";

export type GamesStackParamList = {
  GamesList: undefined;
  GameDetail: { gameId: string };
  GameTasks: { gameId: string };
  GamePlay: {
    gameId: string;
    levelNumber: number;
    coinsReward: number;
    gameName: string;
    engine: GameEngine;
  };
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
      <Stack.Screen name="GameTasks" component={GameTaskScreen} options={{ title: "Levels" }} />
      <Stack.Screen
        name="GamePlay"
        component={GamePlayScreen}
        options={{ title: "Play Game", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
