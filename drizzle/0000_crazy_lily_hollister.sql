CREATE TABLE IF NOT EXISTS "account" (
	"account_id" serial NOT NULL,
	"username" varchar(255),
	"password" text,
	"salt" text,
	"authority_id" integer,
	"status_id" integer,
	"name" varchar(255),
	"email" varchar(255),
	"ip_address" varchar(255),
	"registered" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_authority" (
	"authority_id" serial NOT NULL,
	"authority_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_status" (
	"status_id" serial NOT NULL,
	"status_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "login" (
	"login_id" serial NOT NULL,
	"account_id" integer,
	"login_time" timestamp
);
