-- Oria Database Schema
-- PostgreSQL (Neon Serverless)

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  interests TEXT[],
  preferred_radius INTEGER DEFAULT 5000,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  location_sharing BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  units TEXT DEFAULT 'metric',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- USER PREFERENCES
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  interests TEXT[] DEFAULT '{}',
  preferred_radius INTEGER DEFAULT 5000,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  location_sharing BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  units TEXT DEFAULT 'metric',
  map_style TEXT DEFAULT 'standard',
  auto_save_places BOOLEAN DEFAULT FALSE,
  show_distance BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SAVED PLACES
-- =============================================================================
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL,
  list_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id, list_id)
);

-- =============================================================================
-- SAVED LISTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS saved_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  member_count INTEGER DEFAULT 1,
  place_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SAVED LIST MEMBERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS saved_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES saved_lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(list_id, user_id)
);

-- =============================================================================
-- SAVED LIST ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS saved_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES saved_lists(id) ON DELETE CASCADE NOT NULL,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL,
  added_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, place_id)
);

-- =============================================================================
-- AI CONVERSATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  model TEXT DEFAULT 'mistral-large-latest',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- AI MESSAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  place_cards JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRIPS
-- =============================================================================
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_location JSONB NOT NULL,
  end_location JSONB,
  duration_hours DECIMAL(5,2),
  interests TEXT[],
  budget TEXT CHECK (budget IN ('low', 'medium', 'high')),
  people_count INTEGER DEFAULT 1,
  transport_mode TEXT CHECK (transport_mode IN ('walking', 'cycling', 'driving', 'transit')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRIP STOPS
-- =============================================================================
CREATE TABLE IF NOT EXISTS trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  notes TEXT,
  travel_time_from_previous INTEGER,
  travel_distance_from_previous DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROUTES
-- =============================================================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  list_id UUID REFERENCES saved_lists(id) ON DELETE SET NULL,
  coordinates JSONB NOT NULL,
  distance_meters DECIMAL(12,2),
  duration_seconds INTEGER,
  waypoints JSONB NOT NULL,
  geometry TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SHARED LIST INVITES
-- =============================================================================
CREATE TABLE IF NOT EXISTS shared_list_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES saved_lists(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('list_invite', 'list_update', 'place_saved', 'trip_ready', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_list_id ON saved_places(list_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_place_id ON saved_places(place_id);

CREATE INDEX IF NOT EXISTS idx_saved_lists_user_id ON saved_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_lists_share_token ON saved_lists(share_token);

CREATE INDEX IF NOT EXISTS idx_saved_list_members_list_id ON saved_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_saved_list_members_user_id ON saved_list_members(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_list_items_list_id ON saved_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_saved_list_items_place_id ON saved_list_items(place_id);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);

CREATE INDEX IF NOT EXISTS idx_routes_trip_id ON routes(trip_id);
CREATE INDEX IF NOT EXISTS idx_routes_list_id ON routes(list_id);

CREATE INDEX IF NOT EXISTS idx_shared_list_invites_list_id ON shared_list_invites(list_id);
CREATE INDEX IF NOT EXISTS idx_shared_list_invites_token ON shared_list_invites(token);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- =============================================================================
-- GEOFUNC EXTENSION (for PostGIS spatial queries)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to saved_places for spatial queries
ALTER TABLE saved_places ADD COLUMN IF NOT EXISTS geometry GEOMETRY(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_saved_places_geometry ON saved_places USING GIST(geometry);

-- Add geometry column to saved_list_items for spatial queries
ALTER TABLE saved_list_items ADD COLUMN IF NOT EXISTS geometry GEOMETRY(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_saved_list_items_geometry ON saved_list_items USING GIST(geometry);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update place_count on saved_lists
CREATE OR REPLACE FUNCTION update_saved_lists_place_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE saved_lists SET
      place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = NEW.list_id),
      updated_at = NOW()
    WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE saved_lists SET
      place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = OLD.list_id),
      updated_at = NOW()
    WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_saved_lists_place_count
  AFTER INSERT OR DELETE ON saved_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_lists_place_count();

-- Function to update member_count on saved_lists
CREATE OR REPLACE FUNCTION update_saved_lists_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE saved_lists SET
      member_count = (SELECT COUNT(*) FROM saved_list_members WHERE list_id = NEW.list_id),
      updated_at = NOW()
    WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE saved_lists SET
      member_count = (SELECT COUNT(*) FROM saved_list_members WHERE list_id = OLD.list_id),
      updated_at = NOW()
    WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_saved_lists_member_count
  AFTER INSERT OR DELETE ON saved_list_members
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_lists_member_count();

-- Function to auto-set geometry from place_data JSONB
CREATE OR REPLACE FUNCTION set_place_geometry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.place_data ? 'location' AND
     NEW.place_data->'location' ? 'latitude' AND
     NEW.place_data->'location' ? 'longitude' THEN
    NEW.geometry := ST_SetSRID(
      ST_MakePoint(
        (NEW.place_data->'location'->>'longitude')::NUMERIC,
        (NEW.place_data->'location'->>'latitude')::NUMERIC
      ),
      4326
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_set_saved_places_geometry
  BEFORE INSERT OR UPDATE ON saved_places
  FOR EACH ROW
  EXECUTE FUNCTION set_place_geometry();

CREATE OR REPLACE TRIGGER trigger_set_saved_list_items_geometry
  BEFORE INSERT OR UPDATE ON saved_list_items
  FOR EACH ROW
  EXECUTE FUNCTION set_place_geometry();
