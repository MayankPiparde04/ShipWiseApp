import { useInventory } from "@/contexts/InventoryContext";
import { useOptimal } from "@/contexts/OptimalContext";
import { useColorScheme } from "@/hooks/useColorScheme";
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

  // Tab 1: Select Item
  const renderSelectItem = () => (
    <View style={{ flex: 1 }}>
      <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Choose Product</Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-4">Select an item to calculate optimal packing</Text>
      {isLoadingItems ? (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">Loading items...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-gray-100/40 dark:bg-gray-900 p-5 mb-4 rounded-3xl border border-gray-200 dark:border-gray-700 "
              onPress={() => {
                setSelectedItem(item);
                setTab(1);
                setQuantity("1");
              }}
             
            >
              <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-2">{item.productName}</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600 dark:text-gray-300 font-medium">Available: {item.quantity}</Text>
                <Text className="text-gray-600 dark:text-gray-300 font-medium">Weight: {item.weight}g</Text>
              </View>
              <Text className="text-gray-500 dark:text-gray-400">
                Size: {item.dimensions.length} × {item.dimensions.breadth} × {item.dimensions.height} cm
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-500 dark:text-gray-400 text-lg text-center">No items found</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">Add some products to get started</Text>
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
        <View className="flex-1 justify-center bg-black/50 dark:bg-black/70">
          <View
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              padding: 32,
              borderRadius: 24,
              marginHorizontal: 16,
              borderWidth: 2,
              borderColor: isDark ? '#8b5cf6' : '#a855f7',
              elevation: 10
            }}
          >
            <Text className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6 text-center">
              Set Quantity
            </Text>
            <View className="mb-6">
              <Text className="text-gray-900 dark:text-gray-100 text-lg mb-2">Product: {selectedItem?.productName}</Text>
              <Text className="text-gray-600 dark:text-gray-300 text-base">
                Available: <Text className="font-bold text-green-600 dark:text-green-400">{maxQty} units</Text>
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: isDark ? '#374151' : '#f9fafb',
                color: isDark ? '#f3f4f6' : '#111827',
                borderColor: isDark ? '#6b7280' : '#d1d5db',
                borderWidth: 2,
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold'
              }}
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
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#6b7280' : '#e5e7eb',
                  paddingVertical: 16,
                  borderRadius: 12
                }}
                onPress={() => setQuantityModalVisible(false)}
              >
                <Text className="text-gray-900 dark:text-gray-100 font-bold text-center text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#16a34a',
                  paddingVertical: 16,
                  borderRadius: 12
                }}
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
      <Text className="text-3xl font-bold text-gray-950 dark:text-gray-100/70 mb-6">Packing Analysis</Text>
      {loading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4 text-lg">Calculating optimal packing...</Text>
        </View>
      )}
      {error && (
        <View className="bg-red-100 dark:bg-red-900/30 rounded-2xl p-6 mb-6">
          <Text className="text-red-800 dark:text-red-400 font-bold text-lg mb-2">Calculation Error</Text>
          <Text className="text-red-800 dark:text-red-400">{error}</Text>
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
              <View className="bg-gray-100/40 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 min-w-[140px]">
                <Text className="text-green-600 dark:text-green-400 text-2xl font-bold">
                  {result.summary?.totalCartonsUsed || result.packingResults?.length || 0}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">Cartons Used</Text>
              </View>
              <View className="bg-gray-100/40 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 min-w-[140px]">
                <Text className="text-violet-600 dark:text-violet-400 text-2xl font-bold">
                  {result.summary?.packingRate || 100}%
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">Packing Success</Text>
              </View>
            </View>

            {/* Product Info */}
            <View className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4">
              <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Product Information</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Product Name</Text>
                  <Text className="text-gray-900 dark:text-gray-100 font-medium flex-1 text-right" numberOfLines={1}>
                    {result.productInfo?.name || selectedItem?.productName || "N/A"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Dimensions</Text>
                  <Text className="text-gray-900 dark:text-gray-100 font-medium">{result.productInfo?.dimensions || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Weight</Text>
                  <Text className="text-gray-900 dark:text-gray-100 font-medium">{result.productInfo?.weight || 0}g</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Packing Orientation</Text>
                  <Text className="text-green-600 dark:text-green-400 font-medium">
                    {result.packingResults?.[0]?.orientation || "L×B×H"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Can Rotate</Text>
                  <Text className={`${result.productInfo?.canRotate ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-medium`}>
                    {result.productInfo?.canRotate ? "Yes" : "No"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Fragile Item</Text>
                  <Text className={`${result.productInfo?.isFragile ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} font-medium`}>
                    {result.productInfo?.isFragile ? "Yes" : "No"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Requested Qty</Text>
                  <Text className="text-gray-900 dark:text-gray-100 font-medium">{result.productInfo?.requestedQuantity || result.summary?.totalItemsRequested || 0}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Packed Qty</Text>
                  <Text className="text-green-600 dark:text-green-400 font-bold">{result.summary?.totalItemsPacked || 0}</Text>
                </View>
              </View>
            </View>

            {/* Packing Efficiency */}
            <View className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4">
              <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Efficiency Analysis</Text>
              <View className="space-y-3">
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-500 dark:text-gray-400">Volume Efficiency</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">{result.summary?.overallVolumeEfficiency || 0}%</Text>
                  </View>
                  <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', height: 8, borderRadius: 4 }}>
                    <View
                      style={{ 
                        backgroundColor: '#8b5cf6', 
                        height: 8, 
                        borderRadius: 4,
                        width: `${Math.min(result.summary?.overallVolumeEfficiency || 0, 100)}%` 
                      }}
                    />
                  </View>
                </View>
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-500 dark:text-gray-400">Packing Quality Score</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">{result.analytics?.packingQuality?.overallScore || 0}/100</Text>
                  </View>
                  <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', height: 8, borderRadius: 4 }}>
                    <View
                      style={{ 
                        backgroundColor: '#16a34a', 
                        height: 8, 
                        borderRadius: 4,
                        width: `${Math.min(result.analytics?.packingQuality?.overallScore || 0, 100)}%` 
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Carton Breakdown */}
            {result.summary?.cartonTypeBreakdown?.map((carton: any, index: number) => (
              <View key={index} className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border-gray-200 dark:border-gray-700 border mb-4">
                <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Carton Details #{index + 1}</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Carton Type</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">{carton.cartonType}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Count</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">{carton.count}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Items per Carton</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">{Math.floor(carton.totalItems / carton.count)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Efficiency</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">{carton.avgEfficiency}%</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Individual Carton Details */}
            {result.packingResults && result.packingResults.length > 0 && (
              <View className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border-gray-200 dark:border-gray-700 border mb-4">
                <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Packing Orientation & Layout</Text>
                {result.packingResults.slice(0, 3).map((carton: any, index: number) => (
                  <View key={index} className="mb-4">
                    <Text className="text-gray-700 dark:text-gray-300 font-bold mb-2">Carton #{index + 1}</Text>
                    <View className="space-y-1">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Items Packed</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">{carton.itemsPacked}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Selected Orientation</Text>
                        <Text className="text-green-600 dark:text-green-400 text-sm font-bold">{carton.orientation}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Dimensions Used</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                          {carton.orientationDetails?.dimensionsUsed ?
                            `${carton.orientationDetails.dimensionsUsed.length}×${carton.orientationDetails.dimensionsUsed.breadth}×${carton.orientationDetails.dimensionsUsed.height}` :
                            "N/A"
                          }
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Arrangement Pattern</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                          {carton.orientationDetails?.arrangementPattern || `${carton.layout?.arrangement?.lengthwise || 0} × ${carton.layout?.arrangement?.breadthwise || 0} × ${carton.layout?.arrangement?.layers || 0}`}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Stacking Pattern</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                          {carton.orientationDetails?.stackingPattern?.itemsPerLayer || carton.layout?.itemsPerLayer || 0} items/layer, {carton.orientationDetails?.stackingPattern?.totalLayers || carton.layout?.layers || 0} layers
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Optimal Stacking</Text>
                        <Text className={`${carton.orientationDetails?.stackingPattern?.isOptimalStacking ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} text-sm font-medium`}>
                          {carton.orientationDetails?.stackingPattern?.isOptimalStacking ? "Yes" : "No"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Volume Efficiency</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">{carton.efficiency?.volumeEfficiency}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Weight Utilization</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">{carton.efficiency?.weightUtilization}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Space Optimality</Text>
                        <Text className="text-green-600 dark:text-green-400 text-sm font-medium">
                          {carton.packingMetrics?.spaceOptimality || "Good"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Stacking Safety</Text>
                        <Text className={`${carton.stackingInfo?.stackingSafety ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} text-sm font-medium`}>
                          {carton.stackingInfo?.stackingSafety ? "Safe" : "Unsafe"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Carton Utilization</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                          {((carton.packingMetrics?.cartonUtilization || 0) * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    {index < 2 && <View className="h-px bg-gray-200 dark:bg-gray-700 border-t mt-3" />}
                  </View>
                ))}
                {result.packingResults.length > 3 && (
                  <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    +{result.packingResults.length - 3} more cartons with similar configuration
                  </Text>
                )}
              </View>
            )}

            {/* Optimization Details */}
            {result.summary?.optimizationApplied && (
              <View className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border-gray-200 dark:border-gray-700 border mb-4">
                <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Optimization Features</Text>
                <View className="space-y-2">
                  {Object.entries(result.summary.optimizationApplied).map(([key, value]: [string, any]) => (
                    <View key={key} className="flex-row justify-between items-center">
                      <Text className="text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <View className={`w-4 h-4 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                    </View>
                  ))}
                </View>
                <View className="mt-3 pt-3 border-t border-gray-300">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Algorithm Used</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                      {result.summary.algorithmUsed || "Standard"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Advanced Metrics */}
            {result.analytics?.packingQuality && (
              <View className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border-gray-200 dark:border-gray-700 border mb-4">
                <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Advanced Analytics</Text>
                <View className="space-y-3">
                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-500 dark:text-gray-400">Waste Analysis</Text>
                      <Text className="text-gray-900 dark:text-gray-100 font-medium">
                        {result.analytics.packingQuality.wasteAnalysis?.wastePercentage?.toFixed(1)}% waste
                      </Text>
                    </View>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                      Total waste: {(result.analytics.packingQuality.wasteAnalysis?.totalWasteVolume / 1000000)?.toFixed(2)} L
                    </Text>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-500 dark:text-gray-400">Stacking Analysis</Text>
                      <Text className="text-gray-900 dark:text-gray-100 font-medium">
                        {result.analytics.packingQuality.stackingAnalysis?.avgStackLayers} avg layers
                      </Text>
                    </View>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                      {result.analytics.packingQuality.stackingAnalysis?.totalStackedCartons} stacked cartons
                    </Text>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-500 dark:text-gray-400">Fragile Handling</Text>
                      <Text className="text-gray-900 dark:text-gray-100 font-medium">
                        {result.productInfo?.isFragile ? "Applied" : "Not Required"}
                      </Text>
                    </View>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                      Can rotate: {result.productInfo?.canRotate ? "Yes" : "No"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Recommendations */}
            {result.analytics?.recommendations?.length > 0 && (
              <View className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border-gray-200 dark:border-gray-700 border mb-4">
                <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Recommendations</Text>
                {result.analytics.recommendations.map((rec: any, index: number) => (
                  <View key={index} style={{ 
                    backgroundColor: isDark ? '#92400e' : '#fef3c7', 
                    padding: 12, 
                    borderRadius: 8, 
                    marginBottom: 8 
                  }}>
                    <View className="flex-row items-center mb-1">
                      <View className={`w-2 h-2 rounded-full ${rec.priority === 'HIGH' ? 'bg-red-500' : rec.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'} mr-2`} />
                      <Text style={{ 
                        color: isDark ? '#fbbf24' : '#92400e', 
                        fontWeight: '500', 
                        fontSize: 14 
                      }}>
                        {rec.priority} PRIORITY
                      </Text>
                    </View>
                    <Text style={{ 
                      color: isDark ? '#fbbf24' : '#92400e', 
                      fontSize: 14 
                    }}>
                      {rec.message}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Environmental Impact */}
            {result.analytics?.sustainability && (
              <View className="bg-gray-100/40 dark:bg-gray-900 p-5 rounded-2xl border-gray-200 dark:border-gray-700 border mb-4">
                <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-3">Environmental Impact</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Carbon Footprint</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">
                      {result.analytics.sustainability.carbonFootprint?.totalFootprint} kg CO₂
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Packing Density</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">
                      {(result.analytics.sustainability.packingDensity * 100)?.toFixed(2)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Waste Volume</Text>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">
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
              style={{
                flex: 1,
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                paddingVertical: 16,
                borderRadius: 16
              }}
              onPress={() => {
                clearResult();
                setTab(0);
                setSelectedItem(null);
                setQuantity("1");
              }}
            >
              <Text className="text-gray-900 dark:text-gray-100 font-bold text-center text-lg">Start Over</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-600 dark:bg-green-500 py-4 rounded-2xl"
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
    <View style={{ 
      flexDirection: 'row', 
      marginBottom: 16, 
      backgroundColor: isDark ? '#374151' : '#e5e7eb', 
      borderRadius: 16, 
      padding: 4 
    }}>
      <Pressable
        className={`flex-1 py-3 rounded-xl ${tab === 0 ? (isDark ? 'bg-gray-700' : 'bg-white') : 'transparent'}`}
        onPress={() => {
          // Always reset everything when going to Select Item
          clearResult();
          setTab(0);
          setSelectedItem(null);
          setQuantity("1");
        }}
      >
        <Text className={`text-center font-bold text-sm ${tab === 0 ? (isDark ? 'text-white' : 'text-blue-700') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
          Select Item
        </Text>
      </Pressable>
      <Pressable
        className={`flex-1 py-3 rounded-xl ${tab === 1 ? (isDark ? 'bg-gray-700' : 'bg-white') : 'transparent'}`}
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
        <Text className={`text-center font-bold text-sm ${tab === 1 ? (isDark ? 'text-white' : 'text-blue-700') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
          Quantity
        </Text>
      </Pressable>
      <Pressable
        className={`flex-1 py-3 rounded-xl ${tab === 2 ? (isDark ? 'bg-gray-700' : 'bg-white') : 'transparent'}`}
        onPress={() => {
          if (result) {
            setTab(2);
          }
        }}
        disabled={!result}
      >
        <Text className={`text-center font-bold text-sm ${tab === 2 ? (isDark ? 'text-white' : 'text-blue-700') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
          Results
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white/40 dark:bg-gray-950">
      <StatusBar style="auto" translucent={true} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="px-6 py-4 flex-1 mb-20">
          <View className="mb-6">
            <Text className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center">
              Packing Analysis
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
              Optimize your shipping costs
            </Text>
          </View>
          {renderTabs()}
          {tab === 0 && renderSelectItem()}
          {tab === 1 && selectedItem && (
            <View className="flex-1 ">
              <View className="bg-gray-100/40 dark:bg-gray-900 p-4 rounded-2xl border border-gray-400 dark:border-gray-400 mb-6">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">Selected Product</Text>
                <Text className="text-gray-900 dark:text-gray-100 text-2xl font-bold mb-2">{selectedItem.productName}</Text>
                <Text className="text-gray-600 dark:text-gray-300">
                  Available: {selectedItem.quantity} units
                </Text>
                <TouchableOpacity
                  className="mt-4 py-2 px-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg self-start"
                  onPress={() => {
                    setTab(0);
                    clearResult();
                    setSelectedItem(null);
                    setQuantity("1");
                  }}
                >
                  <Text className="text-blue-700 dark:text-blue-300 text-sm font-medium">Change Product</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-green-600 py-4 rounded-2xl"
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
