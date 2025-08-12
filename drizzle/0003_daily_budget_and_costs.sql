-- Add optional cost fields to itinerary items
ALTER TABLE "itinerary_items" ADD COLUMN IF NOT EXISTS "cost_cents" integer;
ALTER TABLE "itinerary_items" ADD COLUMN IF NOT EXISTS "cost_currency" text;

-- Create daily_budgets table
CREATE TABLE IF NOT EXISTS "daily_budgets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "trip_id" uuid NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
  "date" timestamp NOT NULL,
  "amount_cents" integer NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'USD',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Unique per trip/date
DO $$ BEGIN
  ALTER TABLE "daily_budgets" ADD CONSTRAINT "daily_budgets_trip_date_unique" UNIQUE ("trip_id", "date");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
