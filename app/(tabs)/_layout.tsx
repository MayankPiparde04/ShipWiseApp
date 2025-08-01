// Sub layout for tabs

import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
        }}
      />
      <Tabs.Screen
        name="gemini"
        options={{
          title: "Gemini",
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: "Analysis",
        }}
      />
    </Tabs>
  );
}
