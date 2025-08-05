import { useInventory } from "@/contexts/InventoryContext";
import { useOptimal } from "@/contexts/OptimalContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Analysis() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { items, isLoading: isLoadingItems, removeBoxItem } = useInventory();
  const { loading, error, result, fetchOptimalPacking, clearResult } = useOptimal();

  // Tab state: 0 = select item, 1 = select quantity, 2 = show result
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);

  // Dynamic theme colors
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

  // Tab 1: Select Item
  const renderSelectItem = () => (
    <View style={{ flex: 1 }}>
      <Text className={`text-3xl font-bold ${theme.text} mb-6`}>Choose Product</Text>
      <Text className={`${theme.textMuted} mb-4`}>Select an item to calculate optimal packing</Text>
      {isLoadingItems ? (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#3b82f6"} />
          <Text className={`${theme.textMuted} mt-4`}>Loading items...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`${theme.cardBg} p-5 mb-4 rounded-2xl ${theme.border} border-2 shadow-sm`}
              onPress={() => {
                setSelectedItem(item);
                setTab(1);
                setQuantity("1");
              }}
              style={{
                shadowColor: isDark ? '#000' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text className={`${theme.text} text-xl font-bold mb-2`}>{item.productName}</Text>
              <View className="flex-row justify-between mb-2">
                <Text className={`${theme.textSecondary} font-medium`}>Available: {item.quantity}</Text>
                <Text className={`${theme.textSecondary} font-medium`}>Weight: {item.weight}g</Text>
              </View>
              <Text className={`${theme.textMuted}`}>
                Size: {item.dimensions.length} × {item.dimensions.breadth} × {item.dimensions.height} cm
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className={`${theme.textMuted} text-lg text-center`}>No items found</Text>
              <Text className={`${theme.textMuted} text-center mt-2`}>Add some products to get started</Text>
            </View>
          }
        />
      )}
    </View>
  );

  // Tab 2: Select Quantity (Modal)
  const renderSelectQuantityModal = () => {
    const maxQty = selectedItem?.quantity || 1;
    return (
      <Modal
        visible={quantityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View className={`flex-1 justify-center  ${theme.modalOverlay}`}>
          <View
            className={`${theme.modalBg} p-8 rounded-3xl mx-4 border-2 border-blue-500 shadow-2xl`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text className={`text-3xl font-bold ${theme.successText} mb-6 text-center`}>
              Set Quantity
            </Text>
            <View className="mb-6">
              <Text className={`${theme.text} text-lg mb-2`}>Product: {selectedItem?.productName}</Text>
              <Text className={`${theme.textSecondary} text-base`}>
                Available: <Text className={`font-bold ${theme.successText}`}>{maxQty} units</Text>
              </Text>
            </View>
            <TextInput
              className={`${isDark ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-gray-50 text-gray-900 border-gray-300'} p-4 rounded-xl border-2 mb-6 text-center text-2xl font-bold`}
              keyboardType="numeric"
              value={quantity}
              onChangeText={val => {
                setQuantity(val.replace(/[^0-9]/g, ""));
              }}
              placeholder="Enter quantity"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            />
            <View className="flex-row space-x-4 gap-2">
              <TouchableOpacity
                className={`flex-1 ${isDark ? 'bg-zinc-700' : 'bg-gray-200'} py-4 rounded-xl`}
                onPress={() => setQuantityModalVisible(false)}
              >
                <Text className={`${theme.text} font-bold text-center text-lg`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 ${theme.success} py-4 rounded-xl`}
                onPress={async () => {
                  const num = parseInt(quantity, 10);
                  if (!quantity || isNaN(num) || num < 1 || num > maxQty) {
                    Alert.alert(
                      "Invalid Quantity",
                      `Please enter a quantity between 1 and ${maxQty}.`
                    );
                    return;
                  }
                  setQuantityModalVisible(false);
                  setTab(2);
                  await fetchOptimalPacking({
                    productId: selectedItem._id,
                    quantity: num,
                  });
                }}
                disabled={loading}
              >
                <Text className="text-white font-bold text-center text-lg">
                  {loading ? "Processing..." : "Calculate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Tab 3: Show Result
  const renderResult = () => (
    <View style={{ flex: 1 }}>
      <Text className={`text-3xl font-bold ${theme.text} mb-6`}>Packing Analysis</Text>
      {loading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#3b82f6"} />
          <Text className={`${theme.textMuted} mt-4 text-lg`}>Calculating optimal packing...</Text>
        </View>
      )}
      {error && (
        <View className={`${theme.error} rounded-2xl p-6 mb-6`}>
          <Text className={`${theme.errorText} font-bold text-lg mb-2`}>Calculation Error</Text>
          <Text className={`${theme.errorText}`}>{error}</Text>
        </View>
      )}
      {result && (
        <>
          <ScrollView
            className="flex-1 mb-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Summary Cards */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className={`${theme.cardBg} p-4 rounded-xl ${theme.border} border flex-1 min-w-[140px]`}>
                <Text className={`${theme.successText} text-2xl font-bold`}>
                  {result.summary?.totalCartonsUsed || result.packingResults?.length || 0}
                </Text>
                <Text className={`${theme.textMuted} text-sm`}>Cartons Used</Text>
              </View>
              <View className={`${theme.cardBg} p-4 rounded-xl ${theme.border} border flex-1 min-w-[140px]`}>
                <Text className={`${theme.accentText} text-2xl font-bold`}>
                  {result.summary?.packingRate || 100}%
                </Text>
                <Text className={`${theme.textMuted} text-sm`}>Packing Success</Text>
              </View>
            </View>

            {/* Product Info */}
            <View className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
              <Text className={`${theme.text} text-xl font-bold mb-3`}>Product Information</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Product Name</Text>
                  <Text className={`${theme.text} font-medium flex-1 text-right`} numberOfLines={1}>
                    {result.productInfo?.name || selectedItem?.productName || "N/A"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Dimensions</Text>
                  <Text className={`${theme.text} font-medium`}>{result.productInfo?.dimensions || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Weight</Text>
                  <Text className={`${theme.text} font-medium`}>{result.productInfo?.weight || 0}g</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Packing Orientation</Text>
                  <Text className={`${theme.successText} font-medium`}>
                    {result.packingResults?.[0]?.orientation || "L×B×H"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Can Rotate</Text>
                  <Text className={`${result.productInfo?.canRotate ? theme.successText : theme.errorText} font-medium`}>
                    {result.productInfo?.canRotate ? "Yes" : "No"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Fragile Item</Text>
                  <Text className={`${result.productInfo?.isFragile ? theme.errorText : theme.successText} font-medium`}>
                    {result.productInfo?.isFragile ? "Yes" : "No"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Requested Qty</Text>
                  <Text className={`${theme.text} font-medium`}>{result.productInfo?.requestedQuantity || result.summary?.totalItemsRequested || 0}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${theme.textMuted}`}>Packed Qty</Text>
                  <Text className={`${theme.successText} font-bold`}>{result.summary?.totalItemsPacked || 0}</Text>
                </View>
              </View>
            </View>

            {/* Packing Efficiency */}
            <View className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
              <Text className={`${theme.text} text-xl font-bold mb-3`}>Efficiency Analysis</Text>
              <View className="space-y-3">
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className={`${theme.textMuted}`}>Volume Efficiency</Text>
                    <Text className={`${theme.text} font-medium`}>{result.summary?.overallVolumeEfficiency || 0}%</Text>
                  </View>
                  <View className={`${isDark ? 'bg-zinc-700' : 'bg-gray-200'} h-2 rounded-full`}>
                    <View
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(result.summary?.overallVolumeEfficiency || 0, 100)}%` }}
                    />
                  </View>
                </View>
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className={`${theme.textMuted}`}>Packing Quality Score</Text>
                    <Text className={`${theme.text} font-medium`}>{result.analytics?.packingQuality?.overallScore || 0}/100</Text>
                  </View>
                  <View className={`${isDark ? 'bg-zinc-700' : 'bg-gray-200'} h-2 rounded-full`}>
                    <View
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(result.analytics?.packingQuality?.overallScore || 0, 100)}%` }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Carton Breakdown */}
            {result.summary?.cartonTypeBreakdown?.map((carton: any, index: number) => (
              <View key={index} className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
                <Text className={`${theme.text} text-xl font-bold mb-3`}>Carton Details #{index + 1}</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Carton Type</Text>
                    <Text className={`${theme.text} font-medium`}>{carton.cartonType}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Count</Text>
                    <Text className={`${theme.text} font-medium`}>{carton.count}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Items per Carton</Text>
                    <Text className={`${theme.text} font-medium`}>{Math.floor(carton.totalItems / carton.count)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Efficiency</Text>
                    <Text className={`${theme.text} font-medium`}>{carton.avgEfficiency}%</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Individual Carton Details */}
            {result.packingResults && result.packingResults.length > 0 && (
              <View className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
                <Text className={`${theme.text} text-xl font-bold mb-3`}>Packing Orientation & Layout</Text>
                {result.packingResults.slice(0, 3).map((carton: any, index: number) => (
                  <View key={index} className="mb-4">
                    <Text className={`${theme.textSecondary} font-bold mb-2`}>Carton #{index + 1}</Text>
                    <View className="space-y-1">
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Items Packed</Text>
                        <Text className={`${theme.text} text-sm font-medium`}>{carton.itemsPacked}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Selected Orientation</Text>
                        <Text className={`${theme.successText} text-sm font-bold`}>{carton.orientation}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Dimensions Used</Text>
                        <Text className={`${theme.text} text-sm font-medium`}>
                          {carton.orientationDetails?.dimensionsUsed ?
                            `${carton.orientationDetails.dimensionsUsed.length}×${carton.orientationDetails.dimensionsUsed.breadth}×${carton.orientationDetails.dimensionsUsed.height}` :
                            "N/A"
                          }
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Arrangement Pattern</Text>
                        <Text className={`${theme.text} text-sm font-medium`}>
                          {carton.orientationDetails?.arrangementPattern || `${carton.layout?.arrangement?.lengthwise || 0} × ${carton.layout?.arrangement?.breadthwise || 0} × ${carton.layout?.arrangement?.layers || 0}`}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Stacking Pattern</Text>
                        <Text className={`${theme.text} text-sm font-medium`}>
                          {carton.orientationDetails?.stackingPattern?.itemsPerLayer || carton.layout?.itemsPerLayer || 0} items/layer, {carton.orientationDetails?.stackingPattern?.totalLayers || carton.layout?.layers || 0} layers
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Optimal Stacking</Text>
                        <Text className={`${carton.orientationDetails?.stackingPattern?.isOptimalStacking ? theme.successText : theme.errorText} text-sm font-medium`}>
                          {carton.orientationDetails?.stackingPattern?.isOptimalStacking ? "Yes" : "No"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Volume Efficiency</Text>
                        <Text className={`${theme.text} text-sm font-medium`}>{carton.efficiency?.volumeEfficiency}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Weight Utilization</Text>
                        <Text className={`${theme.text} text-sm font-medium`}>{carton.efficiency?.weightUtilization}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Space Optimality</Text>
                        <Text className={`${theme.successText} text-sm font-medium`}>
                          {carton.packingMetrics?.spaceOptimality || "Good"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Stacking Safety</Text>
                        <Text className={`${carton.stackingInfo?.stackingSafety ? theme.successText : theme.errorText} text-sm font-medium`}>
                          {carton.stackingInfo?.stackingSafety ? "Safe" : "Unsafe"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className={`${theme.textMuted} text-sm`}>Carton Utilization</Text>
                        <Text className={`${theme.text} text-sm font-medium`}>
                          {((carton.packingMetrics?.cartonUtilization || 0) * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    {index < 2 && <View className={`h-px ${theme.border} border-t mt-3`} />}
                  </View>
                ))}
                {result.packingResults.length > 3 && (
                  <Text className={`${theme.textMuted} text-sm text-center`}>
                    +{result.packingResults.length - 3} more cartons with similar configuration
                  </Text>
                )}
              </View>
            )}

            {/* Optimization Details */}
            {result.summary?.optimizationApplied && (
              <View className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
                <Text className={`${theme.text} text-xl font-bold mb-3`}>Optimization Features</Text>
                <View className="space-y-2">
                  {Object.entries(result.summary.optimizationApplied).map(([key, value]: [string, any]) => (
                    <View key={key} className="flex-row justify-between items-center">
                      <Text className={`${theme.textMuted} capitalize`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <View className={`w-4 h-4 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                    </View>
                  ))}
                </View>
                <View className="mt-3 pt-3 border-t border-gray-300">
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Algorithm Used</Text>
                    <Text className={`${theme.text} font-medium capitalize`}>
                      {result.summary.algorithmUsed || "Standard"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Advanced Metrics */}
            {result.analytics?.packingQuality && (
              <View className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
                <Text className={`${theme.text} text-xl font-bold mb-3`}>Advanced Analytics</Text>
                <View className="space-y-3">
                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className={`${theme.textMuted}`}>Waste Analysis</Text>
                      <Text className={`${theme.text} font-medium`}>
                        {result.analytics.packingQuality.wasteAnalysis?.wastePercentage?.toFixed(1)}% waste
                      </Text>
                    </View>
                    <Text className={`${theme.textMuted} text-xs`}>
                      Total waste: {(result.analytics.packingQuality.wasteAnalysis?.totalWasteVolume / 1000000)?.toFixed(2)} L
                    </Text>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className={`${theme.textMuted}`}>Stacking Analysis</Text>
                      <Text className={`${theme.text} font-medium`}>
                        {result.analytics.packingQuality.stackingAnalysis?.avgStackLayers} avg layers
                      </Text>
                    </View>
                    <Text className={`${theme.textMuted} text-xs`}>
                      {result.analytics.packingQuality.stackingAnalysis?.totalStackedCartons} stacked cartons
                    </Text>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className={`${theme.textMuted}`}>Fragile Handling</Text>
                      <Text className={`${theme.text} font-medium`}>
                        {result.productInfo?.isFragile ? "Applied" : "Not Required"}
                      </Text>
                    </View>
                    <Text className={`${theme.textMuted} text-xs`}>
                      Can rotate: {result.productInfo?.canRotate ? "Yes" : "No"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Recommendations */}
            {result.analytics?.recommendations?.length > 0 && (
              <View className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
                <Text className={`${theme.text} text-xl font-bold mb-3`}>Recommendations</Text>
                {result.analytics.recommendations.map((rec: any, index: number) => (
                  <View key={index} className={`${isDark ? 'bg-amber-900/30' : 'bg-amber-50'} p-3 rounded-lg mb-2`}>
                    <View className="flex-row items-center mb-1">
                      <View className={`w-2 h-2 rounded-full ${rec.priority === 'HIGH' ? 'bg-red-500' : rec.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'} mr-2`} />
                      <Text className={`${isDark ? 'text-amber-200' : 'text-amber-800'} font-medium text-sm`}>
                        {rec.priority} PRIORITY
                      </Text>
                    </View>
                    <Text className={`${isDark ? 'text-amber-100' : 'text-amber-900'} text-sm`}>
                      {rec.message}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Environmental Impact */}
            {result.analytics?.sustainability && (
              <View className={`${theme.cardBg} p-5 rounded-2xl ${theme.border} border mb-4`}>
                <Text className={`${theme.text} text-xl font-bold mb-3`}>Environmental Impact</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Carbon Footprint</Text>
                    <Text className={`${theme.text} font-medium`}>
                      {result.analytics.sustainability.carbonFootprint?.totalFootprint} kg CO₂
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Packing Density</Text>
                    <Text className={`${theme.text} font-medium`}>
                      {(result.analytics.sustainability.packingDensity * 100)?.toFixed(2)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={`${theme.textMuted}`}>Waste Volume</Text>
                    <Text className={`${theme.text} font-medium`}>
                      {(result.analytics.sustainability.totalWasteVolume / 1000000)?.toFixed(2)} L
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row space-x-4 gap-2 mb-24">
            <TouchableOpacity
              className={`flex-1 ${isDark ? 'bg-zinc-700' : 'bg-gray-200'} py-4 rounded-2xl`}
              onPress={() => {
                clearResult();
                setTab(0);
                setSelectedItem(null);
                setQuantity("1");
              }}
            >
              <Text className={`${theme.text} font-bold text-center text-lg`}>Start Over</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 ${theme.success} py-4 rounded-2xl`}
              onPress={() => {
                Alert.alert(
                  "Confirm Packing",
                  `Pack ${result.productInfo?.requestedQuantity || result.summary?.totalItemsRequested} items in ${result.summary?.totalCartonsUsed || result.packingResults?.length} cartons?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Confirm", onPress: async () => {
                        try {
                          // Get the first carton details for the API call
                          const firstCarton = result.packingResults?.[0];
                          if (firstCarton && selectedItem) {
                            await removeBoxItem({
                              boxId: firstCarton.cartonDetails.id,
                              itemId: selectedItem._id,
                              boxQuantity: result.summary?.totalCartonsUsed || result.packingResults?.length || 1,
                              itemQuantity: result.productInfo?.requestedQuantity || result.summary?.totalItemsRequested || 0
                            });
                          }
                          Alert.alert("Success", "Packing plan confirmed and inventory updated!", [
                            {
                              text: "OK",
                              onPress: () => {
                                // Clear result and redirect to dashboard
                                clearResult();
                                setTab(0);
                                setSelectedItem(null);
                                setQuantity("1");
                                router.push("/(tabs)/");
                              }
                            }
                          ]);
                        } catch (error: any) {
                          Alert.alert("Error", error.message || "Failed to update inventory");
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text className="text-white font-bold text-center text-lg">Pack Items</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  // Tab navigation bar
  const renderTabs = () => (
    <View className={`flex-row mb-4 ${isDark ? 'bg-zinc-800' : 'bg-gray-100'} rounded-2xl p-1`}>
      <Pressable
        className={`flex-1 py-3 rounded-xl ${tab === 0 ? theme.tabActive : 'transparent'}`}
        onPress={() => {
          // Always reset everything when going to Select Item
          clearResult();
          setTab(0);
          setSelectedItem(null);
          setQuantity("1");
        }}
      >
        <Text className={`text-center font-bold text-sm ${tab === 0 ? theme.tabTextActive : theme.tabTextInactive}`}>
          Select Item
        </Text>
      </Pressable>
      <Pressable
        className={`flex-1 py-3 rounded-xl ${tab === 1 ? theme.tabActive : 'transparent'}`}
        onPress={() => {
          if (selectedItem) {
            // If coming from Result, reset result
            if (tab === 2) {
              clearResult();
            }
            setTab(1);
          }
        }}
        disabled={!selectedItem}
      >
        <Text className={`text-center font-bold text-sm ${tab === 1 ? theme.tabTextActive : theme.tabTextInactive}`}>
          Quantity
        </Text>
      </Pressable>
      <Pressable
        className={`flex-1 py-3 rounded-xl ${tab === 2 ? theme.tabActive : 'transparent'}`}
        onPress={() => {
          if (result) {
            setTab(2);
          }
        }}
        disabled={!result}
      >
        <Text className={`text-center font-bold text-sm ${tab === 2 ? theme.tabTextActive : theme.tabTextInactive}`}>
          Results
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      <StatusBar style={isDark ? "light" : "dark"} translucent={true} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="px-6 py-4 flex-1 mb-20">
          <View className="mb-6">
            <Text className={`text-4xl font-bold ${theme.text} text-center`}>
              Packing Analysis
            </Text>
            <Text className={`${theme.textMuted} text-center mt-2`}>
              Optimize your shipping costs
            </Text>
          </View>
          {renderTabs()}
          {tab === 0 && renderSelectItem()}
          {tab === 1 && selectedItem && (
            <View className="flex-1 ">
              <View className={`${theme.cardBg} p-4 rounded-2xl ${theme.border} border-2 mb-6`}>
                <Text className={`${theme.textMuted} text-sm mb-2`}>Selected Product</Text>
                <Text className={`${theme.text} text-2xl font-bold mb-2`}>{selectedItem.productName}</Text>
                <Text className={`${theme.textSecondary}`}>
                  Available: {selectedItem.quantity} units
                </Text>
                <TouchableOpacity
                  className="mt-4 py-2 px-2 bg-blue-100 rounded-lg self-start"
                  onPress={() => {
                    setTab(0);
                    clearResult();
                    setSelectedItem(null);
                    setQuantity("1");
                  }}
                >
                  <Text className="text-blue-700 text-sm font-medium">Change Product</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className={`${theme.success} py-4 rounded-2xl`}
                onPress={() => setQuantityModalVisible(true)}
              >
                <Text className="text-white font-bold text-center text-xl">Set Quantity</Text>
              </TouchableOpacity>
              {renderSelectQuantityModal()}
        </View>
          )}
        {tab === 2 && renderResult()}
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
