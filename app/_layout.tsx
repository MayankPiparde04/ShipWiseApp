// app/_layout.tsx
// Root Layout for screens

import "react-native-reanimated";
import "./global.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;
  // jo screen top pr rahegi wo show hogi sbse pahale
  //tabs ki routing setup ho chuki he login, register, or activation ki kar de
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="activationpage" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
