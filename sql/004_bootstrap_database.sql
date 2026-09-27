-- Oria database bootstrap for PostgreSQL / Neon
-- Safe to run repeatedly. It only creates missing objects.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  preferred_radius INTEGER NOT NULL DEFAULT 5000,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  location_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  theme TEXT NOT NULL DEFAULT 'system',
  language TEXT NOT NULL DEFAULT 'en',
  units TEXT NOT NULL DEFAULT 'metric',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interests TEXT[] NOT NULL DEFAULT '{}',
  preferred_radius INTEGER NOT NULL DEFAULT 5000,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  location_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  theme TEXT NOT NULL DEFAULT 'system',
  language TEXT NOT NULL DEFAULT 'en',
  units TEXT NOT NULL DEFAULT 'metric',
  map_style TEXT NOT NULL DEFAULT 'standard',
  auto_save_places BOOLEAN NOT NULL DEFAULT FALSE,
  show_distance BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  share_token TEXT UNIQUE,
  member_count INTEGER NOT NULL DEFAULT 1,
  place_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL,
  list_id UUID REFERENCES saved_lists(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, place_id, list_id)
);

CREATE TABLE IF NOT EXISTS saved_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES saved_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (list_id, user_id)
);

CREATE TABLE IF NOT EXISTS saved_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES saved_lists(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (list_id, place_id)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  model TEXT NOT NULL DEFAULT 'mistral-small-2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  place_cards JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_location JSONB NOT NULL,
  end_location JSONB,
  duration_hours NUMERIC(5,2),
  interests TEXT[],
  budget TEXT CHECK (budget IN ('low', 'medium', 'high')),
  people_count INTEGER NOT NULL DEFAULT 1,
  transport_mode TEXT CHECK (transport_mode IN ('walking', 'cycling', 'driving', 'transit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  notes TEXT,
  travel_time_from_previous INTEGER,
  travel_distance_from_previous NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  list_id UUID REFERENCES saved_lists(id) ON DELETE SET NULL,
  coordinates JSONB NOT NULL,
  distance_meters NUMERIC(12,2),
  duration_seconds INTEGER,
  waypoints JSONB NOT NULL,
  geometry TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared_list_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES saved_lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('list_invite', 'list_update', 'place_saved', 'trip_ready', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_routes_trip_id ON routes(trip_id);
CREATE INDEX IF NOT EXISTS idx_routes_list_id ON routes(list_id);
CREATE INDEX IF NOT EXISTS idx_shared_list_invites_list_id ON shared_list_invites(list_id);
CREATE INDEX IF NOT EXISTS idx_shared_list_invites_token ON shared_list_invites(token);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

CREATE OR REPLACE FUNCTION oria_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['users', 'profiles', 'user_preferences', 'saved_lists', 'saved_places', 'saved_list_items', 'ai_conversations', 'trips', 'trip_stops'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 'trg_' || table_name || '_updated_at', table_name);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION oria_touch_updated_at()', 'trg_' || table_name || '_updated_at', table_name);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION oria_refresh_list_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  affected_list UUID;
BEGIN
  affected_list = COALESCE(NEW.list_id, OLD.list_id);
  UPDATE saved_lists
  SET place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = affected_list),
      member_count = (SELECT COUNT(*) FROM saved_list_members WHERE list_id = affected_list),
      updated_at = NOW()
  WHERE id = affected_list;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_saved_list_items_refresh_counts ON saved_list_items;
CREATE TRIGGER trg_saved_list_items_refresh_counts
AFTER INSERT OR UPDATE OR DELETE ON saved_list_items
FOR EACH ROW EXECUTE FUNCTION oria_refresh_list_counts();

DROP TRIGGER IF EXISTS trg_saved_list_members_refresh_counts ON saved_list_members;
CREATE TRIGGER trg_saved_list_members_refresh_counts
AFTER INSERT OR UPDATE OR DELETE ON saved_list_members
FOR EACH ROW EXECUTE FUNCTION oria_refresh_list_counts();

-- Compatibility additions for databases created by an older version.
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE saved_places ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES saved_lists(id) ON DELETE SET NULL;

ANALYZE users;
ANALYZE saved_lists;
ANALYZE saved_places;

