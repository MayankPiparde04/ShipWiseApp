//Login page

import { useAuth } from "@/contexts/AuthContext";
import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
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

const Login = React.memo(() => {
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { fetchItems } = useInventory();
  const { fetchBoxes } = useBoxes();

  // Memoize the header component using NativeWind responsive classes
  const HeaderComponent = useMemo(
    () => (
      <View className="mb-8 md:mb-6 items-center">
        <View className="w-20 h-20 md:w-24 md:h-24 bg-blue-600 dark:bg-blue-500 rounded-full items-center justify-center mb-6 shadow-lg">
          <FontAwesome5
            name="shipping-fast"
            size={24}
            className="md:text-3xl"
            color="white"
          />
        </View>
        <Text className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
          Welcome Back
        </Text>
        <Text className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center">
          Sign in to your ShipWise account
        </Text>
      </View>
    ),
    []
  );

  // Optimize form input handling
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      await fetchItems();
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
    <SafeAreaView className="flex-1 bg-white/70 dark:bg-gray-950">
      <StatusBar style="auto" translucent={true} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
        enabled
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 120,
            paddingHorizontal: 24,
          }}
          className="md:px-4 lg:px-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View className="flex-1 justify-center px-2 md:px-6 lg:px-8">
            {/* Header */}
            {HeaderComponent}

            {/* Form */}
            <View className="space-y-8 md:space-y-6 gap-4 w-full max-w-md mx-auto">
              <View className="space-y-4">
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2 my-2">
                  Email Address
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: 14 }}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                    className="absolute left-4 top-4"
                  />
                </View>
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2 my-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: 14 }}
                  />
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                    className="absolute left-4 top-4"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={togglePasswordVisibility}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className={`w-full p-4 my-4 rounded-xl shadow-lg ${
                  isLoading
                    ? "bg-gray-400 dark:bg-gray-700"
                    : "bg-blue-700 dark:bg-blue-800"
                }`}
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
                <Text className="text-blue-600 dark:text-blue-400 text-center font-medium">
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center">
                <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                <Text className="mx-4 text-gray-500 dark:text-gray-400">
                  or
                </Text>
                <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
              </View>

              <View className="flex-row justify-center">
                <Text className="text-gray-500 text-lg dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text className="text-blue-600 text-lg dark:text-blue-400 font-semibold">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

Login.displayName = "LoginScreen";
export default Login;
