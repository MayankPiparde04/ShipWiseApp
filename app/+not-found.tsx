import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";
import { ArrowLeft } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-black px-6 pt-12">
        {/* Top-left back arrow */}
        <Link href="/" className="absolute top-12 left-6 z-10" asChild>
          <ArrowLeft size={28} color="#FFFFFF" />
        </Link>

        {/* Centered content */}
        <View className="flex-1 justify-center items-center">
          <Text className="text-3xl font-bold text-white mb-4">Oops!</Text>
          <Text className="text-lg text-gray-400 text-center">
            This screen does not exist.
          </Text>
        </View>
      </View>
    </>
  );
}