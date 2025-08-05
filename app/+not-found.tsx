import { useAppTheme } from "@/hooks/useAppTheme";
import { Link, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  const theme = useAppTheme();
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className={`flex-1 ${theme.bg} px-6 pt-12`}>
        {/* Top-left back arrow */}
        <Link href="/" className="absolute top-12 left-6 z-10" asChild>
          <ArrowLeft size={28} color={theme.text} />
        </Link>

        {/* Centered content */}
        <View className="flex-1 justify-center items-center">
          <Text className={`text-3xl font-bold ${theme.text} mb-4`}>Oops!</Text>
          <Text className={`text-lg ${theme.textSecondary} text-center`}>
            This screen does not exist.
          </Text>
        </View>
      </View>
    </>
  );
}
