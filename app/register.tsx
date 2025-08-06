//register page

import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
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

const Register = React.memo(() => {
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Memoize update field to prevent recreation on each render
  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone } = formData;

    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password, phone.trim());
      Alert.alert(
        "Registration Successful! 🎉",
        "Please check your email for activation instructions",
        [
          {
            text: "Continue",
            onPress: () =>
              router.replace({
                pathname: "/activationpage",
                params: { email: email.trim() },
              }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "An error occurred during registration"
      );
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
            paddingBottom: 120, // Extra padding to ensure content is above keyboard
          }}
          className="px-4 md:px-8 lg:px-12" // Responsive padding
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View className="flex-1 justify-center py-4 md:py-6 lg:py-8 gap-2">
            {/* Header - Using NativeWind responsive classes */}
            <View className="mb-6 md:mb-8 items-center">
              <View className="w-20 h-20 md:w-24 md:h-24 bg-blue-600 dark:bg-blue-700 rounded-full items-center justify-center mb-6 shadow-lg">
                <Ionicons
                  name="person-add"
                  size={32}
                  className="text-3xl md:text-4xl"
                  color="white"
                />
              </View>
              <Text className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                Create Account
              </Text>
              <Text className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center">
                Join ShipWise today
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-3 gap-2 px-2 md:space-y-4 w-full max-w-md ">
              <View className="mt-2 gap-2 ">
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300 ml-2 mt-1">
                  Full Name
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(value) => updateField("name", value)}
                    editable={!isLoading}
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <View className="mt-2 gap-2">
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300 ml-2 mt-1">
                  Email Address
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => updateField("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <View className="mt-2 gap-2">
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300 ml-2 mt-1">
                  Phone Number
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(value) => updateField("phone", value)}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <View className="mt-2 gap-2">
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300 ml-2 mt-1">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(value) => updateField("password", value)}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-2 gap-2">
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300 ml-2 mt-1">
                  Confirm Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      updateField("confirmPassword", value)
                    }
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <TouchableOpacity
                className={`w-full p-4 rounded-xl ${
                  isLoading
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-blue-700 dark:bg-blue-800"
                } shadow-lg mt-6`}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text className="text-white text-center text-lg font-semibold ml-2">
                      Creating Account...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8">
              <View className="flex-row justify-center items-center mb-4">
                <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-600" />
                <Text className="mx-4 text-gray-500 dark:text-gray-400">
                  or
                </Text>
                <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-600" />
              </View>
              <View className="flex-row justify-center">
                <Text className="text-gray-500  text-lg dark:text-gray-400">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text className="text-blue-600 text-lg dark:text-blue-400 font-semibold">
                    Sign In
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

Register.displayName = "Register";
export default Register;
