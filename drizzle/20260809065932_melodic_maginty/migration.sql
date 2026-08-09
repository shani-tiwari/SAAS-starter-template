CREATE TABLE "todo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "todo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"completed" boolean DEFAULT false,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"is_subscribed" boolean DEFAULT false,
	"subscription_ends" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "todo" ADD CONSTRAINT "todo_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");