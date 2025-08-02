import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Bug } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Analysis() {
  const route = useRoute();
  const navigation = useNavigation();
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Log what we're receiving in the route params
      console.log("Route params:", JSON.stringify(route.params));

      // Check for content parameter (from Gemini component)
      const contentParam = route.params?.content;
      const resultParam = route.params?.result;

      // Try to parse the content if it exists (it might be stringified JSON)
      if (contentParam && typeof contentParam === "string") {
        try {
          const parsed = JSON.parse(contentParam);
          console.log("Successfully parsed content param");
          setParsedResult(parsed);
        } catch (e) {
          console.log("Content param is not valid JSON, using as string");
          setParsedResult(contentParam);
        }
      }
      // Otherwise try the result param
      else if (resultParam) {
        if (typeof resultParam === "string") {
          try {
            const parsed = JSON.parse(resultParam);
            console.log("Successfully parsed result param");
            setParsedResult(parsed);
          } catch (e) {
            console.log("Result param is not valid JSON, using as string");
            setParsedResult(resultParam);
          }
        } else {
          // Result is already an object
          setParsedResult(resultParam);
        }
      } else {
        console.log("No content or result found in params");
        setError("No data received from previous screen");
        setParsedResult(null);
      }
    } catch (e) {
      console.error("Error processing route params:", e);
      setError(`Error loading data: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [route.params]);

  // Function to render content based on its type
  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-600">Loading analysis data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="bg-red-100 rounded-2xl p-4">
          <Text className="text-red-600 font-medium">Error</Text>
          <Text className="text-red-500 mt-1">{error}</Text>
        </View>
      );
    }

    if (!parsedResult) {
      return (
        <View className="bg-yellow-100 rounded-2xl p-4">
          <Text className="text-yellow-800">No data available.</Text>
        </View>
      );
    }

    // For object/array, format it nicely
    if (typeof parsedResult === "object") {
      return (
        <View className="bg-gray-100 rounded-2xl p-4 shadow-md">
          <Text className="text-base text-gray-700 leading-relaxed">
            {JSON.stringify(parsedResult, null, 2)}
          </Text>
        </View>
      );
    }

    // For string or other primitive
    return (
      <View className="bg-gray-100 rounded-2xl p-4 shadow-md">
        <Text className="text-base text-gray-700 leading-relaxed">
          {String(parsedResult)}
        </Text>
      </View>
    );
  };

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
          className="px-4 py-2"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="p-2"
              >
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold ml-2 text-gray-900">
                Analysis
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsDebugVisible(!isDebugVisible)}
              className="p-2"
            >
              <Bug size={20} color={isDebugVisible ? "#3B82F6" : "#6B7280"} />
            </TouchableOpacity>
          </View>

          {isDebugVisible && (
            <View className="mb-4 bg-gray-900 p-3 rounded-lg">
              <Text className="text-white font-medium mb-1">Debug Info:</Text>
              <Text className="text-xs text-gray-300">
                Params: {JSON.stringify(route.params, null, 2)}
              </Text>
            </View>
          )}

          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
