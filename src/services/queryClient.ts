import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const queryKeys = {
  places: {
    all: ['places'] as const,
    search: (params: any) => ['places', 'search', params] as const,
    nearby: (lat: number, lng: number, radius: number) => ['places', 'nearby', lat, lng, radius] as const,
    details: (placeId: string) => ['places', 'details', placeId] as const,
    photos: (placeId: string) => ['places', 'photos', placeId] as const,
    categories: () => ['places', 'categories'] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => ['user', 'profile'] as const,
    preferences: () => ['user', 'preferences'] as const,
    savedPlaces: () => ['user', 'savedPlaces'] as const,
    lists: () => ['user', 'lists'] as const,
    list: (listId: string) => ['user', 'lists', listId] as const,
    listItems: (listId: string) => ['user', 'lists', listId, 'items'] as const,
    trips: () => ['user', 'trips'] as const,
    trip: (tripId: string) => ['user', 'trips', tripId] as const,
  },
  ai: {
    all: ['ai'] as const,
    conversations: () => ['ai', 'conversations'] as const,
    conversation: (id: string) => ['ai', 'conversations', id] as const,
    messages: (conversationId: string) => ['ai', 'conversations', conversationId, 'messages'] as const,
  },
  routing: {
    all: ['routing'] as const,
    route: (waypoints: any[]) => ['routing', 'route', waypoints] as const,
    table: (locations: any[]) => ['routing', 'table', locations] as const,
  },
};