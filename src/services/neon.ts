import { neon, Pool } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.warn('DATABASE_URL not set. Database features will not work.');
}

export const sql = neon(DATABASE_URL);

export const pool = new Pool({ connectionString: DATABASE_URL });

export const initializeDatabase = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        username TEXT UNIQUE,
        firstName TEXT,
        lastName TEXT,
        imageUrl TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
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
      )
    `;

    await sql`
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
      )
    `;

    await sql`
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
      )
    `;

    await sql`
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
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS saved_list_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        list_id UUID REFERENCES saved_lists(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE(list_id, user_id)
      )
    `;

    await sql`
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
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title TEXT,
        model TEXT DEFAULT 'mistral-large-latest',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        place_cards JSONB,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
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
      )
    `;

    await sql`
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
      )
    `;

    await sql`
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
      )
    `;

    await sql`
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
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('list_invite', 'list_update', 'place_saved', 'trip_ready', 'system')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
      CREATE INDEX IF NOT EXISTS idx_saved_places_list_id ON saved_places(list_id);
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
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const db = {
  users: {
    create: async (data: { account_id: string; email: string; username?: string; firstName?: string; lastName?: string; imageUrl?: string }) => {
      const result = await sql`
        INSERT INTO users (account_id, email, username, firstName, lastName, imageUrl)
        VALUES (${data.account_id}, ${data.email}, ${data.username}, ${data.firstName}, ${data.lastName}, ${data.imageUrl})
        ON CONFLICT (account_id) DO UPDATE SET
          email = EXCLUDED.email,
          username = EXCLUDED.username,
          firstName = EXCLUDED.firstName,
          lastName = EXCLUDED.lastName,
          imageUrl = EXCLUDED.imageUrl,
          updated_at = NOW()
        RETURNING *
      `;
      return result[0];
    },
    findByAccountId: async (accountId: string) => {
      const result = await sql`SELECT * FROM users WHERE account_id = ${accountId}`;
      return result[0];
    },
    findById: async (id: string) => {
      const result = await sql`SELECT * FROM users WHERE id = ${id}`;
      return result[0];
    },
    update: async (id: string, data: Partial<{ email: string; username: string; firstName: string; lastName: string; imageUrl: string }>) => {
      const result = await sql`
        UPDATE users SET
          email = COALESCE(${data.email}, email),
          username = COALESCE(${data.username}, username),
          firstName = COALESCE(${data.firstName}, firstName),
          lastName = COALESCE(${data.lastName}, lastName),
          imageUrl = COALESCE(${data.imageUrl}, imageUrl),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    },
  },

  profiles: {
    create: async (userId: string) => {
      const result = await sql`
        INSERT INTO profiles (user_id) VALUES (${userId}) RETURNING *
      `;
      return result[0];
    },
    findByUserId: async (userId: string) => {
      const result = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
      return result[0];
    },
    update: async (userId: string, data: any) => {
      const result = await sql`
        UPDATE profiles SET
          bio = COALESCE(${data.bio}, bio),
          interests = COALESCE(${data.interests}, interests),
          preferred_radius = COALESCE(${data.preferred_radius}, preferred_radius),
          notifications_enabled = COALESCE(${data.notifications_enabled}, notifications_enabled),
          location_sharing = COALESCE(${data.location_sharing}, location_sharing),
          theme = COALESCE(${data.theme}, theme),
          language = COALESCE(${data.language}, language),
          units = COALESCE(${data.units}, units),
          updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING *
      `;
      return result[0];
    },
  },

  userPreferences: {
    findByUserId: async (userId: string) => {
      const result = await sql`SELECT * FROM user_preferences WHERE user_id = ${userId}`;
      return result[0];
    },
    upsert: async (userId: string, data: any) => {
      const result = await sql`
        INSERT INTO user_preferences (user_id, interests, preferred_radius, notifications_enabled, location_sharing, theme, language, units, map_style, auto_save_places, show_distance)
        VALUES (${userId}, ${data.interests || []}, ${data.preferredRadius || 5000}, ${data.notificationsEnabled ?? true}, ${data.locationSharing ?? false}, ${data.theme || 'system'}, ${data.language || 'en'}, ${data.units || 'metric'}, ${data.mapStyle || 'standard'}, ${data.autoSavePlaces ?? false}, ${data.showDistance ?? true})
        ON CONFLICT (user_id) DO UPDATE SET
          interests = EXCLUDED.interests,
          preferred_radius = EXCLUDED.preferred_radius,
          notifications_enabled = EXCLUDED.notifications_enabled,
          location_sharing = EXCLUDED.location_sharing,
          theme = EXCLUDED.theme,
          language = EXCLUDED.language,
          units = EXCLUDED.units,
          map_style = EXCLUDED.map_style,
          auto_save_places = EXCLUDED.auto_save_places,
          show_distance = EXCLUDED.show_distance,
          updated_at = NOW()
        RETURNING *
      `;
      return result[0];
    },
  },

  savedPlaces: {
    list: async (userId: string, listId?: string) => {
      let query = sql`SELECT * FROM saved_places WHERE user_id = ${userId}`;
      if (listId) {
        query = sql`SELECT * FROM saved_places WHERE user_id = ${userId} AND list_id = ${listId}`;
      }
      const result = await query;
      return result;
    },
    add: async (data: { userId: string; placeId: string; placeData: any; listId?: string; notes?: string }) => {
      const result = await sql`
        INSERT INTO saved_places (user_id, place_id, place_data, list_id, notes)
        VALUES (${data.userId}, ${data.placeId}, ${JSON.stringify(data.placeData)}, ${data.listId}, ${data.notes})
        ON CONFLICT (user_id, place_id, list_id) DO UPDATE SET
          place_data = EXCLUDED.place_data,
          notes = EXCLUDED.notes,
          updated_at = NOW()
        RETURNING *
      `;
      return result[0];
    },
    remove: async (userId: string, placeId: string, listId?: string) => {
      let query = sql`DELETE FROM saved_places WHERE user_id = ${userId} AND place_id = ${placeId}`;
      if (listId) {
        query = sql`DELETE FROM saved_places WHERE user_id = ${userId} AND place_id = ${placeId} AND list_id = ${listId}`;
      }
      await query;
    },
  },

  savedLists: {
    list: async (userId: string) => {
      const result = await sql`
        SELECT sl.*, 
          (SELECT COUNT(*) FROM saved_list_items WHERE list_id = sl.id) as place_count,
          (SELECT COUNT(*) FROM saved_list_members WHERE list_id = sl.id) as member_count
        FROM saved_lists sl
        WHERE sl.user_id = ${userId} OR EXISTS (
          SELECT 1 FROM saved_list_members slm WHERE slm.list_id = sl.id AND slm.user_id = ${userId}
        )
        ORDER BY sl.is_default DESC, sl.updated_at DESC
      `;
      return result;
    },
    create: async (data: { userId: string; name: string; description?: string; isShared?: boolean }) => {
      const shareToken = data.isShared ? crypto.randomUUID() : null;
      const result = await sql`
        INSERT INTO saved_lists (user_id, name, description, is_shared, share_token)
        VALUES (${data.userId}, ${data.name}, ${data.description}, ${data.isShared || false}, ${shareToken})
        RETURNING *
      `;
      
      if (result[0]) {
        await sql`
          INSERT INTO saved_list_members (list_id, user_id, role)
          VALUES (${result[0].id}, ${data.userId}, 'owner')
        `;
      }
      
      return result[0];
    },
    findById: async (listId: string) => {
      const result = await sql`SELECT * FROM saved_lists WHERE id = ${listId}`;
      return result[0];
    },
    findByShareToken: async (token: string) => {
      const result = await sql`SELECT * FROM saved_lists WHERE share_token = ${token}`;
      return result[0];
    },
    update: async (listId: string, data: any) => {
      const result = await sql`
        UPDATE saved_lists SET
          name = COALESCE(${data.name}, name),
          description = COALESCE(${data.description}, description),
          cover_image = COALESCE(${data.cover_image}, cover_image),
          is_shared = COALESCE(${data.is_shared}, is_shared),
          updated_at = NOW()
        WHERE id = ${listId}
        RETURNING *
      `;
      return result[0];
    },
    delete: async (listId: string) => {
      await sql`DELETE FROM saved_lists WHERE id = ${listId}`;
    },
    getItems: async (listId: string) => {
      const result = await sql`
        SELECT * FROM saved_list_items WHERE list_id = ${listId} ORDER BY position, created_at
      `;
      return result;
    },
    addItem: async (data: { listId: string; placeId: string; placeData: any; addedBy: string; notes?: string; position?: number }) => {
      const result = await sql`
        INSERT INTO saved_list_items (list_id, place_id, place_data, added_by, notes, position)
        VALUES (${data.listId}, ${data.placeId}, ${JSON.stringify(data.placeData)}, ${data.addedBy}, ${data.notes}, ${data.position || 0})
        ON CONFLICT (list_id, place_id) DO UPDATE SET
          place_data = EXCLUDED.place_data,
          notes = EXCLUDED.notes,
          position = EXCLUDED.position,
          updated_at = NOW()
        RETURNING *
      `;
      
      await sql`
        UPDATE saved_lists SET 
          place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = ${data.listId}),
          updated_at = NOW()
        WHERE id = ${data.listId}
      `;
      
      return result[0];
    },
    removeItem: async (listId: string, itemId: string) => {
      await sql`DELETE FROM saved_list_items WHERE id = ${itemId} AND list_id = ${listId}`;
      await sql`
        UPDATE saved_lists SET 
          place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = ${listId}),
          updated_at = NOW()
        WHERE id = ${listId}
      `;
    },
    reorderItems: async (listId: string, items: { id: string; position: number }[]) => {
      for (const item of items) {
        await sql`
          UPDATE saved_list_items SET position = ${item.position}, updated_at = NOW()
          WHERE id = ${item.id} AND list_id = ${listId}
        `;
      }
    },
    getMembers: async (listId: string) => {
      const result = await sql`
        SELECT slm.*, u.email, u.firstName, u.lastName, u.imageUrl, u.username
        FROM saved_list_members slm
        JOIN users u ON u.id = slm.user_id
        WHERE slm.list_id = ${listId}
      `;
      return result;
    },
    invite: async (data: { listId: string; email: string; role: 'editor' | 'viewer'; invitedBy: string }) => {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const result = await sql`
        INSERT INTO shared_list_invites (list_id, email, role, invited_by, token, expires_at)
        VALUES (${data.listId}, ${data.email}, ${data.role}, ${data.invitedBy}, ${token}, ${expiresAt.toISOString()})
        RETURNING *
      `;
      return result[0];
    },
    acceptInvite: async (token: string, userId: string) => {
      const invite = await sql`SELECT * FROM shared_list_invites WHERE token = ${token} AND expires_at > NOW()`;
      if (!invite[0]) throw new Error('Invalid or expired invite');
      
      await sql`
        INSERT INTO saved_list_members (list_id, user_id, role, invited_by)
        VALUES (${invite[0].list_id}, ${userId}, ${invite[0].role}, ${invite[0].invited_by})
        ON CONFLICT (list_id, user_id) DO NOTHING
      `;
      
      await sql`
        UPDATE shared_list_invites SET accepted_at = NOW() WHERE token = ${token}
      `;
      
      await sql`
        UPDATE saved_lists SET 
          member_count = (SELECT COUNT(*) FROM saved_list_members WHERE list_id = ${invite[0].list_id}),
          updated_at = NOW()
        WHERE id = ${invite[0].list_id}
      `;
      
      return invite[0];
    },
    removeMember: async (listId: string, memberId: string) => {
      await sql`DELETE FROM saved_list_members WHERE id = ${memberId} AND list_id = ${listId}`;
      await sql`
        UPDATE saved_lists SET 
          member_count = (SELECT COUNT(*) FROM saved_list_members WHERE list_id = ${listId}),
          updated_at = NOW()
        WHERE id = ${listId}
      `;
    },
    updateMemberRole: async (listId: string, memberId: string, role: 'editor' | 'viewer') => {
      const result = await sql`
        UPDATE saved_list_members SET role = ${role} WHERE id = ${memberId} AND list_id = ${listId}
        RETURNING *
      `;
      return result[0];
    },
  },

  aiConversations: {
    list: async (userId: string) => {
      const result = await sql`
        SELECT * FROM ai_conversations WHERE user_id = ${userId} ORDER BY updated_at DESC
      `;
      return result;
    },
    create: async (userId: string, title?: string) => {
      const result = await sql`
        INSERT INTO ai_conversations (user_id, title) VALUES (${userId}, ${title})
        RETURNING *
      `;
      return result[0];
    },
    findById: async (id: string) => {
      const result = await sql`SELECT * FROM ai_conversations WHERE id = ${id}`;
      return result[0];
    },
    delete: async (id: string) => {
      await sql`DELETE FROM ai_conversations WHERE id = ${id}`;
    },
  },

  aiMessages: {
    list: async (conversationId: string) => {
      const result = await sql`
        SELECT * FROM ai_messages WHERE conversation_id = ${conversationId} ORDER BY created_at
      `;
      return result;
    },
    add: async (data: { conversationId: string; role: 'user' | 'assistant' | 'system'; content: string; placeCards?: any; metadata?: any }) => {
      const result = await sql`
        INSERT INTO ai_messages (conversation_id, role, content, place_cards, metadata)
        VALUES (${data.conversationId}, ${data.role}, ${data.content}, ${JSON.stringify(data.placeCards)}, ${JSON.stringify(data.metadata)})
        RETURNING *
      `;
      
      await sql`
        UPDATE ai_conversations SET updated_at = NOW() WHERE id = ${data.conversationId}
      `;
      
      return result[0];
    },
  },

  trips: {
    list: async (userId: string) => {
      const result = await sql`
        SELECT t.*, 
          (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id) as stop_count
        FROM trips t
        WHERE t.user_id = ${userId}
        ORDER BY t.updated_at DESC
      `;
      return result;
    },
    create: async (data: any) => {
      const result = await sql`
        INSERT INTO trips (user_id, name, description, start_location, end_location, duration_hours, interests, budget, people_count, transport_mode)
        VALUES (${data.user_id}, ${data.name}, ${data.description}, ${JSON.stringify(data.start_location)}, ${JSON.stringify(data.end_location)}, ${data.duration_hours}, ${data.interests}, ${data.budget}, ${data.people_count}, ${data.transport_mode})
        RETURNING *
      `;
      return result[0];
    },
    findById: async (id: string) => {
      const result = await sql`SELECT * FROM trips WHERE id = ${id}`;
      return result[0];
    },
    update: async (id: string, data: any) => {
      const result = await sql`
        UPDATE trips SET
          name = COALESCE(${data.name}, name),
          description = COALESCE(${data.description}, description),
          start_location = COALESCE(${JSON.stringify(data.start_location)}, start_location),
          end_location = COALESCE(${JSON.stringify(data.end_location)}, end_location),
          duration_hours = COALESCE(${data.duration_hours}, duration_hours),
          interests = COALESCE(${data.interests}, interests),
          budget = COALESCE(${data.budget}, budget),
          people_count = COALESCE(${data.people_count}, people_count),
          transport_mode = COALESCE(${data.transport_mode}, transport_mode),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    },
    delete: async (id: string) => {
      await sql`DELETE FROM trips WHERE id = ${id}`;
    },
    addStops: async (tripId: string, stops: any[]) => {
      for (const stop of stops) {
        await sql`
          INSERT INTO trip_stops (trip_id, place_id, place_data, order_index, start_time, end_time, duration_minutes, notes, travel_time_from_previous, travel_distance_from_previous)
          VALUES (${tripId}, ${stop.place_id}, ${JSON.stringify(stop.place_data)}, ${stop.order}, ${stop.start_time}, ${stop.end_time}, ${stop.duration_minutes}, ${stop.notes}, ${stop.travel_time_from_previous}, ${stop.travel_distance_from_previous})
        `;
      }
    },
    getStops: async (tripId: string) => {
      const result = await sql`SELECT * FROM trip_stops WHERE trip_id = ${tripId} ORDER BY order_index`;
      return result;
    },
  },

  routes: {
    create: async (data: { tripId?: string; listId?: string; coordinates: any[]; distanceMeters: number; durationSeconds: number; waypoints: any[]; geometry: string }) => {
      const result = await sql`
        INSERT INTO routes (trip_id, list_id, coordinates, distance_meters, duration_seconds, waypoints, geometry)
        VALUES (${data.tripId}, ${data.listId}, ${JSON.stringify(data.coordinates)}, ${data.distanceMeters}, ${data.durationSeconds}, ${JSON.stringify(data.waypoints)}, ${data.geometry})
        RETURNING *
      `;
      return result[0];
    },
    findByTripId: async (tripId: string) => {
      const result = await sql`SELECT * FROM routes WHERE trip_id = ${tripId} ORDER BY created_at DESC LIMIT 1`;
      return result[0];
    },
    findByListId: async (listId: string) => {
      const result = await sql`SELECT * FROM routes WHERE list_id = ${listId} ORDER BY created_at DESC LIMIT 1`;
      return result[0];
    },
  },

  notifications: {
    list: async (userId: string, unreadOnly = false) => {
      let query = sql`SELECT * FROM notifications WHERE user_id = ${userId}`;
      if (unreadOnly) {
        query = sql`SELECT * FROM notifications WHERE user_id = ${userId} AND read = FALSE`;
      }
      const result = await query;
      return result;
    },
    markRead: async (id: string) => {
      await sql`UPDATE notifications SET read = TRUE WHERE id = ${id}`;
    },
    create: async (data: { userId: string; type: string; title: string; message: string; data?: any }) => {
      const result = await sql`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (${data.userId}, ${data.type}, ${data.title}, ${data.message}, ${JSON.stringify(data.data)})
        RETURNING *
      `;
      return result[0];
    },
  },
};