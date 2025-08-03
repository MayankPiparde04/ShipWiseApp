import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface Box {
  _id: string;
  box_name: string;
  length: number;
  breadth: number;
  height: number;
  quantity: number;
  max_weight: number;
}

interface BoxContextType {
  boxes: Box[];
  isLoading: boolean;
  lastFetch: number | null;
  fetchBoxes: (refresh?: boolean) => Promise<void>;
  addBox: (box: Omit<Box, "_id">) => Promise<void>;
  updateBoxQuantity: (box_name: string, additionalQuantity: number) => Promise<void>;
  removeBox: (id: string) => Promise<void>;
  clearCache: () => void;
}

const BoxContext = createContext<BoxContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BOXES_STORAGE_KEY = 'inventory_boxes';
const BOXES_TIMESTAMP_KEY = 'inventory_boxes_timestamp';

export const BoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const { user } = useAuth(); // Use user from Auth context

  useEffect(() => {
    loadCachedBoxes();
  }, []);

  const loadCachedBoxes = async () => {
    try {
      const cachedBoxes = await AsyncStorage.getItem(BOXES_STORAGE_KEY);
      const cachedTimestamp = await AsyncStorage.getItem(BOXES_TIMESTAMP_KEY);
      
      if (cachedBoxes && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          setBoxes(JSON.parse(cachedBoxes));
          setLastFetch(timestamp);
          return;
        }
      }
      
      // Only fetch if user is present
      if (user) {
        await fetchBoxes(true);
      }
    } catch (error) {
      console.error('Error loading cached boxes:', error);
      // Only fetch if user is present
      if (user) {
        await fetchBoxes(true);
      }
    }
  };

  const saveCacheToStorage = async (boxesData: Box[], timestamp: number) => {
    try {
      await AsyncStorage.setItem(BOXES_STORAGE_KEY, JSON.stringify(boxesData));
      await AsyncStorage.setItem(BOXES_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error saving boxes cache:', error);
    }
  };

  const shouldRefreshCache = useCallback(() => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch > CACHE_DURATION;
  }, [lastFetch]);

  const fetchBoxes = useCallback(async (refresh = false) => {
    try {
      // Use cache if available and not forcing refresh
      if (!refresh && boxes.length > 0 && !shouldRefreshCache()) {
        return;
      }

      setIsLoading(true);

      const response = await apiService.getBoxes({
        page: 1,
        limit: 100,
      });

      if (response.success) {
        if (response.data && response.data.boxes) {
          const timestamp = Date.now();
          setBoxes(response.data.boxes);
          setLastFetch(timestamp);
          await saveCacheToStorage(response.data.boxes, timestamp);
        } else if (response.data === null && boxes.length === 0) {
          setBoxes([]);
          const timestamp = Date.now();
          setLastFetch(timestamp);
          await saveCacheToStorage([], timestamp);
        }
      }
    } catch (error) {
      console.error("Error fetching boxes:", error);
      if (boxes.length === 0) {
        setBoxes([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [boxes.length, shouldRefreshCache]);

  const addBox = async (box: Omit<Box, "_id">) => {
    const response = await apiService.addBox(box);
    if (response.success) {
      // Add to local state immediately for better UX
      if (response.data && response.data.box) {
        const newBoxes = [...boxes, response.data.box];
        setBoxes(newBoxes);
        const timestamp = Date.now();
        setLastFetch(timestamp);
        await saveCacheToStorage(newBoxes, timestamp);
      } else {
        // Fallback: refresh from API
        await fetchBoxes(true);
      }
    } else {
      throw new Error(response.message || "Failed to add box");
    }
  };

  const updateBoxQuantity = async (box_name: string, additionalQuantity: number) => {
    const response = await apiService.updateBoxQuantity(box_name, additionalQuantity);
    if (response.success) {
      // Update local state immediately
      const updatedBoxes = boxes.map(box => 
        box.box_name === box_name 
          ? { ...box, quantity: box.quantity + additionalQuantity }
          : box
      );
      setBoxes(updatedBoxes);
      const timestamp = Date.now();
      setLastFetch(timestamp);
      await saveCacheToStorage(updatedBoxes, timestamp);
    } else {
      throw new Error(response.message || "Failed to update box quantity");
    }
  };

  const removeBox = async (id: string) => {
    const response = await apiService.deleteBox(id);
    if (response.success) {
      const filteredBoxes = boxes.filter(box => box._id !== id);
      setBoxes(filteredBoxes);
      const timestamp = Date.now();
      setLastFetch(timestamp);
      await saveCacheToStorage(filteredBoxes, timestamp);
    } else {
      throw new Error(response.message || "Failed to delete box");
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.multiRemove([BOXES_STORAGE_KEY, BOXES_TIMESTAMP_KEY]);
      setBoxes([]);
      setLastFetch(null);
    } catch (error) {
      console.error('Error clearing boxes cache:', error);
    }
  };

  return (
    <BoxContext.Provider
      value={{
        boxes,
        isLoading,
        lastFetch,
        fetchBoxes,
        addBox,
        updateBoxQuantity,
        removeBox,
        clearCache,
      }}
    >
      {children}
    </BoxContext.Provider>
  );
};

export const useBoxes = () => {
  const context = useContext(BoxContext);
  if (!context) {
    throw new Error("useBoxes must be used within a BoxProvider");
  }
  return context;
};
