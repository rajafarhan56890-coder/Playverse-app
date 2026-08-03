import React, { useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreenModule from "expo-splash-screen";
import { View } from "react-native";
import { useFonts, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_600SemiBold } from "@expo-google-fonts/jetbrains-mono";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";

// Keep the native splash screen visible until PlayVerse fonts finish loading,
// so there's never a frame of system-default fonts flashing before our
// branded type system (Sora/Inter/JetBrains Mono) is ready.
SplashScreenModule.preventAutoHideAsync().catch(() => {
  /* no-op if already hidden */
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_600SemiBold,
  });

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreenModule.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  if (!fontsLoaded && !fontError) {
    // Native splash screen is still showing at this point.
    return <View style={{ flex: 1, backgroundColor: colors.bgBase }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}
