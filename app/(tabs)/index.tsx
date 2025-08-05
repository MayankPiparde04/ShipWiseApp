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
  useColorScheme,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

export default function Home() {
  const { user } = useAuth();
  const { items, dailyData, dailySold } = useInventory();
  const { boxes } = useBoxes();
  const [loading, setLoading] = useState(true);
  const isDark = useColorScheme() === "dark";

  const theme = {
    bg: isDark ? 'bg-gray-950' : 'bg-gray-50',
    cardBg: isDark ? 'bg-zinc-900' : 'bg-white',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-zinc-300' : 'text-gray-600',
    textMuted: isDark ? 'text-zinc-400' : 'text-gray-500',
    border: isDark ? 'border-zinc-700' : 'border-gray-200',
    modalBg: isDark ? 'bg-zinc-900' : 'bg-white',
    modalOverlay: isDark ? 'bg-black/60' : 'bg-gray-900/50',
    tabActive: isDark ? 'bg-zinc-800' : 'bg-blue-100',
    tabInactive: isDark ? 'bg-zinc-900' : 'bg-gray-100',
    tabTextActive: isDark ? 'text-white' : 'text-blue-700',
    tabTextInactive: isDark ? 'text-zinc-400' : 'text-gray-500',
    accent: 'bg-blue-600',
    accentText: 'text-blue-400',
    success: 'bg-green-600',
    successText: 'text-green-400',
    error: isDark ? 'bg-red-900/30' : 'bg-red-100',
    errorText: isDark ? 'text-red-400' : 'text-red-700',
  };

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
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
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
              <Text className={`${theme.text} text-xl font-semibold`}>
                Hello, {user?.name || "User"}
              </Text>
              <Text className={`${theme.textMuted}`}>Welcome back to ShipWise!</Text>
            </View>

            <View className={`${theme.cardBg} rounded-2xl p-4 flex-row items-center my-2 space-x-3`}>
              <Search color={isDark ? "white" : "#18181b"} size={20} />
              <Text className={`${theme.textMuted}`}>Search items, boxes...</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#6EE7B7" />
            ) : (
              <>
                {/* KPIs */}
                <View className="space-y-4">
                  <Text className={`${theme.text} text-lg font-medium text-center py-2`}>KPIs</Text>
                  <View className="flex-row justify-between">
                    <View className={`${theme.cardBg} p-4 rounded-2xl w-[30%] items-center`}>
                      <Package color="#6EE7B7" size={32} />
                      <Text className={`${theme.text} text-xl font-bold`}>{items.length}</Text>
                      <Text className={`${theme.textMuted} text-sm`}>Items</Text>
                    </View>
                    <View className={`${theme.cardBg} p-4 rounded-2xl w-[30%] items-center`}>
                      <BoxIcon color="#A5B4FC" size={32} />
                      <Text className={`${theme.text} text-xl font-bold`}>{boxes.length}</Text>
                      <Text className={`${theme.textMuted} text-sm`}>Boxes</Text>
                    </View>
                    <View className={`${theme.cardBg} p-4 rounded-2xl w-[30%] items-center`}>
                      <TrendingUp color="#F9E8C9" size={32} />
                      <Text className={`${theme.text} text-xl font-bold`}>{totalQuantity}</Text>
                      <Text className={`${theme.textMuted} text-xs`}>Units in Stock</Text>
                    </View>
                  </View>
                </View>

                {/* Add Item Graph */}
                <View className="space-y-4">
                  <Text className={`${theme.text} text-lg font-medium text-center py-2 `}>Items Added</Text>
                  <View className={`${isDark ? "bg-#111827" : "bg-#F3F4F6"} rounded-2xl overflow-hidden`}>
                    <BarChart
                      data={formatChartData(addItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: isDark ? "#111827" : "#F3F4F6",
                        backgroundGradientTo: isDark ? "#111827" : "#F3F4F6",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(110, 231, 183, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          stroke: "#374151",
                          strokeWidth: 1,
                          strokeDasharray: "0",
                        },
                        propsForLabels: {
                          fontSize: 12,
                        },
                        barPercentage: 0.6,
                        fillShadowGradient: "#6EE7B7",
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
                  <Text className={`${theme.text} text-lg font-medium text-center py-2`}>Items Sold</Text>
                  <View className={`${isDark ? "bg-#111827" : "bg-#F3F4F6"} rounded-2xl overflow-hidden`}>
                    <BarChart
                      data={formatChartData(sellItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: isDark ? "#111827" : "#F3F4F6",
                        backgroundGradientTo: isDark ? "#111827" : "#F3F4F6",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(110, 231, 183, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          stroke: "#374151",
                          strokeWidth: 1,
                          strokeDasharray: "0",
                        },
                        propsForLabels: {
                          fontSize: 12,
                        },
                        barPercentage: 0.6,
                        fillShadowGradient: "#6EE7B7",
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
