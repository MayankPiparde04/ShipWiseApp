import { useAuth } from "@/contexts/AuthContext";
import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "expo-status-bar";
import { BoxIcon, Package, Search, TrendingUp } from "lucide-react-native";
import { useEffect, useState } from "react";
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
  const isDark = colorScheme === 'dark';

  // Always provide an array for addItemData
  const addItemData =
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
      ];

  // Always provide an array for sellItemData using dailySold
  const sellItemData =
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
      ];

  useEffect(() => {
    // Data is fetched through contexts, just stop loading
    setLoading(false);
  }, []);

  const totalQuantity = Array.isArray(items)
    ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  const chartWidth = Dimensions.get("window").width - 40;

  const formatChartData = (data: { label: string; count: number }[]) => ({
    labels: Array.isArray(data) ? data.map(d => d.label) : [],
    datasets: [{ data: Array.isArray(data) ? data.map(d => d.count) : [] }],
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="light" translucent={true} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-4 mt-6"
        >
          <View className="flex-1 py-6 space-y-6">
            <View>
              <Text className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
                Hello, {user?.name || "User"}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">Welcome back to ShipWise!</Text>
            </View>

            <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex-row items-center my-2 space-x-3">
              <Search color="#6b7280" size={20} />
              <Text className="text-gray-500 dark:text-gray-400">Search items, boxes...</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#0a7ea4" />
            ) : (
              <>
                {/* KPIs */}
                <View className="space-y-4">
                  <Text className="text-gray-900 dark:text-gray-100 text-lg font-medium text-center py-2">KPIs</Text>
                  <View className="flex-row justify-between">
                    <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl w-[30%] items-center">
                      <Package color="#0a7ea4" size={32} />
                      <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">{items.length}</Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">Items</Text>
                    </View>
                    <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl w-[30%] items-center">
                      <BoxIcon color="#7c3aed" size={32} />
                      <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">{boxes.length}</Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">Boxes</Text>
                    </View>
                    <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl w-[30%] items-center">
                      <TrendingUp color="#f59e0b" size={32} />
                      <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">{totalQuantity}</Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">Units in Stock</Text>
                    </View>
                  </View>
                </View>

                {/* Add Item Graph */}
                <View className="space-y-4">
                  <Text className="text-gray-900 dark:text-gray-100 text-lg font-medium text-center py-2">Items Added</Text>
                  <View style={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb', borderRadius: 16, overflow: 'hidden' }}>
                    <BarChart
                      data={formatChartData(addItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: isDark ? '#1f2937' : '#f9fafb',
                        backgroundGradientTo: isDark ? '#1f2937' : '#f9fafb',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(110, 231, 183, ${opacity})`,
                        labelColor: (opacity = 1) => isDark ? `rgba(229, 231, 235, ${opacity})` : `rgba(75, 85, 99, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          stroke: isDark ? '#374151' : '#e5e7eb',
                          strokeWidth: 1,
                          strokeDasharray: "0",
                        },
                        propsForLabels: {
                          fontSize: 12,
                        },
                        barPercentage: 0.6,
                        fillShadowGradient: '#0a7ea4',
                        fillShadowGradientOpacity: 1,
                      }}
                      style={{
                        marginVertical: 0,
                        borderRadius: 10,
                        paddingRight: 0,
                        paddingLeft: 4,
                        marginLeft: 0,
                      }}
                      withInnerLines={false}
                      showValuesOnTopOfBars={true}
                      withHorizontalLabels={true}
                      withVerticalLabels={true}
                    />
                  </View>
                </View>

                {/* Sell Item Graph */}
                <View className="space-y-4 mb-20">
                  <Text className="text-gray-900 dark:text-gray-100 text-lg font-medium text-center py-2">Items Sold</Text>
                  <View style={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb', borderRadius: 16, overflow: 'hidden' }}>
                    <BarChart
                      data={formatChartData(sellItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: isDark ? '#1f2937' : '#f9fafb',
                        backgroundGradientTo: isDark ? '#1f2937' : '#f9fafb',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(110, 231, 183, ${opacity})`,
                        labelColor: (opacity = 1) => isDark ? `rgba(229, 231, 235, ${opacity})` : `rgba(75, 85, 99, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          stroke: isDark ? '#374151' : '#e5e7eb',
                          strokeWidth: 1,
                          strokeDasharray: "0",
                        },
                        propsForLabels: {
                          fontSize: 12,
                        },
                        barPercentage: 0.6,
                        fillShadowGradient: '#0a7ea4',
                        fillShadowGradientOpacity: 1,
                      }}
                      style={{
                        marginVertical: 0,
                        borderRadius: 10,
                        paddingRight: 0,
                        paddingLeft: 4,
                        marginLeft: 0,
                      }}
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
