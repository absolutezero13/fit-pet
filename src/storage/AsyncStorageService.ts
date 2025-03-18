// types.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageItems } from "./types";

// Create a typed wrapper for AsyncStorage
export const storageService = {
  async getItem<K extends keyof StorageItems>(
    key: K
  ): Promise<StorageItems[K] | null> {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  async setItem<K extends keyof StorageItems>(
    key: K,
    value: StorageItems[K]
  ): Promise<void> {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async removeItem<K extends keyof StorageItems>(key: K): Promise<void> {
    return AsyncStorage.removeItem(key);
  },
};
