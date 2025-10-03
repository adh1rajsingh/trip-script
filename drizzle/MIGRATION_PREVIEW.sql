-- This file shows the database tables that will be created
-- Run "npm run db:generate && npm run db:push" to apply these changes

-- Table: trip_collaborators
-- Purpose: Manages who can access each trip and their role
CREATE TABLE "trip_collaborators" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trip_id" UUID NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  "invited_by" UUID REFERENCES "users"("id"),
  "invited_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "accepted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX "idx_trip_collaborators_trip_id" ON "trip_collaborators"("trip_id");
CREATE INDEX "idx_trip_collaborators_user_id" ON "trip_collaborators"("user_id");

-- Table: trip_activity
-- Purpose: Logs all actions performed on trips for audit trail
CREATE TABLE "trip_activity" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trip_id" UUID NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'added_item', 'removed_item', 'invited_collaborator'
  "entity_type" TEXT,      -- 'trip', 'itinerary_item', 'collaborator'
  "entity_id" UUID,
  "metadata" TEXT,         -- JSON string with additional details
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX "idx_trip_activity_trip_id" ON "trip_activity"("trip_id");
CREATE INDEX "idx_trip_activity_created_at" ON "trip_activity"("created_at" DESC);

-- Table: user_presence
-- Purpose: Tracks which users are currently viewing each trip
CREATE TABLE "user_presence" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trip_id" UUID NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "last_seen_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- Indexes for performance
CREATE INDEX "idx_user_presence_trip_id" ON "user_presence"("trip_id");
CREATE INDEX "idx_user_presence_user_id" ON "user_presence"("user_id");
CREATE INDEX "idx_user_presence_is_active" ON "user_presence"("is_active", "last_seen_at");

-- Unique constraint to prevent duplicate collaborator entries
CREATE UNIQUE INDEX "unique_trip_collaborator" ON "trip_collaborators"("trip_id", "user_id");

-- Unique constraint to prevent duplicate presence entries
CREATE UNIQUE INDEX "unique_user_presence" ON "user_presence"("trip_id", "user_id");

-- Sample Queries for Common Operations

-- Get all collaborators for a trip
-- SELECT tc.*, u.email, u.first_name, u.last_name
-- FROM trip_collaborators tc
-- JOIN users u ON tc.user_id = u.id
-- WHERE tc.trip_id = 'your-trip-id';

-- Get recent activity for a trip
-- SELECT ta.*, u.email, u.first_name, u.last_name
-- FROM trip_activity ta
-- JOIN users u ON ta.user_id = u.id
-- WHERE ta.trip_id = 'your-trip-id'
-- ORDER BY ta.created_at DESC
-- LIMIT 20;

-- Get active users for a trip
-- SELECT up.*, u.email, u.first_name, u.last_name
-- FROM user_presence up
-- JOIN users u ON up.user_id = u.id
-- WHERE up.trip_id = 'your-trip-id' AND up.is_active = true;

-- Check if user has access to a trip
-- SELECT tc.role
-- FROM trip_collaborators tc
-- WHERE tc.trip_id = 'your-trip-id' AND tc.user_id = 'your-user-id';
