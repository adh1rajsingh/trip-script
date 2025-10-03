import { relations } from "drizzle-orm";
import { doublePrecision, integer, pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  tripCollaborations: many(tripCollaborators),
  activities: many(tripActivity),
  presences: many(userPresence),
}));


export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  destination: text('destination').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  // Sharing fields
  isPublic: boolean('is_public').notNull().default(false),
  shareId: uuid('share_id').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  itineraryItems: many(itineraryItems),
  collaborators: many(tripCollaborators),
  activities: many(tripActivity),
  presences: many(userPresence),
  pendingInvitations: many(pendingInvitations),
}));

export const itineraryItems = pgTable('itinerary_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  
  name: text('name').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  
  // Map location (optional)
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  address: text('address'),
  
  order: integer('order').default(0).notNull(), 
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id],
  }),
}));

// Collaboration tables
export const tripCollaborators = pgTable('trip_collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['owner', 'editor', 'viewer'] }).notNull().default('viewer'),
  invitedBy: uuid('invited_by').references(() => users.id),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tripCollaboratorsRelations = relations(tripCollaborators, ({ one }) => ({
  trip: one(trips, {
    fields: [tripCollaborators.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripCollaborators.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [tripCollaborators.invitedBy],
    references: [users.id],
  }),
}));

export const tripActivity = pgTable('trip_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(), // 'created', 'updated', 'deleted', 'added_item', 'removed_item', etc.
  entityType: text('entity_type'), // 'trip', 'itinerary_item', 'collaborator'
  entityId: uuid('entity_id'),
  metadata: text('metadata'), // JSON string for additional details
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tripActivityRelations = relations(tripActivity, ({ one }) => ({
  trip: one(trips, {
    fields: [tripActivity.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripActivity.userId],
    references: [users.id],
  }),
}));

export const userPresence = pgTable('user_presence', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const userPresenceRelations = relations(userPresence, ({ one }) => ({
  trip: one(trips, {
    fields: [userPresence.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [userPresence.userId],
    references: [users.id],
  }),
}));

// Pending invitations for users who don't have accounts yet
export const pendingInvitations = pgTable('pending_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  role: text('role', { enum: ['editor', 'viewer'] }).notNull().default('viewer'),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(), // For secure access via link
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pendingInvitationsRelations = relations(pendingInvitations, ({ one }) => ({
  trip: one(trips, {
    fields: [pendingInvitations.tripId],
    references: [trips.id],
  }),
  inviter: one(users, {
    fields: [pendingInvitations.invitedBy],
    references: [users.id],
  }),
}));

