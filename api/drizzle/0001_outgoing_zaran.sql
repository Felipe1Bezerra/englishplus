CREATE TABLE "youtube_accounts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"channel_title" text NOT NULL,
	"uploads_playlist_id" text NOT NULL,
	"refresh_token" text NOT NULL,
	"access_token" text,
	"access_token_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "youtube_accounts" ADD CONSTRAINT "youtube_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;