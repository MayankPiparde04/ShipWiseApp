//register page

import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="mb-8 items-center">
              <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                <Ionicons name="person-add" size={32} color="white" />
              </View>
              <Text className="text-4xl font-bold text-white text-center mb-2">
                Create Account
              </Text>
              <Text className="text-lg text-gray-400 text-center">
                Join ShipWise today
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View className="mt-2">
                <Text className="text-sm font-semibold text-gray-300 ml-2 mt-1">
                  Full Name
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 border border-gray-700 rounded-xl bg-gray-800 text-white shadow-sm"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(value) => updateField("name", value)}
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9CA3AF"
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <View className="mt-2">
                <Text className="text-sm font-semibold text-gray-300 ml-2 mt-1">
                  Email Address
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 border border-gray-700 rounded-xl bg-gray-800 text-white shadow-sm"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => updateField("email", value)}
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

              <View className="mt-2">
                <Text className="text-sm font-semibold text-gray-300 ml-2 mt-1">
                  Phone Number
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 border border-gray-700 rounded-xl bg-gray-800 text-white shadow-sm"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(value) => updateField("phone", value)}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#9CA3AF"
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <View className="mt-2">
                <Text className="text-sm font-semibold text-gray-300 ml-2 mt-1">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 pr-12 border border-gray-700 rounded-xl bg-gray-800 text-white shadow-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(value) => updateField("password", value)}
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

              <View className="mt-2">
                <Text className="text-sm font-semibold text-gray-300 ml-2 mt-1">
                  Confirm Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pl-12 border border-gray-700 rounded-xl bg-gray-800 text-white shadow-sm"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      updateField("confirmPassword", value)
                    }
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
                </View>
              </View>

              <TouchableOpacity
                className={`w-full p-4 rounded-xl ${
                  isLoading ? "bg-gray-600" : "bg-blue-600"
                } shadow-lg mt-6`}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" size="small" />
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
                <View className="flex-1 h-px bg-gray-700" />
                <Text className="mx-4 text-gray-400">or</Text>
                <View className="flex-1 h-px bg-gray-700" />
              </View>
              <View className="flex-row justify-center">
                <Text className="text-gray-400">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text className="text-blue-400 font-semibold">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
