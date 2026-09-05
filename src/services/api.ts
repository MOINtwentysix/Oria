import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
// @ts-ignore - expo-secure-store types
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  private async loadToken() {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        this.token = token;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to load auth token:', error);
    }
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (!config.headers.Authorization && this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await SecureStore.setItemAsync('auth_token', token);
  }

  async clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync('auth_token');
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  async get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  async post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data);
  }

  async put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  async patch<T>(url: string, data?: any) {
    return this.client.patch<T>(url, data);
  }

  async delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export const apiClient = new ApiClient();

export const api = {
  auth: {
    me: () => apiClient.get('/auth/me'),
    sync: (clerkData: any) => apiClient.post('/auth/sync', clerkData),
    refresh: () => apiClient.post('/auth/refresh'),
  },
  places: {
    search: (params: any) => apiClient.get('/places/search', { params }),
    nearby: (lat: number, lng: number, radius: number, categories?: string[]) =>
      apiClient.get('/places/nearby', { params: { lat, lng, radius, categories: categories?.join(',') } }),
    details: (placeId: string) => apiClient.get(`/places/${placeId}`),
    photos: (placeId: string) => apiClient.get(`/places/${placeId}/photos`),
    categories: () => apiClient.get('/places/categories'),
  },
  saved: {
    places: {
      list: () => apiClient.get('/saved/places'),
      add: (data: { place_id: string; list_id?: string; notes?: string }) => apiClient.post('/saved/places', data),
      remove: (placeId: string) => apiClient.delete(`/saved/places/${placeId}`),
      update: (placeId: string, data: { notes?: string; list_id?: string }) => apiClient.patch(`/saved/places/${placeId}`, data),
    },
    lists: {
      list: () => apiClient.get('/saved/lists'),
      create: (data: { name: string; description?: string; is_shared?: boolean }) => apiClient.post('/saved/lists', data),
      get: (listId: string) => apiClient.get(`/saved/lists/${listId}`),
      update: (listId: string, data: { name?: string; description?: string; is_shared?: boolean; cover_image?: string }) => apiClient.patch(`/saved/lists/${listId}`, data),
      delete: (listId: string) => apiClient.delete(`/saved/lists/${listId}`),
      items: (listId: string) => apiClient.get(`/saved/lists/${listId}/items`),
      addItem: (listId: string, data: { place_id: string; notes?: string; position?: number }) => apiClient.post(`/saved/lists/${listId}/items`, data),
      removeItem: (listId: string, itemId: string) => apiClient.delete(`/saved/lists/${listId}/items/${itemId}`),
      reorderItems: (listId: string, items: { id: string; position: number }[]) => apiClient.patch(`/saved/lists/${listId}/items/reorder`, { items }),
      members: (listId: string) => apiClient.get(`/saved/lists/${listId}/members`),
      invite: (listId: string, data: { email: string; role: 'editor' | 'viewer' }) => apiClient.post(`/saved/lists/${listId}/members`, data),
      removeMember: (listId: string, memberId: string) => apiClient.delete(`/saved/lists/${listId}/members/${memberId}`),
      updateMember: (listId: string, memberId: string, data: { role: 'editor' | 'viewer' }) => apiClient.patch(`/saved/lists/${listId}/members/${memberId}`, data),
      acceptInvite: (token: string) => apiClient.post(`/saved/lists/invite/${token}/accept`),
    },
  },
  ai: {
    conversations: {
      list: () => apiClient.get('/ai/conversations'),
      create: (data: { title?: string }) => apiClient.post('/ai/conversations', data),
      get: (id: string) => apiClient.get(`/ai/conversations/${id}`),
      delete: (id: string) => apiClient.delete(`/ai/conversations/${id}`),
    },
    messages: {
      list: (conversationId: string) => apiClient.get(`/ai/conversations/${conversationId}/messages`),
      send: (conversationId: string, data: { content: string; model?: string }) => apiClient.post(`/ai/conversations/${conversationId}/messages`, data),
      // @ts-ignore - stream response type
      stream: (conversationId: string, data: { content: string; model?: string }) => apiClient.post(`/ai/conversations/${conversationId}/messages/stream`, data, { responseType: 'stream' } as any),
    },
    ask: (data: { query: string; location?: { lat: number; lng: number }; radius?: number; categories?: string[] }) => apiClient.post('/ai/ask', data),
    planTrip: (data: { location: { lat: number; lng: number }; duration: number; interests: string[]; budget?: string; people: number; transport: string }) => apiClient.post('/ai/plan-trip', data),
    planList: (data: { list_id: string; transport?: string }) => apiClient.post('/ai/plan-list', data),
  },
  trips: {
    list: () => apiClient.get('/trips'),
    create: (data: any) => apiClient.post('/trips', data),
    get: (tripId: string) => apiClient.get(`/trips/${tripId}`),
    update: (tripId: string, data: any) => apiClient.patch(`/trips/${tripId}`, data),
    delete: (tripId: string) => apiClient.delete(`/trips/${tripId}`),
    route: (tripId: string) => apiClient.get(`/trips/${tripId}/route`),
    exportGoogleMaps: (tripId: string) => apiClient.get(`/trips/${tripId}/export/google-maps`),
  },
  routing: {
    route: (waypoints: { lat: number; lng: number }[], profile?: string) => apiClient.post('/routing/route', { waypoints, profile: profile || 'driving' }),
    table: (locations: { lat: number; lng: number }[]) => apiClient.post('/routing/table', { locations }),
    nearest: (lat: number, lng: number) => apiClient.get('/routing/nearest', { params: { lat, lng } }),
  },
  user: {
    profile: () => apiClient.get('/user/profile'),
    updateProfile: (data: any) => apiClient.patch('/user/profile', data),
    preferences: () => apiClient.get('/user/preferences'),
    updatePreferences: (data: any) => apiClient.patch('/user/preferences', data),
    notifications: () => apiClient.get('/user/notifications'),
    markNotificationRead: (id: string) => apiClient.patch(`/user/notifications/${id}/read`),
    deleteAccount: () => apiClient.delete('/user/account'),
  },
};