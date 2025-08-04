import { useAuth } from "@/contexts/AuthContext";
import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { apiService } from "@/services/api";
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
    async function fetchData() {
      try {
        const [itemRes, boxRes] = await Promise.all([
          apiService.getItems({ limit: 10 }),
          apiService.getBoxes({ limit: 10 }),
        ]);

        if (itemRes.success && Array.isArray(itemRes.data)) {
          setItems(itemRes.data);
        }

        if (boxRes.success && Array.isArray(boxRes.data)) {
          setBoxes(boxRes.data);
        }
      } catch (error) {
        console.error("Home Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
    <SafeAreaView className="flex-1 bg-gray-950">
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
              <Text className="text-white text-xl font-semibold">
                Hello, {user?.name || "User"}
              </Text>
              <Text className="text-gray-300">Welcome back to ShipWise!</Text>
            </View>

            <View className="bg-gray-900 rounded-2xl p-4 flex-row items-center space-x-3">
              <Search color="white" size={20} />
              <Text className="text-gray-400">Search items, boxes...</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#6EE7B7" />
            ) : (
              <>
                {/* KPIs */}
                <View className="space-y-4">
                  <Text className="text-white text-lg font-medium">KPIs</Text>
                  <View className="flex-row justify-between">
                    <View className="bg-gray-800 p-4 rounded-2xl w-[30%] items-center">
                      <Package color="#6EE7B7" size={32} />
                      <Text className="text-white text-xl font-bold">{items.length}</Text>
                      <Text className="text-gray-400 text-sm">Items</Text>
                    </View>
                    <View className="bg-gray-800 p-4 rounded-2xl w-[30%] items-center">
                      <BoxIcon color="#A5B4FC" size={32} />
                      <Text className="text-white text-xl font-bold">{boxes.length}</Text>
                      <Text className="text-gray-400 text-sm">Boxes</Text>
                    </View>
                    <View className="bg-gray-800 p-4 rounded-2xl w-[30%] items-center">
                      <TrendingUp color="#F9E8C9" size={32} />
                      <Text className="text-white text-xl font-bold">{totalQuantity}</Text>
                      <Text className="text-gray-400 text-sm">Units in Stock</Text>
                    </View>
                  </View>
                </View>

                {/* Recent Activity */}
                <View className="space-y-4">
                  <Text className="text-white text-lg font-medium">Recent Activity</Text>
                  <View className="bg-gray-800 p-4 rounded-2xl">
                    <Text className="text-gray-300">No recent activity found.</Text>
                  </View>
                </View>

                {/* Add Item Graph */}
                <View className="space-y-4" style={{ alignItems: "center" }}>
                  <Text className="text-white text-lg font-medium">Items Added</Text>
                  <View
                    className="bg-gray-800 p-4 rounded-2xl"
                    style={{
                      alignItems: "center",
                      width: chartWidth + 16, // 16 = horizontal padding (p-4 = 8px left + 8px right)
                    }}
                  >
                    
                    <BarChart
                      data={formatChartData(addItemData)}
                      width={chartWidth}
                      height={220}
                      yAxisLabel=""
                      chartConfig={{
                        backgroundColor: "#1F2937",
                        backgroundGradientFrom: "#1F2937",
                        backgroundGradientTo: "#1F2937",
                        decimalPlaces: 0,
                        color: () => `#6EE7B7`,
                        labelColor: () => `#E5E7EB`,
                        propsForBackgroundLines: {
                          stroke: "#374151",
                        },
                      }}
                      style={{ borderRadius: 12 , width: chartWidth }}
                    />
                  </View>
                </View>

                {/* Sell Item Graph */}
                <View className="space-y-4 mb-20">
                  <Text className="text-white text-lg font-medium">Items Sold</Text>
                  <View className="bg-gray-800 p-4 rounded-2xl">
                    <BarChart
                      data={formatChartData(sellItemData)}
                      width={chartWidth}
                      height={220}
                      yAxisLabel=""
                      chartConfig={{
                        backgroundColor: "#1F2937",
                        backgroundGradientFrom: "#1F2937",
                        backgroundGradientTo: "#1F2937",
                        decimalPlaces: 0,
                        color: () => `#FCA5A5`,
                        labelColor: () => `#E5E7EB`,
                        propsForBackgroundLines: {
                          stroke: "#374151",
                        },
                      }}
                      style={{ borderRadius: 12 }}
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
