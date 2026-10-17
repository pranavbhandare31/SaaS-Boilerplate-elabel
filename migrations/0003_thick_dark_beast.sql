CREATE TABLE IF NOT EXISTS "product_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_ingredient_unique_idx" ON "product_ingredients" USING btree ("product_id","ingredient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_ingredients_product_id_idx" ON "product_ingredients" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_ingredients_ingredient_id_idx" ON "product_ingredients" USING btree ("ingredient_id");