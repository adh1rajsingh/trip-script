ALTER TABLE "trips" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "share_id" uuid;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_share_id_unique" UNIQUE("share_id");