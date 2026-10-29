import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
  async clearToken(key: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      return SecureStore.deleteItemAsync(key);
    } catch {
      return;
    }
  },
};

// Configurable Clerk Publishable Key (reads from env or provides fallback)
export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_b3JpYS1sb2NhdGlvbi1kaXNjb3ZlcnktdGVzdC5jbGVyay5hY2NvdW50cy5kZXYk';
