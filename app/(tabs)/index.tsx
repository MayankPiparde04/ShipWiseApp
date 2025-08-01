// Dashboard / home / landing page layout / tab1

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { MotiView, MotiText } from "moti";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");

const texts = [
  {
    title: "Your Smart Shipping Partner",
    subtitle: "Shipping Smart, Reducing Waste.",
    description:
      "ShipWise makes shipping smarter by optimizing carton sizes and selecting cost-effective couriers to reduce costs and environmental impact.",
  },
  {
    title: "ShipWise SmartFit: Rotate, Optimize, Ship Efficiently!",
    subtitle: "The Best Fit, Every Time!",
    description:
      "Our algorithm analyzes all possible orientations to find the most space-efficient and secure packing strategy. Less waste, more efficiency—because every inch counts!",
  },
];

export default function Home() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="light" translucent={false} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 bg-black"
        >
          <View className="flex items-center justify-center px-6 pt-20 pb-10">
            <View className="w-full h-72 justify-center">
              <MotiView
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="mb-6 bg-indigo-950/20 border border-indigo-500/20 px-4 py-2 rounded-full"
              >
                <Text className="text-indigo-300 text-sm text-center">
                  ✨ Minimizing Waste, Maximizing Savings
                </Text>
              </MotiView>

              <MotiText
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-3xl font-bold text-center mb-2"
              >
                {texts[textIndex].title}
              </MotiText>

              <Text className="text-indigo-100 text-xl text-center mb-4">
                {texts[textIndex].subtitle}
              </Text>

              <Text className="text-gray-300 text-base text-center px-2 leading-relaxed tracking-wide">
                {texts[textIndex].description}
              </Text>
            </View>

            {/* Buttons */}
            <View className="flex-row space-x-4 mt-6">
              <TouchableOpacity
                onPress={() => console.log("Get Started pressed")}
                className="bg-indigo-600 px-6 py-3 rounded-lg flex-row items-center space-x-2"
              >
                <Feather name="search" size={18} color="white" />
                <Text className="text-white font-semibold">Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log("Learn More pressed")}
                className="border border-indigo-500 px-6 py-3 rounded-lg flex-row items-center space-x-2"
              >
                <Feather name="box" size={18} color="white" />
                <Text className="text-white font-semibold">Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Newsletter Section */}
          <View className="px-6 py-8 bg-gray-900 rounded-2xl mx-4 mb-20">
            <Text className="text-2xl font-bold text-white text-center">
              Subscribe to our Newsletter
            </Text>
            <Text className="text-gray-400 text-center mt-2 leading-snug">
              Stay updated with our latest news and updates.
            </Text>

            <View className="mt-6 space-y-4 items-center">
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#ccc"
                keyboardType="email-address"
                className="w-[90%] px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
              />
              <TouchableOpacity
                onPress={() => {
                  console.log("Subscribe clicked");
                }}
                className="bg-blue-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold text-lg">
                  Subscribe
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
