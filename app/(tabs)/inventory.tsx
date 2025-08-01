// tab2 / inventory management
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Inventory() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" translucent={true} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 p-2">
            {/*  Es view ke ander hi chhedna if kre to  */}
            <Text className="text-2xl font-bold text-gray-100">Inventory</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
