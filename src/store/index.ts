import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates, Place, User, UserPreferences, SavedList, SavedListItem, TripPlan } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { api, hasApiConfiguration } from '@/services/api';

interface LocationState {
  currentLocation: Coordinates | null;
  lastKnownLocation: Coordinates | null;
  locationPermission: 'granted' | 'denied' | 'undetermined' | 'restricted';
  watching: boolean;
  setCurrentLocation: (location: Coordinates | null) => void;
  setLastKnownLocation: (location: Coordinates | null) => void;
  setLocationPermission: (permission: LocationState['locationPermission']) => void;
  setWatching: (watching: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: null,
      lastKnownLocation: null,
      locationPermission: 'undetermined',
      watching: false,
      setCurrentLocation: (location) => set({ currentLocation: location }),
      setLastKnownLocation: (location) => set({ lastKnownLocation: location }),
      setLocationPermission: (permission) => set({ locationPermission: permission }),
      setWatching: (watching) => set({ watching }),
    }),
    {
      name: STORAGE_KEYS.lastLocation,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ lastKnownLocation: state.lastKnownLocation }),
    }
  )
);

interface SearchState {
  query: string;
  selectedCategories: string[];
  filters: {
    openNow: boolean;
    priceRange: number[];
    sortBy: 'distance' | 'rating' | 'popularity';
    radius: number;
  };
  recentSearches: string[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  setSuggestions: (suggestions: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      selectedCategories: [],
      filters: {
        openNow: false,
        priceRange: [],
        sortBy: 'distance',
        radius: 5000,
      },
      recentSearches: [],
      suggestions: [],
      loading: false,
      error: null,
      setQuery: (query) => set({ query }),
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      toggleCategory: (category) =>
        set((state) => ({
          selectedCategories: state.selectedCategories.includes(category)
            ? state.selectedCategories.filter((c) => c !== category)
            : [...state.selectedCategories, category],
        })),
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter((s) => s !== search),
          ].slice(0, 10),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      setSuggestions: (suggestions) => set({ suggestions }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          query: '',
          selectedCategories: [],
          filters: {
            openNow: false,
            priceRange: [],
            sortBy: 'distance',
            radius: 5000,
          },
          error: null,
        }),
    }),
    {
      name: STORAGE_KEYS.recentSearches,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
);

interface PlacesState {
  places: Place[];
  selectedPlace: Place | null;
  clusters: Map<string, Place[]>;
  loading: boolean;
  error: string | null;
  setPlaces: (places: Place[]) => void;
  addPlaces: (places: Place[]) => void;
  setSelectedPlace: (place: Place | null) => void;
  setClusters: (clusters: Map<string, Place[]>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  selectedPlace: null,
  clusters: new Map(),
  loading: false,
  error: null,
  setPlaces: (places) => set({ places, loading: false }),
  addPlaces: (places) =>
    set((state) => ({ places: [...state.places, ...places] })),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setClusters: (clusters) => set({ clusters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clear: () => set({ places: [], selectedPlace: null, clusters: new Map() }),
}));

interface UserState {
  user: User | null;
  preferences: UserPreferences | null;
  authenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setPreferences: (preferences: UserPreferences | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      preferences: null,
      authenticated: false,
      loading: true,
      setUser: (user) => set({ user, authenticated: !!user }),
      setPreferences: (preferences) => set({ preferences }),
      setAuthenticated: (authenticated) => set({ authenticated }),
      setLoading: (loading) => set({ loading }),
      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: state.preferences ? { ...state.preferences, ...preferences } : null,
        })),
      logout: () => set({ user: null, preferences: null, authenticated: false }),
    }),
    {
      name: STORAGE_KEYS.userPreferences,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);

interface SavedState {
  savedPlaces: any[];
  lists: SavedList[];
  activeList: SavedList | null;
  loading: boolean;
  error: string | null;
  setSavedPlaces: (places: any[]) => void;
  addSavedPlace: (place: any) => Promise<void>;
  removeSavedPlace: (placeId: string) => void;
  setLists: (lists: SavedList[]) => void;
  addList: (list: SavedList) => void;
  updateList: (list: SavedList) => void;
  removeList: (listId: string) => void;
  setActiveList: (list: SavedList | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadLists: (userId?: string) => Promise<void>;
  loadSavedPlaces: (userId: string) => Promise<void>;
  createList: (userId: string, name: string, description?: string, isShared?: boolean) => Promise<SavedList>;
  loadListItems: (listId: string) => Promise<SavedListItem[]>;
  addListItem: (listId: string, item: Omit<SavedListItem, 'id' | 'created_at' | 'updated_at'>) => Promise<SavedListItem>;
  removeListItem: (itemId: string, listId?: string) => Promise<void>;
  reorderListItems: (listId: string, newOrder: string[]) => Promise<void>;
  inviteToList: (listId: string, email: string, role: 'editor' | 'viewer') => Promise<void>;
  removeListMember: (listId: string, userId: string) => Promise<void>;
  updateMemberRole: (listId: string, userId: string, role: 'editor' | 'viewer' | 'owner') => Promise<void>;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedPlaces: [],
      lists: [],
      activeList: null,
      loading: false,
      error: null,
      setSavedPlaces: (places: any[]) => set({ savedPlaces: places, loading: false }),
      addSavedPlace: async (place: any) => {
        set((state) => ({ savedPlaces: [place, ...state.savedPlaces], error: null }));
        if (!hasApiConfiguration) return;
        try {
          const response = await api.saved.places.add({
            place_id: place.place_id,
            place_data: place.place_data,
            list_id: place.list_id,
            notes: place.notes,
          });
          const saved = response.data;
          if (saved?.id) {
            set((state) => ({
              savedPlaces: state.savedPlaces.map((entry) => entry.id === place.id ? saved : entry),
            }));
          }
        } catch (error: any) {
          set({ error: error?.message || 'Ort konnte nicht gespeichert werden.' });
        }
      },
      removeSavedPlace: (placeId: string) =>
        set((state) => ({
          savedPlaces: state.savedPlaces.filter((p) => p.id !== placeId),
        })),
      setLists: (lists) => set({ lists, loading: false }),
      addList: (list) =>
        set((state) => ({ lists: [list, ...state.lists] })),
      updateList: (list) =>
        set((state) => ({
          lists: state.lists.map((l) => (l.id === list.id ? list : l)),
          activeList: state.activeList?.id === list.id ? list : state.activeList,
        })),
      removeList: (listId) =>
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== listId),
          activeList: state.activeList?.id === listId ? null : state.activeList,
        })),
      setActiveList: (list) => set({ activeList: list }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      loadLists: async (_userId?: string) => {
        if (!hasApiConfiguration) return;
        set({ loading: true, error: null });
        try {
          const response = await api.saved.lists.list();
          const data = response.data as { results?: SavedList[] } | SavedList[];
          set({ lists: Array.isArray(data) ? data : data.results || [], loading: false });
        } catch (error: any) {
          set({ loading: false, error: error?.message || 'Listen konnten nicht geladen werden.' });
        }
      },
      loadSavedPlaces: async (_userId: string) => {
        if (!hasApiConfiguration) return;
        set({ loading: true, error: null });
        try {
          const response = await api.saved.places.list();
          const data = response.data as { results?: any[] } | any[];
          set({ savedPlaces: Array.isArray(data) ? data : data.results || [], loading: false });
        } catch (error: any) {
          set({ loading: false, error: error?.message || 'Gespeicherte Orte konnten nicht geladen werden.' });
        }
      },
      createList: async (userId: string, name: string, description?: string, isShared?: boolean) => {
        if (hasApiConfiguration) {
          try {
            const response = await api.saved.lists.create({ name, description, is_shared: isShared });
            const data = response.data as SavedList;
            get().addList(data);
            return data;
          } catch (error: any) {
            set({ error: error?.message || 'Liste konnte nicht gespeichert werden.' });
          }
        }
        const list: SavedList = {
          id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_id: userId,
          name,
          description,
          is_shared: isShared || false,
          is_default: false,
          member_count: 1,
          place_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        get().addList(list);
        return list;
      },
      loadListItems: async (listId: string) => {
        if (hasApiConfiguration) {
          try {
            const response = await api.saved.lists.items(listId);
            const data = response.data as { results?: SavedListItem[] } | SavedListItem[];
            return Array.isArray(data) ? data : data.results || [];
          } catch (error: any) {
            set({ error: error?.message || 'Listeneinträge konnten nicht geladen werden.' });
          }
        }
        return get().savedPlaces
          .filter((place: any) => place.list_id === listId)
          .map((place: any, index: number) => ({
            id: place.id,
            list_id: listId,
            place_id: place.place_id,
            place_data: place.place_data,
            added_by: place.user_id,
            notes: place.notes,
            position: index,
            created_at: place.created_at,
            updated_at: place.updated_at,
          }));
      },
      addListItem: async (listId: string, item: Omit<SavedListItem, 'id' | 'created_at' | 'updated_at'>) => {
        if (hasApiConfiguration) {
          try {
            const response = await api.saved.lists.addItem(listId, {
              place_id: item.place_id,
              place_data: item.place_data,
              notes: item.notes,
              position: item.position,
            });
            const data = response.data as SavedListItem;
            set((state) => ({ savedPlaces: [data, ...state.savedPlaces] }));
            return data;
          } catch (error: any) {
            set({ error: error?.message || 'Ort konnte nicht in der Liste gespeichert werden.' });
          }
        }
        const savedItem = {
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          list_id: listId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ savedPlaces: [savedItem, ...state.savedPlaces] }));
        return savedItem;
      },
      removeListItem: async (itemId: string, listId?: string) => {
        set((state) => ({ savedPlaces: state.savedPlaces.filter((p: any) => p.id !== itemId) }));
        if (hasApiConfiguration && listId) {
          try {
            await api.saved.lists.removeItem(listId, itemId);
          } catch (error: any) {
            set({ error: error?.message || 'Ort konnte nicht aus der Liste entfernt werden.' });
          }
        }
      },
      reorderListItems: async (_listId: string, _newOrder: string[]) => {},
      inviteToList: async (_listId: string, _email: string, _role: 'editor' | 'viewer') => {},
      removeListMember: async (_listId: string, _userId: string) => {},
      updateMemberRole: async (_listId: string, _userId: string, _role: 'editor' | 'viewer' | 'owner') => {},
    }),
    {
      name: STORAGE_KEYS.savedLists,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ lists: state.lists, savedPlaces: state.savedPlaces }),
    }
  )
);

interface AIState {
  conversations: TripPlan[];
  currentConversation: TripPlan | null;
  messages: any[];
  loading: boolean;
  error: string | null;
  streaming: boolean;
  setConversations: (conversations: TripPlan[]) => void;
  setCurrentConversation: (conversation: TripPlan | null) => void;
  setMessages: (messages: any[]) => void;
  addMessage: (message: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  clear: () => void;
  askOria: (
    query: string,
    userLocation: Coordinates,
    nearbyPlaces: Place[],
    conversationHistory?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ) => Promise<{ response: string; placeCards: any[] } | null>;
  streamAskOria: (
    query: string,
    userLocation: Coordinates,
    nearbyPlaces: Place[],
    conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    onChunk: (chunk: string) => void
  ) => Promise<string | null>;
  planTrip: (
    location: Coordinates,
    durationHours: number,
    interests: string[],
    budget: 'low' | 'medium' | 'high',
    peopleCount: number,
    transportMode: 'walking' | 'cycling' | 'driving' | 'transit',
    nearbyPlaces: Place[]
  ) => Promise<TripPlan | null>;
  planFromList: (
    listPlaces: Place[],
    transportMode?: 'walking' | 'cycling' | 'driving' | 'transit'
  ) => Promise<TripPlan | null>;
}

export const useAIStore = create<AIState>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  streaming: false,
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setStreaming: (streaming) => set({ streaming }),
  clear: () => set({ messages: [], currentConversation: null, streaming: false }),
  askOria: async () => null,
  streamAskOria: async () => null,
  planTrip: async () => null,
  planFromList: async () => null,
}));

interface TripState {
  trips: TripPlan[];
  currentTrip: TripPlan | null;
  route: any | null;
  calculating: boolean;
  loading: boolean;
  error: string | null;
  setTrips: (trips: TripPlan[]) => void;
  addTrip: (trip: TripPlan) => void;
  updateTrip: (trip: TripPlan) => void;
  removeTrip: (tripId: string) => void;
  setCurrentTrip: (trip: TripPlan | null) => void;
  setRoute: (route: any | null) => void;
  setCalculating: (calculating: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  currentTrip: null,
  route: null,
  calculating: false,
  loading: false,
  error: null,
  setTrips: (trips) => set({ trips }),
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  updateTrip: (trip) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === trip.id ? trip : t)),
      currentTrip: state.currentTrip?.id === trip.id ? trip : state.currentTrip,
    })),
  removeTrip: (tripId) =>
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== tripId),
      currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
    })),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setRoute: (route) => set({ route, calculating: false }),
  setCalculating: (calculating) => set({ calculating }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));

interface UIState {
  theme: 'light' | 'dark' | 'system';
  onboardingComplete: boolean;
  onboardingStep: number;
  bottomSheetVisible: boolean;
  bottomSheetHeight: number;
  modalVisible: boolean;
  modalContent: React.ReactNode | null;
  tabBarVisible: boolean;
  headerVisible: boolean;
  setTheme: (theme: UIState['theme']) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setBottomSheetVisible: (visible: boolean) => void;
  setBottomSheetHeight: (height: number) => void;
  showModal: (content: React.ReactNode) => void;
  hideModal: () => void;
  setTabBarVisible: (visible: boolean) => void;
  setHeaderVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      onboardingComplete: false,
      onboardingStep: 0,
      bottomSheetVisible: false,
      bottomSheetHeight: 0,
      modalVisible: false,
      modalContent: null,
      tabBarVisible: true,
      headerVisible: true,
      setTheme: (theme) => set({ theme }),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setBottomSheetVisible: (visible) => set({ bottomSheetVisible: visible }),
      setBottomSheetHeight: (height) => set({ bottomSheetHeight: height }),
      showModal: (content) => set({ modalVisible: true, modalContent: content }),
      hideModal: () => set({ modalVisible: false, modalContent: null }),
      setTabBarVisible: (visible) => set({ tabBarVisible: visible }),
      setHeaderVisible: (visible) => set({ headerVisible: visible }),
    }),
    {
      name: STORAGE_KEYS.theme,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme, onboardingComplete: state.onboardingComplete }),
    }
  )
);
