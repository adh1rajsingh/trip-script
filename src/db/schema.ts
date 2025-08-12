import { relations } from "drizzle-orm";
import { doublePrecision, integer, pgTable, text, timestamp, uuid, boolean, unique } from "drizzle-orm/pg-core";

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
  dailyBudgets: many(dailyBudgets),
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

  // Optional cost for this place/experience (in minor units e.g., cents)
  costCents: integer('cost_cents'),
  costCurrency: text('cost_currency'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id],
  }),
}));

// Per-day budget allocation for a trip
export const dailyBudgets = pgTable('daily_budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  // Budget in minor units (e.g., cents)
  amountCents: integer('amount_cents').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  unique('daily_budgets_trip_date_unique').on(table.tripId, table.date),
]);

export const dailyBudgetsRelations = relations(dailyBudgets, ({ one }) => ({
  trip: one(trips, {
    fields: [dailyBudgets.tripId],
    references: [trips.id],
  }),
}));