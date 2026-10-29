-- Oria Database Schema (Neon PostgreSQL)

-- 1. Users table (synced with Clerk authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    clerk_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    tier VARCHAR(16) DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
    ai_requests_used INT DEFAULT 0,
    ai_requests_limit INT DEFAULT 50, -- 50 for free, -1 for pro
    lists_limit INT DEFAULT 10,       -- 10 for free, -1 for pro
    quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Lists table
CREATE TABLE IF NOT EXISTS lists (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    share_code VARCHAR(32) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Places saved within lists
CREATE TABLE IF NOT EXISTS list_places (
    id VARCHAR(64) PRIMARY KEY,
    list_id VARCHAR(64) REFERENCES lists(id) ON DELETE CASCADE,
    osm_id BIGINT NOT NULL,
    osm_type VARCHAR(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    sub_category VARCHAR(64),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    city VARCHAR(128),
    phone VARCHAR(64),
    website TEXT,
    opening_hours TEXT,
    wheelchair VARCHAR(32),
    cuisine VARCHAR(128),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Multi-stop planned routes
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    mode VARCHAR(16) DEFAULT 'foot' CHECK (mode IN ('foot', 'bike', 'car')),
    distance_meters INT NOT NULL,
    duration_seconds INT NOT NULL,
    destinations_json JSONB NOT NULL,
    steps_json JSONB,
    geometry_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI Assistant Usage and Grounding Logs
CREATE TABLE IF NOT EXISTS ai_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64),
    prompt TEXT NOT NULL,
    recommended_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Modular Partners and verified locations
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    perk_description TEXT,
    verified_badge BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast location and user lookups
CREATE INDEX IF NOT EXISTS idx_lists_user ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_share ON lists(share_code);
CREATE INDEX IF NOT EXISTS idx_list_places_list ON list_places(list_id);
CREATE INDEX IF NOT EXISTS idx_routes_user ON routes(user_id);
