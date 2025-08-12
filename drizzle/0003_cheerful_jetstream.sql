CREATE TABLE "daily_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_budgets_trip_date_unique" UNIQUE("trip_id","date")
);
--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD COLUMN "cost_cents" integer;--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD COLUMN "cost_currency" text;--> statement-breakpoint
ALTER TABLE "daily_budgets" ADD CONSTRAINT "daily_budgets_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;