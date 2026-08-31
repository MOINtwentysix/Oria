import { useCallback, useState } from 'react';
import { useAIStore } from '@/store';
import { mistralService } from '@/services/mistral';
import { Place, Coordinates, TripPlan } from '@/types';

export const useAI = () => {
  const { conversations, currentConversation, messages, loading, error, streaming, setConversations, setCurrentConversation, setMessages, addMessage, setLoading, setError, setStreaming, clear } = useAIStore();
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const askOria = useCallback(async (
    query: string,
    userLocation: Coordinates,
    nearbyPlaces: Place[],
    conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
  ) => {
    setLoading(true);
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const { response, placeCards } = await mistralService.askOria(
        query,
        userLocation,
        nearbyPlaces,
        conversationHistory
      );

      if (controller.signal.aborted) return null;

      return { response, placeCards };
    } catch (err: any) {
      if (controller.signal.aborted) return null;
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
      setStreaming(false);
      setAbortController(null);
    }
  }, [setLoading, setError, setStreaming]);

  const streamAskOria = useCallback(async (
    query: string,
    userLocation: Coordinates,
    nearbyPlaces: Place[],
    conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [],
    onChunk: (chunk: string) => void
  ) => {
    setLoading(true);
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
        ...conversationHistory,
        { role: 'user', content: query },
      ];

      const response = await mistralService.streamChat(
        messages,
        nearbyPlaces,
        onChunk,
        { temperature: 0.7 }
      );

      if (controller.signal.aborted) return null;

      return response;
    } catch (err: any) {
      if (controller.signal.aborted) return null;
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
      setStreaming(false);
      setAbortController(null);
    }
  }, [setLoading, setError, setStreaming]);

  const planTrip = useCallback(async (
    location: Coordinates,
    durationHours: number,
    interests: string[],
    budget: 'low' | 'medium' | 'high',
    peopleCount: number,
    transportMode: 'walking' | 'cycling' | 'driving' | 'transit',
    nearbyPlaces: Place[]
  ): Promise<TripPlan | null> => {
    setLoading(true);
    setError(null);

    try {
      const trip = await mistralService.planTrip(
        location,
        durationHours,
        interests,
        budget,
        peopleCount,
        transportMode,
        nearbyPlaces
      );
      return trip;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const planFromList = useCallback(async (
    listPlaces: Place[],
    transportMode: 'walking' | 'cycling' | 'driving' | 'transit' = 'driving'
  ): Promise<TripPlan | null> => {
    setLoading(true);
    setError(null);

    try {
      const trip = await mistralService.planFromList(listPlaces, transportMode);
      return trip;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    streaming,
    askOria,
    streamAskOria,
    planTrip,
    planFromList,
    cancel,
    clear,
    setConversations,
    setCurrentConversation,
    setMessages,
    addMessage,
  };
};