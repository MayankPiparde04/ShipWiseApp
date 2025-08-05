import { Tabs, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useColorScheme, Pressable, Text } from "react-native";
import clsx from "clsx";

export default function TabLayout() {
  const pathname = usePathname();
  const hideTabBar = pathname === "/gemini";

  // Use system theme
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
                backgroundColor: isDark ? "#050d15" : "#ffffff",
                borderColor: isDark ? "#1f2937" : "#e5e7eb",
                borderWidth: 1,
                elevation: 12,
              },

          // 🚫 Remove ripple effect
          tabBarButton: (props) => (
            <Pressable
              android_ripple={null}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              {...props}
            />
          ),

          // 💫 Animated tab icon + label pill
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
              className={clsx(
                "flex-col items-center justify-center rounded-full px-1 h-10 min-w-[74px] min-h-[48px]",
                focused
                  ? isDark
                    ? "bg-[#102f46]" // dark mode active pill
                    : "bg-[#e0f2ff]" // light mode active pill
                  : "bg-transparent"
              )}
            >
              <Feather
                name={iconName}
                size={20}
                color={
                  focused
                    ? isDark
                      ? "#ffffff"
                      : "#0c4a6e"
                    : isDark
                    ? "#6b7280"
                    : "#9ca3af"
                }
              />
              {focused && (
                <Text
                  className={clsx(
                    "text-sm font-semibold",
                    isDark ? "text-white" : "text-[#0c4a6e]"
                  )}
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
