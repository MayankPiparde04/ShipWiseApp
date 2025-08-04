import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface Item {
  _id: string;
  productName: string;
  quantity: number;
  weight: number;
  price: number;
  dimensions: { length: number; breadth: number; height: number };
  category?: string;
  brand?: string;
}

interface DailyData {
  day: string;
  quantity: number;
}

interface InventoryContextType {
  items: Item[];
  isLoading: boolean;
  lastFetch: number | null;
  dailyData: DailyData[];
  fetchItems: (refresh?: boolean) => Promise<void>;
  addItem: (item: Omit<Item, "_id">) => Promise<void>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCache: () => void;
  updateBox: (id: string, boxUpdate: Partial<Item>) => Promise<void>;
  predictItemDimensions: (
    imageUri: string,
    referenceObject?: string,
    unit?: string,
    additionalContext?: string
  ) => Promise<any>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const ITEMS_STORAGE_KEY = 'inventory_items';
const DAILY_DATA_STORAGE_KEY = 'daily_data';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    loadItemsFromStorage();
    loadDailyDataFromStorage();
  }, []);

  const loadItemsFromStorage = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading items from storage:', error);
      setItems([]);
    }
  };

  const loadDailyDataFromStorage = async () => {
    try {
      const storedDailyData = await AsyncStorage.getItem(DAILY_DATA_STORAGE_KEY);
      if (storedDailyData) {
        setDailyData(JSON.parse(storedDailyData));
      } else {
        setDailyData([]);
      }
    } catch (error) {
      console.error('Error loading daily data from storage:', error);
      setDailyData([]);
    }
  };

  const saveItemsToStorage = async (itemsData: Item[]) => {
    try {
      await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(itemsData));
    } catch (error) {
      console.error('Error saving items to storage:', error);
    }
  };

  const saveDailyDataToStorage = async (data: DailyData[]) => {
    try {
      await AsyncStorage.setItem(DAILY_DATA_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving daily data to storage:', error);
    }
  };

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getItems({
        page: 1,
        limit: 100,
        sortBy: "productName",
        sortOrder: "asc",
      });

      if (response.success && response.data && response.data.items) {
        // Clean items to match Item interface
        const cleanedItems = response.data.items.map((item: any) => ({
          _id: item._id,
          productName: item.productName,
          quantity: item.quantity,
          weight: item.weight,
          price: item.price,
          dimensions: {
            length: item.dimensions?.length ?? 0,
            breadth: item.dimensions?.breadth ?? 0,
            height: item.dimensions?.height ?? 0,
          },
          category: item.category,
          brand: item.brand,
        }));
        setItems(cleanedItems);
        await saveItemsToStorage(cleanedItems);

        // Handle dailyData if present
        if (Array.isArray(response.data.dailyData)) {
          setDailyData(response.data.dailyData);
          await saveDailyDataToStorage(response.data.dailyData);
        }
      } else if (response.data === null) {
        setItems([]);
        await saveItemsToStorage([]);
        setDailyData([]);
        await saveDailyDataToStorage([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      await loadItemsFromStorage();
      await loadDailyDataFromStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = async (item: Omit<Item, "_id">) => {
    const response = await apiService.addOrUpdateItem(item);
    if (response.success) {
      if (response.data && response.data.item) {
        const newItems = [...items, response.data.item];
        setItems(newItems);
        await saveItemsToStorage(newItems);
      } else {
        await fetchItems();
      }
    } else {
      throw new Error(response.message || "Failed to add item");
    }
  };

  const updateItem = async (id: string, itemUpdate: Partial<Item>) => {
    const response = await apiService.addOrUpdateItem({
      ...itemUpdate,
      productName: itemUpdate.productName || "",
      quantity: itemUpdate.quantity || 0,
      weight: itemUpdate.weight || 0,
      price: itemUpdate.price || 0,
      dimensions: itemUpdate.dimensions || { length: 0, breadth: 0, height: 0 },
    });
    if (response.success) {
      await fetchItems(); // Refresh items and dailyData for dashboard/graph
    } else {
      throw new Error(response.message || "Failed to update item");
    }
  };

  const removeItem = async (id: string) => {
    const response = await apiService.deleteItem(id);
    if (response.success) {
      const filteredItems = items.filter((item) => item._id !== id);
      setItems(filteredItems);
      await saveItemsToStorage(filteredItems);
    } else {
      throw new Error(response.message || "Failed to delete item");
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(ITEMS_STORAGE_KEY);
      setItems([]);
    } catch (error) {
      console.error('Error clearing items from storage:', error);
    }
  };
  const updateBox = async (id: string, boxUpdate: Partial<Item>) => {
    const response = await apiService.updateBox(id, boxUpdate);
    if (response.success) {
      await fetchItems();
    } else {
      throw new Error(response.message || "Failed to update box");
    }
  };
  const predictItemDimensions = async (
    imageUri: string,
    referenceObject?: string,
    unit?: string,
    additionalContext?: string
  ) => {
    try {
      console.log('Starting AI prediction with:', { imageUri, referenceObject, unit, additionalContext });
      
      // Set default values if not provided
      const finalReferenceObject = referenceObject || 'coin';
      const finalUnit = unit || 'cm';
      const finalAdditionalContext = additionalContext || 'object for dimension measurement';
      
      const result = await apiService.predictDimensionsWithDetails(
        imageUri,
        finalReferenceObject,
        finalUnit,
        finalAdditionalContext
      );
      
      console.log('AI prediction successful:', result);
      return result;
    } catch (error: any) {
      console.error('AI prediction failed:', error);
      
      // Check if it's a network connectivity issue
      if (error.message?.includes('Network request failed') || error.message?.includes('Unable to connect')) {
        throw new Error('Unable to connect to the AI service. Please check your internet connection and ensure the server is running on the correct IP address.');
      }
      
      throw new Error(error.message || 'Failed to predict dimensions. Please try again.');
    }
  };
  

  return (
    <InventoryContext.Provider
      value={{
        items,
        isLoading,
        lastFetch: null,
        dailyData,
        fetchItems,
        addItem,
        updateItem,
        removeItem,
        clearCache,
        updateBox,
        predictItemDimensions,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// Make sure this is at the top level, not inside any function or block!
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};