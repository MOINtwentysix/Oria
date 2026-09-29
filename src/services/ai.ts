import { Place } from '@/core/types';

const key = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';
const model = process.env.EXPO_PUBLIC_MISTRAL_MODEL || 'mistral-small-latest';

export async function askOria(question: string, places: Place[]): Promise<string> {
  const context = places.slice(0, 12).map((place) => `${place.name} (${place.category}, ${place.distance || 0} m)`).join(', ');
  if (!key) return context ? `In deiner Nähe passen besonders ${places.slice(0, 3).map((place) => place.name).join(', ')}. ${question ? 'Sag mir gern, worauf du heute Lust hast.' : ''}` : 'Aktiviere zuerst deinen Standort, dann suche ich passende Orte für dich.';
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, temperature: 0.6, max_tokens: 300, messages: [{ role: 'system', content: `Du bist Oria, ein präziser deutscher Stadtführer. Nutze nur diese Orte: ${context}` }, { role: 'user', content: question }] }) });
  if (!response.ok) throw new Error('Oria AI ist gerade nicht erreichbar.');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Dazu konnte ich gerade keine Empfehlung erstellen.';
}
