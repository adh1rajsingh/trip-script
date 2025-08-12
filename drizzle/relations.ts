import { relations } from "drizzle-orm/relations";
import { users, trips, currencyRates, itineraryItems, dailyBudgets, expenses } from "./schema";

export const tripsRelations = relations(trips, ({one, many}) => ({
	user: one(users, {
		fields: [trips.userId],
		references: [users.id]
	}),
	currencyRates: many(currencyRates),
	itineraryItems: many(itineraryItems),
	dailyBudgets: many(dailyBudgets),
	expenses: many(expenses),
}));

export const usersRelations = relations(users, ({many}) => ({
	trips: many(trips),
}));

export const currencyRatesRelations = relations(currencyRates, ({one}) => ({
	trip: one(trips, {
		fields: [currencyRates.tripId],
		references: [trips.id]
	}),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({one, many}) => ({
	trip: one(trips, {
		fields: [itineraryItems.tripId],
		references: [trips.id]
	}),
	expenses: many(expenses),
}));

export const dailyBudgetsRelations = relations(dailyBudgets, ({one}) => ({
	trip: one(trips, {
		fields: [dailyBudgets.tripId],
		references: [trips.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	trip: one(trips, {
		fields: [expenses.tripId],
		references: [trips.id]
	}),
	itineraryItem: one(itineraryItems, {
		fields: [expenses.itineraryItemId],
		references: [itineraryItems.id]
	}),
}));