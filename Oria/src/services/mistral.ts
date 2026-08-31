import { Place, Coordinates, TripPlan, TripStop, Route, RouteWaypoint } from '@/types';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1';

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralChatRequest {
  model: string;
  messages: MistralMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface MistralChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: MistralMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface PlaceContext {
  id: string;
  name: string;
  category: string;
  rating?: number;
  distance?: number;
  address?: string;
  description?: string;
}

class MistralService {
  private async request<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${MISTRAL_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Mistral API error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  private buildSystemPrompt(places: PlaceContext[]): string {
    const placesContext = places.map((p, i) => 
      `${i + 1}. ${p.name} (${p.category})${p.rating ? ` - ⭐ ${p.rating}` : ''}${p.distance ? ` - ${Math.round(p.distance)}m away` : ''}${p.address ? ` - ${p.address}` : ''}${p.description ? ` - ${p.description}` : ''}`
    ).join('\n');

    return `You are Oria, an intelligent location discovery assistant. You help users find and plan visits to real places.

AVAILABLE PLACES (real places from Foursquare):
${placesContext}

RULES:
- ONLY recommend places from the provided list above
- NEVER invent or hallucinate places
- If a user asks for something not in the list, explain what you CAN help with
- Be concise, helpful, and conversational
- When suggesting places, include the number from the list for reference
- You can suggest multiple places for different needs
- Consider distance, rating, and category relevance`;
  }

  async chat(
    messages: MistralMessage[],
    places: Place[] = [],
    options: { temperature?: number; maxTokens?: number; stream?: boolean } = {}
  ): Promise<string> {
    const placeContexts: PlaceContext[] = places.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.categories[0]?.name || 'Place',
      rating: p.rating,
      distance: p.distance,
      address: p.location.formatted_address,
      description: p.description,
    }));

    const systemPrompt = this.buildSystemPrompt(placeContexts);

    const fullMessages: MistralMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const request: MistralChatRequest = {
      model: 'mistral-large-latest',
      messages: fullMessages,
      temperature: options.temperature ?? 0.7,
      top_p: 0.9,
      max_tokens: options.maxTokens ?? 2048,
      stream: options.stream ?? false,
    };

    const response = await this.request<MistralChatResponse>('/chat/completions', request);
    return response.choices[0]?.message?.content || '';
  }

  async streamChat(
    messages: MistralMessage[],
    places: Place[] = [],
    onChunk: (chunk: string) => void,
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    const placeContexts: PlaceContext[] = places.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.categories[0]?.name || 'Place',
      rating: p.rating,
      distance: p.distance,
      address: p.location.formatted_address,
      description: p.description,
    }));

    const systemPrompt = this.buildSystemPrompt(placeContexts);

    const fullMessages: MistralMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const request: MistralChatRequest = {
      model: 'mistral-large-latest',
      messages: fullMessages,
      temperature: options.temperature ?? 0.7,
      top_p: 0.9,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
    };

    const response = await fetch(`${MISTRAL_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Mistral API error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (!reader) {
      throw new Error('No response stream');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  async askOria(
    query: string,
    userLocation: Coordinates,
    nearbyPlaces: Place[],
    conversationHistory: MistralMessage[] = []
  ): Promise<{ response: string; placeCards: Array<{ placeId: string; action: string }> }> {
    const messages: MistralMessage[] = [
      ...conversationHistory,
      { role: 'user', content: query },
    ];

    const response = await this.chat(messages, nearbyPlaces);

    const placeCards = this.extractPlaceCards(response, nearbyPlaces);

    return { response, placeCards };
  }

  private extractPlaceCards(response: string, places: Place[]): Array<{ placeId: string; action: string }> {
    const cards: Array<{ placeId: string; action: string }> = [];
    
    for (const place of places) {
      if (response.toLowerCase().includes(place.name.toLowerCase())) {
        cards.push({ placeId: place.id, action: 'show_on_map' });
      }
    }

    return cards.slice(0, 5);
  }

  async planTrip(
    location: Coordinates,
    durationHours: number,
    interests: string[],
    budget: 'low' | 'medium' | 'high',
    peopleCount: number,
    transportMode: 'walking' | 'cycling' | 'driving' | 'transit',
    nearbyPlaces: Place[]
  ): Promise<TripPlan> {
    const interestDescriptions = interests.join(', ');
    
    const prompt = `Create a detailed trip plan for ${durationHours} hours starting at ${location.latitude}, ${location.longitude}.

INTERESTS: ${interestDescriptions}
BUDGET: ${budget}
PEOPLE: ${peopleCount}
TRANSPORT: ${transportMode}

AVAILABLE PLACES (real places from Foursquare):
${nearbyPlaces.slice(0, 20).map((p, i) => 
  `${i + 1}. ${p.name} (${p.categories[0]?.name || 'Place'})${p.rating ? ` - ⭐ ${p.rating}` : ''} - ${Math.round(p.distance || 0)}m away${p.location.formatted_address ? ` - ${p.location.formatted_address}` : ''}`
).join('\n')}

Create a realistic trip plan with 4-6 stops. Return ONLY a JSON object with this structure:
{
  "name": "Trip name",
  "description": "Brief description",
  "stops": [
    {
      "placeIndex": 0,
      "order": 1,
      "startTime": "09:30",
      "endTime": "11:00",
      "durationMinutes": 90,
      "notes": "Why this place fits the trip"
    }
  ]
}

Rules:
- Only use places from the provided list (reference by index)
- Order stops logically by location and time
- Include realistic travel times between stops
- Match places to interests
- Consider opening hours (assume typical hours if unknown)
- Budget: low=cheap/free, medium=moderate, high=premium`;

    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      nearbyPlaces,
      { temperature: 0.5, maxTokens: 2048 }
    );

    try {
      const planData = JSON.parse(response);
      
      const stops: TripStop[] = planData.stops.map((stop: any, index: number) => {
        const place = nearbyPlaces[stop.placeIndex];
        return {
          id: `stop-${index}`,
          trip_id: '',
          place_id: place.id,
          place_data: place,
          order: stop.order,
          start_time: stop.startTime,
          end_time: stop.endTime,
          duration_minutes: stop.durationMinutes,
          notes: stop.notes,
        };
      });

      return {
        id: `trip-${Date.now()}`,
        user_id: '',
        name: planData.name,
        description: planData.description,
        start_location: location,
        duration_hours: durationHours,
        interests,
        budget,
        people_count: peopleCount,
        transport_mode: transportMode,
        stops,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Failed to parse trip plan from AI response');
    }
  }

  async planFromList(
    listPlaces: Place[],
    transportMode: 'walking' | 'cycling' | 'driving' | 'transit' = 'driving'
  ): Promise<TripPlan> {
    const prompt = `Create an optimal visit order for these places. Return ONLY a JSON array of place indices in the best visiting order.

PLACES:
${listPlaces.map((p, i) => `${i}. ${p.name} (${p.location.latitude}, ${p.location.longitude}) - ${p.categories[0]?.name || 'Place'}`).join('\n')}

TRANSPORT: ${transportMode}

Consider:
- Geographic proximity (minimize travel distance)
- Logical flow (e.g., breakfast -> activity -> lunch -> activity -> dinner)
- Opening hours (assume typical hours)
- Category variety

Return format: [0, 2, 1, 3, ...]`;

    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      listPlaces,
      { temperature: 0.3, maxTokens: 1024 }
    );

    try {
      const order = JSON.parse(response);
      
      const stops: TripStop[] = order.map((index: number, i: number) => {
        const place = listPlaces[index];
        return {
          id: `stop-${i}`,
          trip_id: '',
          place_id: place.id,
          place_data: place,
          order: i + 1,
          duration_minutes: this.estimateDuration(place),
        };
      });

      return {
        id: `trip-${Date.now()}`,
        user_id: '',
        name: 'Planned from List',
        description: 'Optimized route from your saved list',
        start_location: { latitude: listPlaces[0]?.location.latitude || 0, longitude: listPlaces[0]?.location.longitude || 0 },
        duration_hours: stops.reduce((sum, s) => sum + s.duration_minutes, 0) / 60,
        interests: [...new Set(listPlaces.flatMap(p => p.categories.map(c => c.name)))],
        budget: 'medium',
        people_count: 1,
        transport_mode: transportMode,
        stops,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Failed to parse list plan from AI response');
    }
  }

  private estimateDuration(place: Place): number {
    const category = place.categories[0]?.name?.toLowerCase() || '';
    if (category.includes('restaurant') || category.includes('cafe')) return 90;
    if (category.includes('museum') || category.includes('gallery')) return 120;
    if (category.includes('park') || category.includes('nature')) return 60;
    if (category.includes('shopping')) return 90;
    if (category.includes('entertainment')) return 120;
    return 60;
  }
}

export const mistralService = new MistralService();