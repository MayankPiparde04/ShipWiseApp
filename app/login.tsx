//Login page

import { useAuth } from "@/contexts/AuthContext";
import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { fetchItems } = useInventory(); // <-- add this
  const { fetchBoxes } = useBoxes();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      await fetchItems();   // <-- add this
      await fetchBoxes(); 
      // Navigation is now handled in AuthContext
    } catch (error: any) {
      if (
        error.message?.includes("not activated") ||
        error.message?.includes("verify your email")
      ) {
        Alert.alert(
          "Account Not Activated",
          "Please verify your email address first.",
          [
            {
              text: "Go to Activation",
              onPress: () =>
                router.push({
                  pathname: "/activationpage",
                  params: { email: email.trim() },
                }),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        Alert.alert(
          "Login Failed",
          error.message || "An error occurred during login"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-gray-950 to-gray-900">
      <StatusBar style="light" translucent={true} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="mb-12 items-center">
              <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                <FontAwesome5 name="shipping-fast" size={24} color="white" />
              </View>
              <Text className="text-4xl font-bold text-white text-center mb-2">
                Welcome Back
              </Text>
              <Text className="text-lg text-gray-400 text-center">
                Sign in to your ShipWise account
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-8">
              <View>
                <Text className="text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 border border-gray-700 rounded-xl bg-gray-800 text-white shadow-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#9CA3AF"
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-gray-300 mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 pr-12 border border-gray-700 rounded-xl bg-gray-800 text-white shadow-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className={`w-full p-4 my-2 rounded-xl ${
                  isLoading ? "bg-gray-600" : "bg-blue-600"
                } shadow-lg`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white text-center text-lg font-semibold ml-2">
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8 space-y-4">
              <TouchableOpacity>
                <Text className="text-blue-400 text-center font-medium">
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center">
                <View className="flex-1 h-px bg-gray-700" />
                <Text className="mx-4 text-gray-400">or</Text>
                <View className="flex-1 h-px bg-gray-700" />
              </View>

              <View className="flex-row justify-center">
                <Text className="text-gray-400">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text className="text-blue-400 font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
