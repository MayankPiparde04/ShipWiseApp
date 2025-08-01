// tab2 / inventory management
import { apiService } from "@/services/api";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
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
  weight: number;
  price: number;
  dimensions: {
    length: number;
    breadth: number;
    height: number;
  };
  category?: string;
  brand?: string;
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
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

  const fetchItems = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        const response = await apiService.getItems({
          page: 1,
          limit: 50,
          search: searchText,
          sortBy: "productName",
          sortOrder: "asc",
        });

        if (response.success) {
          setItems(response.data?.items || []);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch items");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchText]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async () => {
    try {
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

      const response = await apiService.addOrUpdateItem(itemData);

      if (response.success) {
        Alert.alert("Success", "Item added successfully");
        setShowAddForm(false);
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
        fetchItems();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add item");
    }
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.deleteItem(id);
            Alert.alert("Success", "Item deleted successfully");
            fetchItems();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete item");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View className="bg-white p-4 m-2 rounded-lg shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {item.productName}
          </Text>
          <Text className="text-gray-600">Quantity: {item.quantity}</Text>
          <Text className="text-gray-600">Weight: {item.weight}kg</Text>
          <Text className="text-gray-600">Price: ${item.price}</Text>
          <Text className="text-gray-600">
            Dimensions: {item.dimensions.length} × {item.dimensions.breadth} ×{" "}
            {item.dimensions.height} cm
          </Text>
          {item.category && (
            <Text className="text-gray-600">Category: {item.category}</Text>
          )}
          {item.brand && <Text className="text-gray-600">Brand: {item.brand}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item._id)}
          className="bg-red-500 px-3 py-1 rounded"
        >
          <Text className="text-white text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showAddForm) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView className="flex-1 p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-900">
                Add New Item
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(false)}
                className="bg-gray-500 px-4 py-2 rounded"
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                placeholder="Product Name"
                value={newItem.productName}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, productName: text })
                }
              />
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                placeholder="Quantity"
                value={newItem.quantity}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, quantity: text })
                }
                keyboardType="numeric"
              />
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                placeholder="Weight (kg)"
                value={newItem.weight}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, weight: text })
                }
                keyboardType="decimal-pad"
              />
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                placeholder="Price ($)"
                value={newItem.price}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, price: text })
                }
                keyboardType="decimal-pad"
              />
              <View className="flex-row space-x-2">
                <TextInput
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="Length (cm)"
                  value={newItem.length}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, length: text })
                  }
                  keyboardType="decimal-pad"
                />
                <TextInput
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="Breadth (cm)"
                  value={newItem.breadth}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, breadth: text })
                  }
                  keyboardType="decimal-pad"
                />
                <TextInput
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="Height (cm)"
                  value={newItem.height}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, height: text })
                  }
                  keyboardType="decimal-pad"
                />
              </View>
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                placeholder="Category (optional)"
                value={newItem.category}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, category: text })
                }
              />
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                placeholder="Brand (optional)"
                value={newItem.brand}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, brand: text })
                }
              />
              <TouchableOpacity
                onPress={handleAddItem}
                className="bg-blue-600 p-4 rounded-lg"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Inventory</Text>
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            <Text className="text-white font-semibold">Add Item</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg bg-white mb-4"
          placeholder="Search items..."
          value={searchText}
          onChangeText={setSearchText}
        />

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">Loading items...</Text>
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
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-gray-600">No items found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
