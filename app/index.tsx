import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexScreen = React.memo(() => {
  const { user, isLoading } = useAuth();

  // Pre-render loading screen with pure NativeWind responsive classes
  const loadingScreen = useMemo(() => {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-4">
        <View className="w-full md:w-2/3 max-w-md flex items-center p-4 portrait:flex-col portrait:space-y-4 landscape:flex-row landscape:space-x-4">
          <ActivityIndicator
            size="medium"
            color="#0000ff"
            className="md:scale-125"
          />
          <Text className="text-gray-900 dark:text-gray-100 text-center font-medium text-base md:text-xl">
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }, []); // No dependencies needed anymore

  // Optimize render cycles
  useFocusEffect(
    React.useCallback(() => {
      // This would run any side effects when screen is focused
      return () => {
        // Cleanup when screen loses focus
      };
    }, [])
  );

  if (isLoading) {
    return loadingScreen;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
});

IndexScreen.displayName = "IndexScreen";

export default IndexScreen;
