// app/_layout.tsx or app/(tabs)/_layout.tsx if you're using segmented routes
import { Tabs, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Platform } from "react-native";
import clsx from "clsx";

export default function TabLayout() {
  const pathname = usePathname(); // Get current route

  const hideTabBar = pathname === "/gemini"; // Gemini page only

  return (
    <Tabs
      screenOptions={({ route }) => {
        const iconMap = {
          index: "home",
          inventory: "archive",
          gemini: "camera",
          analysis: "bar-chart",
          profile: "user",
        };

        const iconName =
          iconMap[route.name as keyof typeof iconMap] || "circle";
        const isGemini = route.name === "gemini";

        const activeColor = "#7DD3FC";
        const inactiveColor = "#64748B";

        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: hideTabBar
            ? { display: "none" } // 👈 Hides tab bar only on Gemini
            : Platform.select({
                ios: {
                  position: "absolute",
                  bottom: 14,
                  left: 16,
                  right: 16,
                  height: 68,
                  borderRadius: 28,
                  backgroundColor: "#0e1721fa",
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
                  bottom: 14,
                  left: 16,
                  right: 16,
                  height: 68,
                  borderRadius: 36,
                  backgroundColor: "#0e1721fa",
                  borderWidth: 1,
                  borderColor: "#1E293B",
                  paddingHorizontal: 12,
                },
              }),
          tabBarIcon: ({ focused }) => {
            if (isGemini) {
              return (
                <MotiView
                  from={{ scale: 1, translateY: 0, opacity: 0.8 }}
                  animate={{
                    scale: focused ? 1.2 : 1,
                    translateY: focused ? -12 : -8,
                    opacity: 0.9,
                  }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 120,
                  }}
                  className="rounded-full w-14 h-14 -mb-8 justify-center items-center bg-sky-600/60 shadow-lg shadow-sky-300/60"
                >
                  <Feather name="camera" size={28} color="#FFFFFF" />
                </MotiView>
              );
            }

            return (
              <MotiView
                from={{ scale: 1, translateY: 0, opacity: 1 }}
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
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="inventory" options={{ title: "Inventory" }} />
      <Tabs.Screen name="gemini" options={{ title: "Gemini" }} />
      <Tabs.Screen name="analysis" options={{ title: "Analysis" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
