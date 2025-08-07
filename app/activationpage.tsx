//ActivationPage page

import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
        `http://10.13.47.130:5000/api/check-verified`,
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
    <SafeAreaView style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', flex: 1 }}>
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
          <View className="flex-1 justify-center items-center px-6">
            {/* Header */}
            <View className="items-center mb-8">
              <View style={{ 
                width: 96, 
                height: 96, 
                backgroundColor: isDark ? '#1f2937' : '#dbeafe', 
                borderRadius: 48, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 24 
              }}>
                <Ionicons name="mail" size={40} color={isDark ? '#60a5fa' : '#3b82f6'} />
              </View>
              <Text style={{ fontSize: 30, fontWeight: 'bold', color: isDark ? '#f9fafb' : '#111827', textAlign: 'center', marginBottom: 8 }}>
                Verify Your Email
              </Text>
              <Text style={{ fontSize: 18, color: isDark ? '#d1d5db' : '#6b7280', textAlign: 'center', marginBottom: 16 }}>
                We've sent a verification link to:
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#60a5fa' : '#3b82f6', textAlign: 'center' }}>
                {email}
              </Text>
            </View>

            {/* Status Card */}
            <View style={{ 
              width: '100%', 
              backgroundColor: isDark ? '#1f2937' : '#ffffff', 
              borderRadius: 16, 
              shadowOpacity: 0.1, 
              shadowOffset: { width: 0, height: 2 }, 
              shadowRadius: 8, 
              padding: 24, 
              marginBottom: 24,
              elevation: 3
            }}>
              <View className="items-center">
                {isChecking ? (
                  <>
                    <ActivityIndicator
                      size="large"
                      color={isDark ? '#1f2937' : '#dbeafe'}
                      className="mb-4"
                    />
                    <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#f9fafb' : '#111827', marginBottom: 8 }}>
                      Checking verification status...
                    </Text>
                    <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', textAlign: 'center' }}>
                      We&apos;re automatically checking if you&apos;ve verified your
                      email.
                    </Text>
                  </>
                ) : isVerified ? (
                  <>
                    <View style={{ 
                      width: 64, 
                      height: 64, 
                      backgroundColor: '#10b981', 
                      borderRadius: 32, 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginBottom: 16 
                    }}>
                      <Ionicons
                        name="checkmark-circle"
                        size={32}
                        color="#ffffff"
                      />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#10b981', marginBottom: 8 }}>
                      Email Verified!
                    </Text>
                    <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', textAlign: 'center' }}>
                      Your account has been successfully activated.
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={{ 
                      width: 64, 
                      height: 64, 
                      backgroundColor: '#f59e0b', 
                      borderRadius: 32, 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginBottom: 16 
                    }}>
                      <Ionicons name="time-outline" size={32} color="#ffffff" />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#f9fafb' : '#111827', marginBottom: 8 }}>
                      Waiting for verification...
                    </Text>
                    <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', textAlign: 'center', marginBottom: 16 }}>
                      Please check your email and click the activation link.
                    </Text>
                    {timeLeft > 0 && (
                      <Text style={{ fontSize: 14, color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Link expires in: {formatTime(timeLeft)}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Instructions */}
            <View style={{ 
              width: '100%', 
              backgroundColor: isDark ? '#1f2937' : '#ffffff', 
              borderRadius: 16, 
              shadowOpacity: 0.1, 
              shadowOffset: { width: 0, height: 2 }, 
              shadowRadius: 8, 
              padding: 24, 
              marginBottom: 24,
              elevation: 3
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#f9fafb' : '#111827', marginBottom: 16 }}>
                What to do next:
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-start">
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: isDark ? '#1f2937' : '#dbeafe', 
                    borderRadius: 12, 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: 12, 
                    marginTop: 2 
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#60a5fa' : '#3b82f6' }}>1</Text>
                  </View>
                  <Text style={{ flex: 1, color: isDark ? '#d1d5db' : '#6b7280' }}>
                    Check your email inbox (and spam folder)
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: isDark ? '#1f2937' : '#dbeafe', 
                    borderRadius: 12, 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: 12, 
                    marginTop: 2 
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#60a5fa' : '#3b82f6' }}>2</Text>
                  </View>
                  <Text style={{ flex: 1, color: isDark ? '#d1d5db' : '#6b7280' }}>
                    Click the &quot;Activate Account&quot; link in the email
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: isDark ? '#1f2937' : '#dbeafe', 
                    borderRadius: 12, 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: 12, 
                    marginTop: 2 
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#60a5fa' : '#3b82f6' }}>3</Text>
                  </View>
                  <Text style={{ flex: 1, color: isDark ? '#d1d5db' : '#6b7280' }}>
                    Return to this app - we&apos;ll detect the verification
                    automatically
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="w-full space-y-4">
              <TouchableOpacity
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  padding: 16,
                  borderRadius: 12,
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 8,
                  elevation: 3
                }}
                onPress={resendActivationEmail}
              >
                <Text style={{ color: '#ffffff', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                  Resend Activation Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  width: '100%',
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  padding: 16,
                  borderRadius: 12
                }}
                onPress={() => router.replace("/login")}
              >
                <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8">
              <Text style={{ fontSize: 14, color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                Didn&apos;t receive the email? Check your spam folder or try
                resending.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
