import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-black">
        <Text className="text-xl font-semibold text-red-600">
          This screen does not exist.
        </Text>
        <Link href="/" asChild>
          <Text className="mt-4 py-4 text-blue-500 underline">
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
