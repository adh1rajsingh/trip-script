import { pgTable, unique, uuid, text, timestamp, foreignKey, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clerkId: text("clerk_id").notNull(),
	email: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_clerk_id_unique").on(table.clerkId),
]);

export const trips = pgTable("trips", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	destination: text().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "trips_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const itineraryItems = pgTable("itinerary_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tripId: uuid("trip_id").notNull(),
	name: text().notNull(),
	description: text(),
	date: timestamp({ mode: 'string' }).notNull(),
	order: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tripId],
			foreignColumns: [trips.id],
			name: "itinerary_items_trip_id_trips_id_fk"
		}).onDelete("cascade"),
]);
