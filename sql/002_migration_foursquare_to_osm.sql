-- Migration: Replace Foursquare place_data with OpenStreetMap format
-- Run this if you have existing data with Foursquare format

-- Update saved_places place_data to OSM format
UPDATE saved_places
SET place_data = jsonb_build_object(
  'id', 'osm_' || (place_data->>'id'),
  'name', place_data->>'name',
  'categories', COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'id', 'osm_' || c->>'id',
        'name', c->>'name',
        'icon', COALESCE(c->>'icon', '📍')
      )
    ) FROM jsonb_array_elements(place_data->'categories') c),
    '[{"id": "osm_place", "name": "Place", "icon": "📍"}]'
  ),
  'location', jsonb_build_object(
    'latitude', (place_data->'location'->>'latitude')::NUMERIC,
    'longitude', (place_data->'location'->>'longitude')::NUMERIC,
    'address', place_data->'location'->>'address',
    'locality', place_data->'location'->>'locality',
    'region', place_data->'location'->>'region',
    'postcode', place_data->'location'->>'postcode',
    'country', place_data->'location'->>'country',
    'formatted_address', place_data->'location'->>'formatted_address'
  ),
  'distance', place_data->>'distance',
  'rating', place_data->>'rating',
  'hours', place_data->'hours',
  'website', place_data->>'website',
  'phone', place_data->>'phone',
  'photos', COALESCE(place_data->'photos', '[]'),
  'description', place_data->>'description'
)
WHERE place_data->>'id' NOT LIKE 'osm_%';

-- Update saved_list_items place_data to OSM format
UPDATE saved_list_items
SET place_data = jsonb_build_object(
  'id', 'osm_' || (place_data->>'id'),
  'name', place_data->>'name',
  'categories', COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'id', 'osm_' || c->>'id',
        'name', c->>'name',
        'icon', COALESCE(c->>'icon', '📍')
      )
    ) FROM jsonb_array_elements(place_data->'categories') c),
    '[{"id": "osm_place", "name": "Place", "icon": "📍"}]'
  ),
  'location', jsonb_build_object(
    'latitude', (place_data->'location'->>'latitude')::NUMERIC,
    'longitude', (place_data->'location'->>'longitude')::NUMERIC,
    'address', place_data->'location'->>'address',
    'locality', place_data->'location'->>'locality',
    'region', place_data->'location'->>'region',
    'postcode', place_data->'location'->>'postcode',
    'country', place_data->'location'->>'country',
    'formatted_address', place_data->'location'->>'formatted_address'
  ),
  'distance', place_data->>'distance',
  'rating', place_data->>'rating',
  'hours', place_data->'hours',
  'website', place_data->>'website',
  'phone', place_data->>'phone',
  'photos', COALESCE(place_data->'photos', '[]'),
  'description', place_data->>'description'
)
WHERE place_data->>'id' NOT LIKE 'osm_%';

-- Update trip_stops place_data to OSM format
UPDATE trip_stops
SET place_data = jsonb_build_object(
  'id', 'osm_' || (place_data->>'id'),
  'name', place_data->>'name',
  'categories', COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'id', 'osm_' || c->>'id',
        'name', c->>'name',
        'icon', COALESCE(c->>'icon', '📍')
      )
    ) FROM jsonb_array_elements(place_data->'categories') c),
    '[{"id": "osm_place", "name": "Place", "icon": "📍"}]'
  ),
  'location', jsonb_build_object(
    'latitude', (place_data->'location'->>'latitude')::NUMERIC,
    'longitude', (place_data->'location'->>'longitude')::NUMERIC,
    'address', place_data->'location'->>'address',
    'locality', place_data->'location'->>'locality',
    'region', place_data->'location'->>'region',
    'postcode', place_data->'location'->>'postcode',
    'country', place_data->'location'->>'country',
    'formatted_address', place_data->'location'->>'formatted_address'
  ),
  'distance', place_data->>'distance',
  'rating', place_data->>'rating',
  'hours', place_data->'hours',
  'website', place_data->>'website',
  'phone', place_data->>'phone',
  'photos', COALESCE(place_data->'photos', '[]'),
  'description', place_data->>'description'
)
WHERE place_data->>'id' NOT LIKE 'osm_%';
