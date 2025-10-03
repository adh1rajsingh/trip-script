import { relations } from "drizzle-orm/relations";
import { users, trips, itineraryItems } from "./schema";

export const tripsRelations = relations(trips, ({one, many}) => ({
	user: one(users, {
		fields: [trips.userId],
		references: [users.id]
	}),
	itineraryItems: many(itineraryItems),
}));

export const usersRelations = relations(users, ({many}) => ({
	trips: many(trips),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({one}) => ({
	trip: one(trips, {
		fields: [itineraryItems.tripId],
		references: [trips.id]
	}),
}));