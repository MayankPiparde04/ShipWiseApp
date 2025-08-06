// app/_layout.tsx
import "react-native-reanimated";
import "./global.css";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BoxProvider } from "@/contexts/BoxContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { OptimalProvider } from "@/contexts/OptimalContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (!isLoading && loaded) {
      const inAuthGroup = segments[0] === "(tabs)";
      
      if (user && !inAuthGroup) {
        router.replace("/(tabs)");
      } else if (!user && inAuthGroup) {
        router.replace("/login");
      }
    }
  }, [user, isLoading, loaded, segments]);

  if (!loaded) return null;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen 
          name="activationpage" 
          options={{
            gestureEnabled: false, // Prevent going back during activation
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <BoxProvider>
          <OptimalProvider>
          <RootLayoutNav />
          </OptimalProvider>
        </BoxProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}