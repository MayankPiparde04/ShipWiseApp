import { useBoxes } from "@/contexts/BoxContext";
import { useInventory } from "@/contexts/InventoryContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Item {
  _id: string;
  productName: string;
  quantity: number;
  weight: number; // in grams
  price: number;
  dimensions: { length: number; breadth: number; height: number };
  category?: string;
  brand?: string;
}

interface Box {
  _id: string;
  box_name: string;
  length: number;
  breadth: number;
  height: number;
  quantity: number;
  max_weight: number; // in kgs
}

export default function Inventory() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"items" | "boxes">("items");

  // Modal state
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);

  // Items state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    productName: "",
    quantity: "",
    weight: "",
    price: "",
    length: "",
    breadth: "",
    height: "",
    category: "",
    brand: "",
  });
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Boxes state - simplified with BoxContext
  const [showAddBoxForm, setShowAddBoxForm] = useState(false);
  const [newBox, setNewBox] = useState({
    box_name: "",
    length: "",
    breadth: "",
    height: "",
    quantity: "",
    max_weight: "",
  });
  const [isAddingBox, setIsAddingBox] = useState(false);

  const { items, isLoading: isLoadingItems, fetchItems, addItem, removeItem } =
    useInventory();

  const { 
    boxes, 
    isLoading: isLoadingBoxes, 
    fetchBoxes, 
    addBox, 
    removeBox 
  } = useBoxes();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (activeTab === "boxes") {
      fetchBoxes();
    }
  }, [activeTab, fetchBoxes]);

  const handleAddItem = async () => {
    try {
      setIsAddingItem(true);
      const itemData = {
        productName: newItem.productName,
        quantity: parseInt(newItem.quantity),
        weight: parseFloat(newItem.weight),
        price: parseFloat(newItem.price),
        dimensions: {
          length: parseFloat(newItem.length),
          breadth: parseFloat(newItem.breadth),
          height: parseFloat(newItem.height),
        },
        category: newItem.category,
        brand: newItem.brand,
      };
      await addItem(itemData);
      Alert.alert("Success", "Item added");
      setNewItem({
        productName: "",
        quantity: "",
        weight: "",
        price: "",
        length: "",
        breadth: "",
        height: "",
        category: "",
        brand: "",
      });
      setShowAddForm(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add item");
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleAddBox = async () => {
    try {
      setIsAddingBox(true);
      const boxData = {
        box_name: newBox.box_name,
        length: parseFloat(newBox.length),
        breadth: parseFloat(newBox.breadth),
        height: parseFloat(newBox.height),
        quantity: parseInt(newBox.quantity),
        max_weight: parseFloat(newBox.max_weight),
      };

      await addBox(boxData);
      Alert.alert("Success", "Box added");
      setNewBox({
        box_name: "",
        length: "",
        breadth: "",
        height: "",
        quantity: "",
        max_weight: "",
      });
      setShowAddBoxForm(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add box");
    } finally {
      setIsAddingBox(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeItem(id);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleDeleteBox = (id: string) => {
    Alert.alert("Delete Box", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeBox(id);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  const showItemDetails = (item: Item) => {
    setSelectedItem(item);
    setSelectedBox(null);
    setDetailsModalVisible(true);
  };

  const showBoxDetails = (box: Box) => {
    setSelectedBox(box);
    setSelectedItem(null);
    setDetailsModalVisible(true);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View className="bg-zinc-900 p-4 mb-4 rounded-xl shadow-lg border border-zinc-700 h-32 flex-row justify-between">
      <View className="flex-1">
        <Text className="text-white text-xl font-bold" numberOfLines={1}>
          {item.productName}
        </Text>
        <Text className="text-zinc-300">Qty: {item.quantity}</Text>
        <Text className="text-zinc-300">Weight: {item.weight}g</Text>
        <Text className="text-zinc-300">Price: ₹{item.price}</Text>
      </View>
      <View className="justify-between items-end">
        <TouchableOpacity onPress={() => showItemDetails(item)} className="p-2">
          <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item._id)}
          className="bg-red-600 p-2 rounded-full"
        >
          <Ionicons name="trash-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBox = ({ item }: { item: Box }) => (
    <View className="bg-zinc-900 p-4 mb-4 rounded-xl shadow-lg border border-zinc-700 h-32 flex-row justify-between">
      <View className="flex-1">
        <Text className="text-white text-xl font-bold" numberOfLines={1}>
          {item.box_name}
        </Text>
        <Text className="text-zinc-300">Qty: {item.quantity}</Text>
        <Text className="text-zinc-300">Max Weight: {item.max_weight}kg</Text>
        <Text className="text-zinc-400">
          {item.length} × {item.breadth} × {item.height} cm
        </Text>
      </View>
      <View className="justify-between items-end">
        <TouchableOpacity onPress={() => showBoxDetails(item)} className="p-2">
          <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteBox(item._id)}
          className="bg-red-600 p-2 rounded-full"
        >
          <Ionicons name="trash-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={detailsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/70">
        <View className="bg-zinc-900 w-[90%] rounded-xl p-6 border border-zinc-700">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-2xl font-bold">
              {selectedItem ? "Item Details" : "Box Details"}
            </Text>
            <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {selectedItem && (
            <ScrollView className="max-h-96">
              <Text className="text-white text-xl font-bold mb-2">
                {selectedItem.productName}
              </Text>
              <Text className="text-zinc-300 mb-1">
                Quantity: {selectedItem.quantity}
              </Text>
              <Text className="text-zinc-300 mb-1">
                Weight: {selectedItem.weight}g
              </Text>
              <Text className="text-zinc-300 mb-1">
                Price: ₹{selectedItem.price}
              </Text>
              <Text className="text-zinc-400 mb-1">
                Dimensions: {selectedItem.dimensions.length} ×{" "}
                {selectedItem.dimensions.breadth} ×{" "}
                {selectedItem.dimensions.height} cm
              </Text>
              {selectedItem.category && (
                <Text className="text-zinc-500 mb-1">
                  Category: {selectedItem.category}
                </Text>
              )}
              {selectedItem.brand && (
                <Text className="text-zinc-500 mb-1">
                  Brand: {selectedItem.brand}
                </Text>
              )}
            </ScrollView>
          )}

          {selectedBox && (
            <ScrollView className="max-h-96">
              <Text className="text-white text-xl font-bold mb-2">
                {selectedBox.box_name}
              </Text>
              <Text className="text-zinc-300 mb-1">
                Quantity: {selectedBox.quantity}
              </Text>
              <Text className="text-zinc-300 mb-1">
                Maximum Weight: {selectedBox.max_weight}kg
              </Text>
              <Text className="text-zinc-400 mb-1">
                Dimensions: {selectedBox.length} × {selectedBox.breadth} ×{" "}
                {selectedBox.height} cm
              </Text>
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={() => setDetailsModalVisible(false)}
            className="bg-zinc-700 mt-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderItemForm = () => (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        enabled={!isAddingItem}
      >
        <ScrollView className="px-4 py-6" scrollEnabled={!isAddingItem}>
          <View className="flex-row justify-between mb-6">
            <Text className="text-2xl text-white font-bold">Add Item</Text>
            <TouchableOpacity
              onPress={() => setShowAddForm(false)}
              className="bg-zinc-700 px-4 py-2 rounded-full"
              disabled={isAddingItem}
              style={isAddingItem ? { opacity: 0.5 } : undefined}
            >
              <Text className="text-white">Cancel</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            {[
              { key: "productName", placeholder: "Product Name" },
              {
                key: "quantity",
                placeholder: "Quantity",
                keyboardType: "numeric",
              },
              {
                key: "weight",
                placeholder: "Weight (grams)",
                keyboardType: "decimal-pad",
              },
              {
                key: "price",
                placeholder: "Price (₹)",
                keyboardType: "decimal-pad",
              },
              { key: "category", placeholder: "Category (optional)" },
              { key: "brand", placeholder: "Brand (optional)" },
            ].map((field) => (
              <TextInput
                key={field.key}
                className="bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
                placeholder={field.placeholder}
                placeholderTextColor="#aaa"
                keyboardType={field.keyboardType as any}
                value={newItem[field.key as keyof typeof newItem]}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, [field.key]: text })
                }
              />
            ))}

            <View className="flex-row space-x-2">
              {["length", "breadth", "height"].map((dim) => (
                <TextInput
                  key={dim}
                  className="flex-1 bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
                  placeholder={`${dim.charAt(0).toUpperCase() + dim.slice(1)} (cm)`}
                  placeholderTextColor="#aaa"
                  value={newItem[dim as keyof typeof newItem]}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, [dim]: text })
                  }
                  keyboardType="decimal-pad"
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAddItem}
              className="bg-green-600 py-4 rounded-lg mt-6 flex-row items-center justify-center"
              disabled={isAddingItem}
              style={isAddingItem ? { opacity: 0.6 } : undefined}
            >
              {isAddingItem && (
                <Ionicons
                  name="refresh"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8, transform: [{ rotate: "90deg" }] }}
                />
              )}
              <Text className="text-white text-center font-bold text-lg">
                {isAddingItem ? "Saving..." : "Save Item"}
              </Text>
            </TouchableOpacity>
            {isAddingItem && (
              <View className="mt-6 items-center">
                <Text className="text-green-400">Saving item, please wait...</Text>
              </View>
            )}
          </View>
        </ScrollView>
        {isAddingItem && (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
            pointerEvents="auto"
          >
            <Ionicons name="hourglass" size={48} color="#22d3ee" />
            <Text className="text-white mt-4 text-lg">Saving...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  const renderBoxForm = () => (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        enabled={!isAddingBox}
      >
        <ScrollView className="px-4 py-6" scrollEnabled={!isAddingBox}>
          <View className="flex-row justify-between mb-6">
            <Text className="text-2xl text-white font-bold">Add Box</Text>
            <TouchableOpacity
              onPress={() => setShowAddBoxForm(false)}
              className="bg-zinc-700 px-4 py-2 rounded-full"
              disabled={isAddingBox}
              style={isAddingBox ? { opacity: 0.5 } : undefined}
            >
              <Text className="text-white">Cancel</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            {[
              { key: "box_name", placeholder: "Box Name" },
              {
                key: "quantity",
                placeholder: "Quantity",
                keyboardType: "numeric",
              },
              {
                key: "max_weight",
                placeholder: "Max Weight (kg)",
                keyboardType: "decimal-pad",
              },
            ].map((field) => (
              <TextInput
                key={field.key}
                className="bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
                placeholder={field.placeholder}
                placeholderTextColor="#aaa"
                keyboardType={field.keyboardType as any}
                value={newBox[field.key as keyof typeof newBox]}
                onChangeText={(text) =>
                  setNewBox({ ...newBox, [field.key]: text })
                }
              />
            ))}

            <View className="flex-row space-x-2">
              {["length", "breadth", "height"].map((dim) => (
                <TextInput
                  key={dim}
                  className="flex-1 bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
                  placeholder={`${dim.charAt(0).toUpperCase() + dim.slice(1)} (cm)`}
                  placeholderTextColor="#aaa"
                  value={newBox[dim as keyof typeof newBox]}
                  onChangeText={(text) => setNewBox({ ...newBox, [dim]: text })}
                  keyboardType="decimal-pad"
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAddBox}
              className="bg-green-600 py-4 rounded-lg mt-6 flex-row items-center justify-center"
              disabled={isAddingBox}
              style={isAddingBox ? { opacity: 0.6 } : undefined}
            >
              {isAddingBox && (
                <Ionicons
                  name="refresh"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8, transform: [{ rotate: "90deg" }] }}
                />
              )}
              <Text className="text-white text-center font-bold text-lg">
                {isAddingBox ? "Saving..." : "Save Box"}
              </Text>
            </TouchableOpacity>
            {isAddingBox && (
              <View className="mt-6 items-center">
                <Text className="text-green-400">Saving box, please wait...</Text>
              </View>
            )}
          </View>
        </ScrollView>
        {isAddingBox && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
            pointerEvents="auto"
          >
            <Ionicons name="hourglass" size={48} color="#22d3ee" />
            <Text className="text-white mt-4 text-lg">Saving...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // No changes needed here, as InventoryContext and apiService now use the correct endpoints and authentication

  if (showAddForm) return renderItemForm();
  if (showAddBoxForm) return renderBoxForm();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="flex-1 px-4 py-6">
        {/* Tabs */}
        <View className="flex-row mb-6 bg-zinc-900 rounded-full overflow-hidden">
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "items" ? "bg-green-600" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("items")}
          >
            <Text className="text-white text-center font-semibold">Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "boxes" ? "bg-green-600" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("boxes")}
          >
            <Text className="text-white text-center font-semibold">Boxes</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "items" ? (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-white">Inventory</Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(true)}
                className="bg-green-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-semibold">+ Add Item</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="mb-4 p-3 rounded-xl bg-zinc-800 text-white border border-zinc-700"
              placeholder="Search items..."
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
            />

            {isLoadingItems ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-zinc-400">Loading items...</Text>
              </View>
            ) : (
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => fetchItems(true)}
                  />
                }
                ListEmptyComponent={
                  <View className="flex-1 items-center py-8">
                    <Text className="text-zinc-500">No items found</Text>
                  </View>
                }
              />
            )}
          </>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-white">Boxes</Text>
              <TouchableOpacity
                onPress={() => setShowAddBoxForm(true)}
                className="bg-green-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-semibold">+ Add Box</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="mb-4 p-3 rounded-xl bg-zinc-800 text-white border border-zinc-700"
              placeholder="Search boxes..."
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
            />

            {isLoadingBoxes ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-zinc-400">Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={boxes.filter(box => 
                  box.box_name.toLowerCase().includes(searchText.toLowerCase())
                )}
                renderItem={renderBox}
                keyExtractor={(item) => item._id}
                refreshControl={
                  <RefreshControl
                    refreshing={false}
                    onRefresh={() => fetchBoxes(true)}
                  />
                }
                ListEmptyComponent={
                  <View className="flex-1 items-center py-8">
                    <Text className="text-zinc-500">No boxes found</Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {renderDetailsModal()}
      </View>
    </SafeAreaView>
  );
}