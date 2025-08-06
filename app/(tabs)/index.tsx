import { useAuth } from "@/contexts/AuthContext";
import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useColorScheme } from "react-native";

import { StatusBar } from "expo-status-bar";
import { BoxIcon, Package, Search, TrendingUp } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

export default function Home() {
  const { user } = useAuth();
  const { items, dailyData, dailySold } = useInventory();
  const { boxes } = useBoxes();
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Memoize chart data to prevent unnecessary recalculations
  const addItemData = useMemo(
    () =>
      Array.isArray(dailyData) && dailyData.length === 7
        ? dailyData.map((d) => ({
            label: d.day.slice(0, 3),
            count: d.quantity,
          }))
        : [
            { label: "Mon", count: 0 },
            { label: "Tue", count: 0 },
            { label: "Wed", count: 0 },
            { label: "Thu", count: 0 },
            { label: "Fri", count: 0 },
            { label: "Sat", count: 0 },
            { label: "Sun", count: 0 },
          ],
    [dailyData]
  );

  const sellItemData = useMemo(
    () =>
      Array.isArray(dailySold) && dailySold.length === 7
        ? dailySold.map((d) => ({
            label: d.day.slice(0, 3),
            count: d.quantity,
          }))
        : [
            { label: "Mon", count: 0 },
            { label: "Tue", count: 0 },
            { label: "Wed", count: 0 },
            { label: "Thu", count: 0 },
            { label: "Fri", count: 0 },
            { label: "Sat", count: 0 },
            { label: "Sun", count: 0 },
          ],
    [dailySold]
  );

  useEffect(() => {
    setLoading(false);
  }, []);

  const totalQuantity = useMemo(
    () =>
      Array.isArray(items)
        ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0,
    [items]
  );

  const chartWidth = Dimensions.get("window").width - 40;

  const formatChartData = useMemo(
    () => (data) => ({
      labels: Array.isArray(data) ? data.map((d) => d.label) : [],
      datasets: [{ data: Array.isArray(data) ? data.map((d) => d.count) : [] }],
    }),
    []
  );

  // Chart configuration memoized to prevent re-renders
  const chartConfig = useMemo(
    () => ({
      backgroundColor: "transparent",
      backgroundGradientFrom: isDark
        ? "rgba(17, 24, 39, 0.8)" // Tailwind gray-900
        : "rgba(243, 244, 246, 0.8)", // Tailwind gray-100
      backgroundGradientTo: isDark
        ? "rgba(17, 24, 39, 0.8)"
        : "rgba(243, 244, 246, 0.8)",
      decimalPlaces: 0,
      color: (opacity = 1) =>
        isDark
          ? `rgba(147, 197, 253, ${opacity})` // Tailwind blue-300
          : `rgba(29, 78, 216, ${opacity})`, // Tailwind blue-700
      labelColor: (opacity = 1) =>
        isDark
          ? `rgba(243, 244, 246, ${opacity})` // Tailwind gray-100
          : `rgba(75, 85, 99, ${opacity})`, // Tailwind gray-600
      style: {
        borderRadius: 16,
      },
      propsForBackgroundLines: {
        stroke: isDark ? "#374151" : "#e5e7eb", // Tailwind gray-700 / gray-200
        strokeWidth: 1,
        strokeDasharray: "0",
      },
      propsForLabels: {
        fontSize: 12,
      },
      barPercentage: 0.6,
      fillShadowGradient: isDark ? "#1e3a8a" : "#0369a1", // Tailwind blue-900 / blue-700
      fillShadowGradientOpacity: 1,
    }),
    [isDark]
  );

  const chartStyle = {
    marginVertical: 0,
    borderRadius: 10,
    paddingRight: 0,
    paddingLeft: 4,
    marginLeft: 0,
  };

  return (
    <SafeAreaView className="flex-1 bg-white/70 dark:bg-gray-950 top-2">
      <StatusBar
        style="auto"
        translucent={true}
        className="bg-white/70 dark:bg-gray-950"
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-4 pt-6"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 py-6 space-y-6">
            <View>
              <Text className="text-gray-900 dark:text-gray-100 text-2xl font-semibold">
                Hello, {user?.name?.split(" ")[0] || "User"}
              </Text>
              <Text className="text-gray-500 text-lg dark:text-gray-400">
                Welcome back to ShipWise
              </Text>
            </View>

            <View className="bg-gray-100/40 dark:bg-gray-700/90 border border-gray-400 dark:border-gray-600 rounded-2xl p-3 flex-row items-center my-3 space-x-3">
              <Search color="#6b7280" size={20} />
              <Text className="text-gray-500 dark:text-gray-400 pl-2">
                Search items, boxes...
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#0369a1" />
            ) : (
              <>
                {/* KPIs */}
                <View className="space-y-4">
                  <Text className="text-gray-900 dark:text-gray-100 text-xl font-medium text-center py-2">
                    KPIs
                  </Text>
                  <View className="flex-row justify-between">
                    <View className="bg-gray-100/70 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 p-4 rounded-2xl w-[30%] items-center">
                      <Package color="#0369a1" size={32} />
                      <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
                        {items.length}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        Items
                      </Text>
                    </View>
                    <View className="bg-gray-100/70 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 p-4 rounded-2xl w-[30%] items-center">
                      <BoxIcon color="#0369a1" size={32} />
                      <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
                        {boxes.length}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        Boxes
                      </Text>
                    </View>
                    <View className="bg-gray-100/70 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 p-4 rounded-2xl w-[30%] items-center">
                      <TrendingUp color="#0369a1" size={32} />
                      <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
                        {totalQuantity}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        Units in Stock
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Add Item Graph */}
                <View className="space-y-4">
                  <Text className="text-gray-900 dark:text-gray-100 text-lg font-medium text-center py-2">
                    Items Added
                  </Text>
                  <View className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <BarChart
                      data={formatChartData(addItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={chartConfig}
                      style={chartStyle}
                      withInnerLines={false}
                      showValuesOnTopOfBars={true}
                      withHorizontalLabels={true}
                      withVerticalLabels={true}
                    />
                  </View>
                </View>

                {/* Sell Item Graph */}
                <View className="space-y-4 mb-20">
                  <Text className="text-gray-900 dark:text-gray-100 text-lg font-medium text-center py-2">
                    Items Sold
                  </Text>
                  <View className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <BarChart
                      data={formatChartData(sellItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={chartConfig}
                      style={chartStyle}
                      withInnerLines={false}
                      showValuesOnTopOfBars={true}
                      withHorizontalLabels={true}
                      withVerticalLabels={true}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
