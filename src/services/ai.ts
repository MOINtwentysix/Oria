import { AIMessage } from '../types';
import { fetchNearbyPlaces, geocodeLocation } from './overpass';
import { incrementAIRequestCount } from './storage';

export interface AIQueryOptions {
  prompt: string;
  userLat?: number;
  userLon?: number;
  cityName?: string;
}

export const SUGGESTED_AI_PROMPTS = [
  '☕ Find quiet cafés near me to work or read',
  '🌳 Show me scenic parks & green spaces',
  '🎨 What cultural spots and museums are nearby?',
  '🍕 Best places to eat for dinner tonight',
  '🏛️ Plan a walking tour of the top landmarks',
];

/**
 * Intelligent AI assistant coordinator grounded strictly in real OpenStreetMap places
 */
export async function sendAIMessage(options: AIQueryOptions): Promise<AIMessage> {
  const { prompt, userLat = 48.137154, userLon = 11.576124 } = options;

  // 1. Check and track quota
  const quotaCheck = await incrementAIRequestCount();
  if (!quotaCheck.allowed) {
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content:
        'You have reached your free monthly limit of 50 AI discovery requests. Upgrade to **Oria Pro** to enjoy unlimited intelligent recommendations and deeper route curation!',
      suggestedPrompts: ['Upgrade to Oria Pro', 'Explore map manually'],
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Resolve target coordinates (if prompt mentions a city, geocode it)
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

  // 3. Grounding: Fetch REAL places around target coordinates from Overpass
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

  // Take top 3 to 6 verified real places
  const topPlaces = realPlaces.slice(0, 5);

  let responseText = '';
  if (topPlaces.length === 0) {
    responseText = `I searched OpenStreetMap around your current location, but could not find matching places for "${prompt}". Try zooming out, searching for a nearby major city, or choosing another category!`;
  } else {
    // Generate grounded, contextual, Apple-style narrative
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
      intro = `Here are real verified cafés nearby with great atmosphere for working or relaxing:`;
    } else if (categoryFilter === 'park') {
      intro = `Here are green spaces and scenic parks near your location:`;
    } else if (categoryFilter === 'museum') {
      intro = `Here are cultural institutions and museums discovered in your area:`;
    } else if (categoryFilter === 'restaurant') {
      intro = `Here are top-rated dining spots verified on OpenStreetMap:`;
    } else {
      intro = `I discovered these standout places around your location:`;
    }

    responseText = `${intro}\n\n${placeListText}\n\n*Tap any place below to see full details, add it to your saved lists, or get directions.*`;
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
