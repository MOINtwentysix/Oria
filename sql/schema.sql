CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id text NOT NULL,
  place_data jsonb NOT NULL,
  list_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, place_id, list_id)
);

CREATE INDEX IF NOT EXISTS saved_places_user_id_idx ON saved_places(user_id);
