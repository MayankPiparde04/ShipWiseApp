import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShippingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Shipping Calculator
        </Text>
        <Text className="text-gray-600">
          Calculate optimal shipping solutions
        </Text>
      </View>
    </SafeAreaView>
  );
}
