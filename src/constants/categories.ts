import { CategoryColors } from './theme';
import { CategoryType, PlaceCategoryInfo } from '../types';

export const CATEGORIES: PlaceCategoryInfo[] = [
  {
    id: 'all',
    label: 'All Places',
    iconName: 'Compass',
    color: '#007AFF',
    overpassTags: [],
  },
  {
    id: 'cafe',
    label: 'Cafés',
    iconName: 'Coffee',
    color: CategoryColors.cafe,
    overpassTags: ['amenity=cafe'],
  },
  {
    id: 'restaurant',
    label: 'Restaurants',
    iconName: 'UtensilsCrossed',
    color: CategoryColors.restaurant,
    overpassTags: ['amenity=restaurant', 'amenity=food_court'],
  },
  {
    id: 'park',
    label: 'Parks & Nature',
    iconName: 'Trees',
    color: CategoryColors.park,
    overpassTags: ['leisure=park', 'leisure=garden'],
  },
  {
    id: 'attraction',
    label: 'Attractions',
    iconName: 'Landmark',
    color: CategoryColors.attraction,
    overpassTags: ['tourism=attraction', 'historic=monument', 'tourism=viewpoint'],
  },
  {
    id: 'museum',
    label: 'Culture & Museums',
    iconName: 'Building2',
    color: CategoryColors.museum,
    overpassTags: ['tourism=museum', 'tourism=gallery', 'amenity=theatre'],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    iconName: 'ShoppingBag',
    color: CategoryColors.shopping,
    overpassTags: ['shop=clothes', 'shop=mall', 'shop=department_store', 'shop=books'],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    iconName: 'Film',
    color: CategoryColors.entertainment,
    overpassTags: ['amenity=cinema', 'leisure=bowling_alley'],
  },
  {
    id: 'nightlife',
    label: 'Nightlife',
    iconName: 'Wine',
    color: CategoryColors.nightlife,
    overpassTags: ['amenity=bar', 'amenity=pub', 'amenity=nightclub'],
  },
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<CategoryType, PlaceCategoryInfo>);

/**
 * Curated high-quality legal stock photography map for OSM categories
 * to ensure stunning visual presentation while adhering to OpenStreetMap guidelines.
 */
export const CATEGORY_DEFAULT_IMAGES: Record<CategoryType, string[]> = {
  all: [
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop',
  ],
  park: [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
  ],
  attraction: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop',
  ],
  museum: [
    'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=800&auto=format&fit=crop',
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
  ],
  nightlife: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=800&auto=format&fit=crop',
  ],
};
