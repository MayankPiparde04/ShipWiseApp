//Login page

import { useAuth } from "@/contexts/AuthContext";
import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
  const theme = useAppTheme();
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
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      <StatusBar style="auto" translucent={true} />

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
              <View className={`w-20 h-20 ${theme.buttonSecondary} rounded-full items-center justify-center mb-6 shadow-lg`}>
                <FontAwesome5 name="shipping-fast" size={24} color="white" />
              </View>
              <Text className={`text-4xl font-bold ${theme.text} text-center mb-2`}>
                Welcome Back
              </Text>
              <Text className={`text-lg ${theme.textSecondary} text-center`}>
                Sign in to your ShipWise account
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-8">
              <View>
                <Text className={`text-sm font-semibold ${theme.textSecondary} mb-2 my-2`}>
                  Email Address
                </Text>
                <View className="relative">
                  <TextInput
                    className={`w-full p-4 pl-12 ${theme.input} rounded-xl shadow-sm`}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    placeholderTextColor={theme.textMuted}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={theme.textMuted}
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                </View>
              </View>

              <View>
                <Text className={`text-sm font-semibold ${theme.textSecondary} mb-2 my-2`}>
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className={`w-full p-4 pl-12 pr-12 ${theme.input} rounded-xl shadow-sm`}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    placeholderTextColor={theme.textMuted}
                  />
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.textMuted}
                    style={{ position: "absolute", left: 14, top: 10 }}
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  {
                    backgroundColor: isLoading ? theme.textMuted : theme.buttonSecondary,
                  }
                ]}
                className="w-full p-4 my-4 rounded-xl shadow-lg"
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
                <Text className={`${theme.accentText} text-center font-medium`}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center">
                <View className={`flex-1 h-px ${theme.border.replace('border-', 'bg-')}`} />
                <Text className={`mx-4 ${theme.textMuted}`}>or</Text>
                <View className={`flex-1 h-px ${theme.border.replace('border-', 'bg-')}`} />
              </View>

              <View className="flex-row justify-center">
                <Text className={theme.textMuted}>Don&apos;t have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text className={`${theme.accentText} font-semibold`}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
