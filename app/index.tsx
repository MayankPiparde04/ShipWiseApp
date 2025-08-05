import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const theme = useAppTheme();

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${theme.bg}`}>
        <Text className={theme.text}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
