import { useAuth } from "@/contexts/AuthContext";
import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useAppTheme } from "@/hooks/useAppTheme";
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
  const theme = useAppTheme();

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
              <Search color={theme.text} size={20} />
              <Text className={`${theme.textMuted}`}>Search items, boxes...</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={theme.accent} />
            ) : (
              <>
                {/* KPIs */}
                <View className="space-y-4">
                  <Text className={`${theme.text} text-lg font-medium text-center py-2`}>KPIs</Text>
                  <View className="flex-row justify-between">
                    <View className={`${theme.cardBg} p-4 rounded-2xl w-[30%] items-center`}>
                      <Package color={theme.accent} size={32} />
                      <Text className={`${theme.text} text-xl font-bold`}>{items.length}</Text>
                      <Text className={`${theme.textMuted} text-sm`}>Items</Text>
                    </View>
                    <View className={`${theme.cardBg} p-4 rounded-2xl w-[30%] items-center`}>
                      <BoxIcon color={theme.accentText} size={32} />
                      <Text className={`${theme.text} text-xl font-bold`}>{boxes.length}</Text>
                      <Text className={`${theme.textMuted} text-sm`}>Boxes</Text>
                    </View>
                    <View className={`${theme.cardBg} p-4 rounded-2xl w-[30%] items-center`}>
                      <TrendingUp color={theme.warningText} size={32} />
                      <Text className={`${theme.text} text-xl font-bold`}>{totalQuantity}</Text>
                      <Text className={`${theme.textMuted} text-xs`}>Units in Stock</Text>
                    </View>
                  </View>
                </View>

                {/* Add Item Graph */}
                <View className="space-y-4">
                  <Text className={`${theme.text} text-lg font-medium text-center py-2 `}>Items Added</Text>
                  <View style={{ backgroundColor: theme.cardBg, borderRadius: 16, overflow: 'hidden' }}>
                    <BarChart
                      data={formatChartData(addItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: theme.cardBg,
                        backgroundGradientTo: theme.cardBg,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(110, 231, 183, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          stroke: theme.border,
                          strokeWidth: 1,
                          strokeDasharray: "0",
                        },
                        propsForLabels: {
                          fontSize: 12,
                        },
                        barPercentage: 0.6,
                        fillShadowGradient: theme.accent,
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
                  <View style={{ backgroundColor: theme.cardBg, borderRadius: 16, overflow: 'hidden' }}>
                    <BarChart
                      data={formatChartData(sellItemData)}
                      width={chartWidth + 12}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: theme.cardBg,
                        backgroundGradientTo: theme.cardBg,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(110, 231, 183, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          stroke: theme.border,
                          strokeWidth: 1,
                          strokeDasharray: "0",
                        },
                        propsForLabels: {
                          fontSize: 12,
                        },
                        barPercentage: 0.6,
                        fillShadowGradient: theme.accent,
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
