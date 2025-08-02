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

interface InventoryContextType {
  items: Item[];
  isLoading: boolean;
  lastFetch: number | null;
  fetchItems: (refresh?: boolean) => Promise<void>;
  addItem: (item: Omit<Item, "_id">) => Promise<void>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCache: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ITEMS_STORAGE_KEY = 'inventory_items';
const ITEMS_TIMESTAMP_KEY = 'inventory_items_timestamp';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  useEffect(() => {
    loadCachedItems();
  }, []);

  const loadCachedItems = async () => {
    try {
      const cachedItems = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
      const cachedTimestamp = await AsyncStorage.getItem(ITEMS_TIMESTAMP_KEY);
      
      if (cachedItems && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          setItems(JSON.parse(cachedItems));
          setLastFetch(timestamp);
          return;
        }
      }
      
      // If no cache or expired, fetch fresh data
      await fetchItems(true);
    } catch (error) {
      console.error('Error loading cached items:', error);
      await fetchItems(true);
    }
  };

  const saveCacheToStorage = async (itemsData: Item[], timestamp: number) => {
    try {
      await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(itemsData));
      await AsyncStorage.setItem(ITEMS_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error saving items cache:', error);
    }
  };

  const shouldRefreshCache = useCallback(() => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch > CACHE_DURATION;
  }, [lastFetch]);

  const fetchItems = useCallback(async (refresh = false) => {
    try {
      // Use cache if available and not forcing refresh
      if (!refresh && items.length > 0 && !shouldRefreshCache()) {
        return;
      }

      setIsLoading(true);

      const response = await apiService.getItems({
        page: 1,
        limit: 100,
        sortBy: "productName",
        sortOrder: "asc",
      });

      if (response.success) {
        if (response.data && response.data.items) {
          const timestamp = Date.now();
          setItems(response.data.items);
          setLastFetch(timestamp);
          await saveCacheToStorage(response.data.items, timestamp);
        } else if (response.data === null && items.length === 0) {
          setItems([]);
          const timestamp = Date.now();
          setLastFetch(timestamp);
          await saveCacheToStorage([], timestamp);
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      if (items.length === 0) {
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [items.length, shouldRefreshCache]);

  const addItem = async (item: Omit<Item, "_id">) => {
    const response = await apiService.addOrUpdateItem(item);
    if (response.success) {
      // Add to local state immediately for better UX
      if (response.data && response.data.item) {
        const newItems = [...items, response.data.item];
        setItems(newItems);
        const timestamp = Date.now();
        setLastFetch(timestamp);
        await saveCacheToStorage(newItems, timestamp);
      } else {
        // Fallback: refresh from API
        await fetchItems(true);
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
      // Update local state immediately
      const updatedItems = items.map((item) =>
        item._id === id ? { ...item, ...itemUpdate } : item
      );
      setItems(updatedItems);
      const timestamp = Date.now();
      setLastFetch(timestamp);
      await saveCacheToStorage(updatedItems, timestamp);
    } else {
      throw new Error(response.message || "Failed to update item");
    }
  };

  const removeItem = async (id: string) => {
    const response = await apiService.deleteItem(id);
    if (response.success) {
      const filteredItems = items.filter((item) => item._id !== id);
      setItems(filteredItems);
      const timestamp = Date.now();
      setLastFetch(timestamp);
      await saveCacheToStorage(filteredItems, timestamp);
    } else {
      throw new Error(response.message || "Failed to delete item");
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.multiRemove([ITEMS_STORAGE_KEY, ITEMS_TIMESTAMP_KEY]);
      setItems([]);
      setLastFetch(null);
    } catch (error) {
      console.error('Error clearing items cache:', error);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        isLoading,
        lastFetch,
        fetchItems,
        addItem,
        updateItem,
        removeItem,
        clearCache,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
