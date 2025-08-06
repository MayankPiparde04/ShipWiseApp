import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { MotiView } from "moti";
import { Text } from "react-native";

export default function TabLayout() {
  const pathname = usePathname();
  const hideTabBar = pathname === "/gemini";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconMap = {
    index: "home",
    inventory: "archive",
    gemini: "camera",
    analysis: "bar-chart",
    profile: "user",
  };

  return (
    <Tabs
      screenOptions={({ route }) => {
        const iconName = iconMap[route.name as keyof typeof iconMap];

        return {
          headerShown: false,
          tabBarShowLabel: false,

          // 🧊 Tab bar style with dynamic theme
          tabBarStyle: hideTabBar
            ? { display: "none" }
            : {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                paddingTop: 12,
                height: 74,
                paddingHorizontal: 8,
                backgroundColor: isDark ? "#030712" : "#fafafa",
                borderColor: isDark ? "#242424" : "#e5e7eb",
                borderTopWidth: 1,
                elevation: 12,
              },

          //  Animated tab icon + label pill
          tabBarIcon: ({ focused }) => (
            <MotiView
              from={{ scale: 0.95, opacity: 0.8 }}
              animate={{
                scale: focused ? 1.05 : 1,
                opacity: focused ? 1 : 0.8,
              }}
              transition={{
                type: "timing",
                duration: 250,
              }}
              style={[
                {
                  backgroundColor: focused
                    ? isDark
                      ? "#3f2557"
                      : "#e1e1fe"
                    : "transparent",
                },
              ]}
              className="flex-col items-center justify-center rounded-full px-1 h-10 min-w-[74px] min-h-[48px]"
            >
              <Feather
                name={iconName as any}
                size={20}
                color={
                  focused
                    ? isDark
                      ? "#aaf"
                      : "#125"
                    : isDark
                      ? "#aac"
                      : "#44a"
                }
              />
              {focused && (
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isDark ? "#ddf" : "#3a358e" }}
                >
                  {route.name.charAt(0).toUpperCase() + route.name.slice(1)}
                </Text>
              )}
            </MotiView>
          ),
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
