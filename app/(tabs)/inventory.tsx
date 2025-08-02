// app/inventory.tsx
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
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
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
      ]
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-gray-200">
      <View className="flex-row justify-between">
        <View className="flex-1 space-y-1">
          <Text className="text-xl font-semibold text-gray-800">
            {item.productName}
          </Text>
          <Text className="text-gray-600">Qty: {item.quantity}</Text>
          <Text className="text-gray-600">Weight: {item.weight}kg</Text>
          <Text className="text-gray-600">Price: ₹{item.price}</Text>
          <Text className="text-gray-600">
            Dimensions: {item.dimensions.length} × {item.dimensions.breadth} ×{" "}
            {item.dimensions.height} cm
          </Text>
          {item.category && (
            <Text className="text-gray-500">Category: {item.category}</Text>
          )}
          {item.brand && (
            <Text className="text-gray-500">Brand: {item.brand}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item._id)}
          className="bg-red-500 h-8 px-3 rounded-full justify-center ml-2"
        >
          <Text className="text-white text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showAddForm) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView className="flex-1 px-4 py-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-800">Add Item</Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(false)}
                className="bg-gray-400 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-medium">Cancel</Text>
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
                  placeholder: "Weight (kg)",
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
                  className="p-3 rounded-xl bg-white border border-gray-300"
                  placeholder={field.placeholder}
                  value={newItem[field.key as keyof typeof newItem]}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, [field.key]: text })
                  }
                  keyboardType={field.keyboardType as any}
                />
              ))}

              <View className="flex-row space-x-2">
                {["length", "breadth", "height"].map((dim) => (
                  <TextInput
                    key={dim}
                    className="flex-1 p-3 rounded-xl bg-white border border-gray-300"
                    placeholder={`${dim.charAt(0).toUpperCase() + dim.slice(1)} (cm)`}
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
                className="bg-blue-600 p-4 rounded-xl mt-4"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Save Item
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <View className="flex-1 px-4 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800">Inventory</Text>
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            className="bg-blue-600 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold">+ Add</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          className="mb-4 p-3 rounded-xl bg-white border border-gray-300"
          placeholder="Search items..."
          value={searchText}
          onChangeText={setSearchText}
        />

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">Loading...</Text>
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
                <Text className="text-gray-500">No items found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
