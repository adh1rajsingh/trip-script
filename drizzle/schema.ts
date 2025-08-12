import { pgTable, unique, uuid, text, timestamp, foreignKey, boolean, doublePrecision, integer } from "drizzle-orm/pg-core"
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
	isPublic: boolean("is_public").default(false).notNull(),
	shareId: uuid("share_id"),
	baseCurrency: text("base_currency").default('USD').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "trips_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("trips_share_id_unique").on(table.shareId),
]);

export const currencyRates = pgTable("currency_rates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tripId: uuid("trip_id").notNull(),
	currency: text().notNull(),
	rateToBase: doublePrecision("rate_to_base").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tripId],
			foreignColumns: [trips.id],
			name: "currency_rates_trip_id_trips_id_fk"
		}).onDelete("cascade"),
	unique("currency_rates_trip_currency_unique").on(table.tripId, table.currency),
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
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	address: text(),
	costCents: integer("cost_cents"),
	costCurrency: text("cost_currency"),
}, (table) => [
	foreignKey({
			columns: [table.tripId],
			foreignColumns: [trips.id],
			name: "itinerary_items_trip_id_trips_id_fk"
		}).onDelete("cascade"),
]);

export const dailyBudgets = pgTable("daily_budgets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tripId: uuid("trip_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	amountCents: integer("amount_cents").default(0).notNull(),
	currency: text().default('USD').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tripId],
			foreignColumns: [trips.id],
			name: "daily_budgets_trip_id_trips_id_fk"
		}).onDelete("cascade"),
	unique("daily_budgets_trip_date_unique").on(table.tripId, table.date),
]);

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tripId: uuid("trip_id").notNull(),
	itineraryItemId: uuid("itinerary_item_id"),
	date: timestamp({ mode: 'string' }).notNull(),
	amountCents: integer("amount_cents").notNull(),
	currency: text().notNull(),
	category: text().notNull(),
	note: text(),
	receiptUrl: text("receipt_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tripId],
			foreignColumns: [trips.id],
			name: "expenses_trip_id_trips_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.itineraryItemId],
			foreignColumns: [itineraryItems.id],
			name: "expenses_itinerary_item_id_itinerary_items_id_fk"
		}).onDelete("set null"),
]);
