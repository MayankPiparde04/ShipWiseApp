import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Platform, View } from "react-native";
import clsx from "clsx";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            height: 74,
            borderRadius: 28,
            backgroundColor: "#0F172Aee",
            borderWidth: 1,
            borderColor: "#1E293B",
            shadowColor: "#0EA5E9",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 12,
            paddingHorizontal: 12,
          },
          android: {
            elevation: 20,
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            height: 74,
            borderRadius: 28,
            backgroundColor: "#0F172Aee",
            borderWidth: 1,
            borderColor: "#1E293B",
            paddingHorizontal: 12,
          },
        }),
        tabBarIcon: ({ focused }) => {
          const iconMap = {
            index: "home",
            inventory: "archive",
            Gemini: "camera",
            analysis: "bar-chart",
            profile: "user",
          };

          const isCamera = route.name === "Gemini";
          const iconName = iconMap[route.name as keyof typeof iconMap] || "circle";

          const activeColor = "#7DD3FC"; // sky-300
          const inactiveColor = "#64748B"; // slate-500

          if (isCamera) {
            return (
              <MotiView
                from={{ scale: 1, translateY: 0, opacity: 0.8 }}
                animate={{
                  scale: focused ? 1.2 : 1,
                  translateY: focused ? -12 : -8,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 120,
                }}
                className={clsx(
                  "p-4 rounded-full -mb-8 bg-sky-500 shadow-lg shadow-sky-300"
                )}
              >
                <Feather
                  name={iconName}
                  size={28}
                  color="#FFFFFF"
                />
              </MotiView>
            );
          }

          return (
            <MotiView
              from={{ scale: 1, translateY: 0, opacity: 0.8 }}
              animate={{
                scale: focused ? 1.15 : 1,
                translateY: focused ? -8 : 0,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 120,
              }}
              className={clsx(
                "rounded-full -mb-8",
                focused
                  ? "bg-sky-700/30 shadow-md shadow-sky-500/40"
                  : "bg-transparent"
              )}
            >
              <Feather
                name={iconName}
                size={22}
                color={focused ? activeColor : inactiveColor}
              />
            </MotiView>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="inventory" options={{ title: "Inventory" }} />
      <Tabs.Screen
        name="gemini"
        options={{
          title: "Gemini",
          tabBarIconStyle: {
            top: -16,
          },
        }}
      />
      <Tabs.Screen name="analysis" options={{ title: "Analysis" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
