CREATE TABLE "final_itineraries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"selected_date" text NOT NULL,
	"selected_time" text NOT NULL,
	"venue_name" text NOT NULL,
	"venue_address" text NOT NULL,
	"google_maps_url" text NOT NULL,
	"weather_condition" text NOT NULL,
	"ai_reasoning" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"friend_name" text NOT NULL,
	"available_slots" jsonb NOT NULL,
	"chosen_vibes" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hangout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_name" text NOT NULL,
	"city" text NOT NULL,
	"status" varchar(20) DEFAULT 'collecting' NOT NULL,
	"title" text,
	"date_range" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "final_itineraries" ADD CONSTRAINT "final_itineraries_session_id_hangout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."hangout_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_responses" ADD CONSTRAINT "friend_responses_session_id_hangout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."hangout_sessions"("id") ON DELETE no action ON UPDATE no action;