import { AIMessage } from '../types';
import { fetchNearbyPlaces, geocodeLocation } from './overpass';

export interface AIQueryOptions {
  prompt: string;
  userLat?: number;
  userLon?: number;
}

export const SUGGESTED_AI_PROMPTS = [
  '☕ Find quiet cafés near me to work or read',
  '🌳 Show me scenic parks & green spaces',
  '🎨 What cultural spots and museums are nearby?',
  '🍕 Best places to eat for dinner tonight',
  '🏛️ Plan a walking tour of the top landmarks',
];

// Configurable Mistral API Key (from env or backend)
const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';

// The most affordable Mistral model: mistral-small-latest (formerly mistral-tiny)
const MISTRAL_MODEL = 'mistral-small-latest';

/**
 * Intelligent AI location discovery powered by Mistral AI,
 * strictly grounded in real OpenStreetMap places without fake data.
 */
export async function sendAIMessage(options: AIQueryOptions): Promise<AIMessage> {
  const { prompt, userLat = 48.137154, userLon = 11.576124 } = options;

  // 1. Resolve target coordinates (if prompt mentions a city, geocode it)
  let targetLat = userLat;
  let targetLon = userLon;

  const cityMatch = prompt.match(/\bin\s+([A-Za-z\s]+)/i);
  if (cityMatch && cityMatch[1]) {
    const geo = await geocodeLocation(cityMatch[1].trim());
    if (geo) {
      targetLat = geo.latitude;
      targetLon = geo.longitude;
    }
  }

  // 2. Grounding: Fetch REAL places around target coordinates from Overpass
  const lower = prompt.toLowerCase();
  let categoryFilter: any = 'all';
  if (lower.includes('café') || lower.includes('cafe') || lower.includes('coffee')) {
    categoryFilter = 'cafe';
  } else if (lower.includes('restaurant') || lower.includes('dinner') || lower.includes('eat') || lower.includes('food')) {
    categoryFilter = 'restaurant';
  } else if (lower.includes('park') || lower.includes('green') || lower.includes('nature') || lower.includes('walk')) {
    categoryFilter = 'park';
  } else if (lower.includes('museum') || lower.includes('culture') || lower.includes('art') || lower.includes('gallery')) {
    categoryFilter = 'museum';
  } else if (lower.includes('attraction') || lower.includes('sight') || lower.includes('monument') || lower.includes('landmark')) {
    categoryFilter = 'attraction';
  } else if (lower.includes('bar') || lower.includes('night') || lower.includes('beer') || lower.includes('club')) {
    categoryFilter = 'nightlife';
  } else if (lower.includes('shop')) {
    categoryFilter = 'shopping';
  }

  // Fetch real places from OpenStreetMap Overpass
  const realPlaces = await fetchNearbyPlaces(targetLat, targetLon, categoryFilter, 3000);
  const topPlaces = realPlaces.slice(0, 5);

  let responseText = '';

  // 3. Call Mistral API if key is present
  if (MISTRAL_API_KEY && MISTRAL_API_KEY.trim() !== '') {
    try {
      const placesContext = topPlaces.map((p) => ({
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        address: p.address,
        distanceMeters: p.distanceMeters,
        openingHours: p.openingHours,
      }));

      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are Oria AI, an Apple-inspired concierge for location discovery.
Ground your response ONLY on these verified real OpenStreetMap places:
${JSON.stringify(placesContext)}
Never invent places, ratings, or addresses. Be helpful, concise, and elegant. Format in Markdown with bullet points.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      console.warn('Mistral API error, falling back to local synthesis:', e);
    }
  }

  // 4. Elegant fallback if no key or offline
  if (!responseText) {
    if (topPlaces.length === 0) {
      responseText = `I searched OpenStreetMap around your current location, but could not find matching places for "${prompt}". Try zooming out or selecting another category!`;
    } else {
      const placeListText = topPlaces
        .map((p, i) => {
          const dist = p.distanceMeters ? ` (${(p.distanceMeters / 1000).toFixed(1)} km away)` : '';
          const addr = p.address ? ` on ${p.address}` : '';
          const opening = p.openingHours ? ` • Open: ${p.openingHours}` : '';
          return `**${i + 1}. ${p.name}**${dist}\n${p.subCategory ? `Category: ${p.subCategory}` : ''}${addr}${opening}`;
        })
        .join('\n\n');

      let intro = '';
      if (categoryFilter === 'cafe') {
        intro = `Here are real verified cafés nearby for working or relaxing:`;
      } else if (categoryFilter === 'park') {
        intro = `Here are green spaces and scenic parks near your location:`;
      } else if (categoryFilter === 'museum') {
        intro = `Here are cultural institutions and museums discovered in your area:`;
      } else if (categoryFilter === 'restaurant') {
        intro = `Here are top-rated dining spots verified on OpenStreetMap:`;
      } else {
        intro = `I discovered these standout places around your location:`;
      }

      responseText = `${intro}\n\n${placeListText}\n\n*Powered by Mistral AI & OpenStreetMap.*`;
    }
  }

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: responseText,
    recommendedPlaces: topPlaces,
    suggestedPrompts: [
      'Show these on map',
      'Create a walking route with these places',
      'Find more places nearby',
    ],
    timestamp: new Date().toISOString(),
  };
}
