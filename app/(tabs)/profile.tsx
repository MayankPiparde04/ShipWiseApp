import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Profile</Text>

        <View className="bg-white p-6 rounded-lg shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {user?.name}
          </Text>
          <Text className="text-gray-600 mb-1">{user?.email}</Text>
          <Text className="text-gray-600">{user?.phone}</Text>
        </View>

        <TouchableOpacity
          className="bg-red-600 p-4 rounded-lg"
          onPress={logout}
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
