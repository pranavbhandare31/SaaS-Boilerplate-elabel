CREATE TABLE IF NOT EXISTS "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"e_number" text,
	"allergens" text[],
	"details" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"net_volume" text,
	"vintage" text,
	"wine_type" text,
	"sugar_content" text,
	"appellation" text,
	"alcohol_content" text,
	"packaging_gases" text,
	"portion_size" text,
	"kcal" text,
	"kj" text,
	"fat" text,
	"carbohydrates" text,
	"organic" boolean DEFAULT false,
	"vegetarian" boolean DEFAULT false,
	"vegan" boolean DEFAULT false,
	"operator_type" text,
	"operator_name" text,
	"operator_address" text,
	"operator_info" text,
	"country_of_origin" text,
	"sku" text,
	"ean" text,
	"external_link" text,
	"redirect_link" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_email_confirmed" boolean DEFAULT false NOT NULL,
	"email_confirmation_token" varchar(255),
	"email_confirmation_token_expiry" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "organization";--> statement-breakpoint
DROP TABLE "todo";