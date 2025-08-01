import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Items Management
        </Text>
        <Text className="text-gray-600">
          Manage your inventory items here
        </Text>
      </View>
    </SafeAreaView>
  );
}
