//ActivationPage page

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivationPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isChecking, setIsChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkVerificationStatus = async () => {
    if (!email) return;

    try {
      const response = await fetch(
        `http://10.11.47.241:5000/api/check-verified`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.success && data.verified) {
        setIsVerified(true);
        setIsChecking(false);

        // Clear intervals
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);

        Alert.alert(
          "Email Verified! 🎉",
          "Your account has been successfully activated. You can now sign in.",
          [
            {
              text: "Continue to Login",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      console.error("Verification check error:", error);
      setIsChecking(false);
    }
  };

  const resendActivationEmail = async () => {
    if (!email) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/resend-activation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Email Sent",
          "A new activation email has been sent to your inbox."
        );
        setTimeLeft(30 * 60); // Reset timer
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to resend activation email"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend activation email");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!email) {
      router.replace("/login");
      return;
    }

    // Initial check
    checkVerificationStatus();

    // Set up polling interval (every 3 seconds)
    intervalRef.current = setInterval(checkVerificationStatus, 3000);

    // Set up countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, router]);

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      <StatusBar style="dark" translucent={true} />

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
          <View className="flex-1 justify-center items-center px-6">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-6">
                <Ionicons name="mail" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
                Verify Your Email
              </Text>
              <Text className="text-lg text-gray-600 text-center mb-4">
                We've sent a verification link to:
              </Text>
              <Text className="text-lg font-semibold text-blue-600 text-center">
                {email}
              </Text>
            </View>

            {/* Status Card */}
            <View className="w-full bg-white rounded-2xl shadow-lg p-6 mb-6">
              <View className="items-center">
                {isChecking ? (
                  <>
                    <ActivityIndicator
                      size="large"
                      color="#2563EB"
                      className="mb-4"
                    />
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      Checking verification status...
                    </Text>
                    <Text className="text-gray-600 text-center">
                      We're automatically checking if you've verified your
                      email.
                    </Text>
                  </>
                ) : isVerified ? (
                  <>
                    <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                      <Ionicons
                        name="checkmark-circle"
                        size={32}
                        color="#059669"
                      />
                    </View>
                    <Text className="text-lg font-semibold text-green-600 mb-2">
                      Email Verified!
                    </Text>
                    <Text className="text-gray-600 text-center">
                      Your account has been successfully activated.
                    </Text>
                  </>
                ) : (
                  <>
                    <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-4">
                      <Ionicons name="time-outline" size={32} color="#D97706" />
                    </View>
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      Waiting for verification...
                    </Text>
                    <Text className="text-gray-600 text-center mb-4">
                      Please check your email and click the activation link.
                    </Text>
                    {timeLeft > 0 && (
                      <Text className="text-sm text-gray-500">
                        Link expires in: {formatTime(timeLeft)}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Instructions */}
            <View className="w-full bg-white rounded-2xl shadow-lg p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                What to do next:
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-start">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-xs font-bold text-blue-600">1</Text>
                  </View>
                  <Text className="flex-1 text-gray-700">
                    Check your email inbox (and spam folder)
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-xs font-bold text-blue-600">2</Text>
                  </View>
                  <Text className="flex-1 text-gray-700">
                    Click the "Activate Account" link in the email
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-xs font-bold text-blue-600">3</Text>
                  </View>
                  <Text className="flex-1 text-gray-700">
                    Return to this app - we'll detect the verification
                    automatically
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="w-full space-y-4">
              <TouchableOpacity
                className="w-full bg-blue-600 p-4 rounded-xl shadow-lg"
                onPress={resendActivationEmail}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Resend Activation Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full bg-gray-200 p-4 rounded-xl"
                onPress={() => router.replace("/login")}
              >
                <Text className="text-gray-700 text-center text-lg font-semibold">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8">
              <Text className="text-sm text-gray-500 text-center">
                Didn't receive the email? Check your spam folder or try
                resending.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
