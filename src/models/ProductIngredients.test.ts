import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { and, eq } from 'drizzle-orm';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { describe, expect, it } from 'vitest';

import * as schema from './Schema';

describe('Product-Ingredient Relationship Integration Tests', () => {
  const setupTestDb = async () => {
    const client = new PGlite();
    await client.waitReady;
    const db = drizzlePglite(client, { schema });

    // Apply all sequential migrations
    await migratePglite(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });

    return db;
  };

  it('initializes migrations and creates junction table product_ingredients', async () => {
    const db = await setupTestDb();
    expect(db).toBeDefined();

    // Verify junction table is queryable
    const initialRecords = await db.select().from(schema.productIngredients);
    expect(initialRecords).toHaveLength(0);
  });

  it('associates multiple ingredients with one wine product and retrieves them', async () => {
    const db = await setupTestDb();

    // 1. Create a product
    const productList = await db
      .insert(schema.products)
      .values({
        name: 'Bordeaux Grand Cru 2020',
        wineType: 'Red Wine',
        vintage: '2020',
        alcoholContent: '14.0',
        createdBy: 'user_clerk_12345',
      })
      .returning();

    const product = productList[0]!;
    expect(product.id).toBeDefined();

    // 2. Create multiple ingredients
    const ing1List = await db
      .insert(schema.ingredients)
      .values({
        name: 'Grapes (Cabernet Sauvignon)',
        category: 'Agricultural',
      })
      .returning();
    const ing1 = ing1List[0]!;

    const ing2List = await db
      .insert(schema.ingredients)
      .values({
        name: 'Sulphites (Sulphur Dioxide)',
        category: 'Preservative',
        eNumber: 'E220',
        allergens: ['sulphites'],
      })
      .returning();
    const ing2 = ing2List[0]!;

    const ing3List = await db
      .insert(schema.ingredients)
      .values({
        name: 'Tartaric Acid',
        category: 'Acidity Regulator',
        eNumber: 'E334',
      })
      .returning();
    const ing3 = ing3List[0]!;

    // 3. Associate multiple ingredients with the product
    await db.insert(schema.productIngredients).values([
      { productId: product.id, ingredientId: ing1.id },
      { productId: product.id, ingredientId: ing2.id },
      { productId: product.id, ingredientId: ing3.id },
    ]);

    // 4. Retrieve product ingredients via join
    const associatedIngredients = await db
      .select({
        id: schema.ingredients.id,
        name: schema.ingredients.name,
        eNumber: schema.ingredients.eNumber,
        category: schema.ingredients.category,
      })
      .from(schema.productIngredients)
      .innerJoin(
        schema.ingredients,
        eq(schema.productIngredients.ingredientId, schema.ingredients.id),
      )
      .where(eq(schema.productIngredients.productId, product.id));

    expect(associatedIngredients).toHaveLength(3);
    const names = associatedIngredients.map(i => i.name);
    expect(names).toContain('Grapes (Cabernet Sauvignon)');
    expect(names).toContain('Sulphites (Sulphur Dioxide)');
    expect(names).toContain('Tartaric Acid');
  });

  it('updates product ingredient associations by replacing associations', async () => {
    const db = await setupTestDb();

    const productList = await db
      .insert(schema.products)
      .values({ name: 'Chardonnay 2022' })
      .returning();
    const product = productList[0]!;

    const ing1List = await db
      .insert(schema.ingredients)
      .values({ name: 'Chardonnay Grapes' })
      .returning();
    const ing1 = ing1List[0]!;

    const ing2List = await db
      .insert(schema.ingredients)
      .values({ name: 'Sulphur Dioxide', eNumber: 'E220' })
      .returning();
    const ing2 = ing2List[0]!;

    const ing3List = await db
      .insert(schema.ingredients)
      .values({ name: 'Lactic Acid', eNumber: 'E270' })
      .returning();
    const ing3 = ing3List[0]!;

    // Initially associate ing1 and ing2
    await db.insert(schema.productIngredients).values([
      { productId: product.id, ingredientId: ing1.id },
      { productId: product.id, ingredientId: ing2.id },
    ]);

    let current = await db
      .select()
      .from(schema.productIngredients)
      .where(eq(schema.productIngredients.productId, product.id));
    expect(current).toHaveLength(2);

    // Update: replace with ing2 and ing3
    const newIngredientIds = [ing2.id, ing3.id];
    await db
      .delete(schema.productIngredients)
      .where(eq(schema.productIngredients.productId, product.id));

    await db.insert(schema.productIngredients).values(
      newIngredientIds.map(ingredientId => ({
        productId: product.id,
        ingredientId,
      })),
    );

    current = await db
      .select()
      .from(schema.productIngredients)
      .where(eq(schema.productIngredients.productId, product.id));

    expect(current).toHaveLength(2);
    const ingredientIds = current.map(r => r.ingredientId);
    expect(ingredientIds).toContain(ing2.id);
    expect(ingredientIds).toContain(ing3.id);
    expect(ingredientIds).not.toContain(ing1.id);

    // Ensure the disassociated ingredient still exists in the ingredients table
    const stillExistingIng1List = await db
      .select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.id, ing1.id));
    const stillExistingIng1 = stillExistingIng1List[0]!;
    expect(stillExistingIng1).toBeDefined();
    expect(stillExistingIng1.name).toBe('Chardonnay Grapes');
  });

  it('removes a single association without deleting the ingredient or other associations', async () => {
    const db = await setupTestDb();

    const productList = await db
      .insert(schema.products)
      .values({ name: 'Pinot Noir 2021' })
      .returning();
    const product = productList[0]!;

    const ingAList = await db
      .insert(schema.ingredients)
      .values({ name: 'Pinot Noir Grapes' })
      .returning();
    const ingA = ingAList[0]!;

    const ingBList = await db
      .insert(schema.ingredients)
      .values({ name: 'Egg Albumin (Fining Agent)' })
      .returning();
    const ingB = ingBList[0]!;

    await db.insert(schema.productIngredients).values([
      { productId: product.id, ingredientId: ingA.id },
      { productId: product.id, ingredientId: ingB.id },
    ]);

    // Remove only ingB association
    await db
      .delete(schema.productIngredients)
      .where(
        and(
          eq(schema.productIngredients.productId, product.id),
          eq(schema.productIngredients.ingredientId, ingB.id),
        ),
      );

    const remaining = await db
      .select()
      .from(schema.productIngredients)
      .where(eq(schema.productIngredients.productId, product.id));
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.ingredientId).toBe(ingA.id);

    // Verify ingB still exists in ingredients table
    const checkIngBList = await db
      .select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.id, ingB.id));
    const checkIngB = checkIngBList[0]!;
    expect(checkIngB).toBeDefined();
    expect(checkIngB.name).toBe('Egg Albumin (Fining Agent)');
  });

  it('prevents duplicate associations with unique index', async () => {
    const db = await setupTestDb();

    const productList = await db
      .insert(schema.products)
      .values({ name: 'Merlot 2023' })
      .returning();
    const product = productList[0]!;

    const ingList = await db
      .insert(schema.ingredients)
      .values({ name: 'Yeast' })
      .returning();
    const ing = ingList[0]!;

    // First insert succeeds
    await db.insert(schema.productIngredients).values({
      productId: product.id,
      ingredientId: ing.id,
    });

    // Duplicate insert throws unique constraint error or is ignored by onConflictDoNothing
    await expect(
      db.insert(schema.productIngredients).values({
        productId: product.id,
        ingredientId: ing.id,
      }),
    ).rejects.toThrow();

    // onConflictDoNothing handles duplicates cleanly without failing
    await db
      .insert(schema.productIngredients)
      .values({
        productId: product.id,
        ingredientId: ing.id,
      })
      .onConflictDoNothing();

    const records = await db
      .select()
      .from(schema.productIngredients)
      .where(eq(schema.productIngredients.productId, product.id));
    expect(records).toHaveLength(1);
  });

  it('handles foreign key violations for non-existent product or ingredient', async () => {
    const db = await setupTestDb();

    const productList = await db
      .insert(schema.products)
      .values({ name: 'Sauvignon Blanc' })
      .returning();
    const product = productList[0]!;

    // Non-existent ingredientId (e.g. 99999) must fail foreign key constraint
    await expect(
      db.insert(schema.productIngredients).values({
        productId: product.id,
        ingredientId: 99999,
      }),
    ).rejects.toThrow();

    // Non-existent productId (e.g. 88888) must fail foreign key constraint
    const ingList = await db
      .insert(schema.ingredients)
      .values({ name: 'Ascorbic Acid' })
      .returning();
    const ing = ingList[0]!;

    await expect(
      db.insert(schema.productIngredients).values({
        productId: 88888,
        ingredientId: ing.id,
      }),
    ).rejects.toThrow();
  });

  it('cascades delete: deleting product removes junction entries without deleting ingredients', async () => {
    const db = await setupTestDb();

    const productList = await db
      .insert(schema.products)
      .values({ name: 'Syrah 2019' })
      .returning();
    const product = productList[0]!;

    const ingList = await db
      .insert(schema.ingredients)
      .values({ name: 'Syrah Grapes' })
      .returning();
    const ing = ingList[0]!;

    await db.insert(schema.productIngredients).values({
      productId: product.id,
      ingredientId: ing.id,
    });

    // Delete product
    await db.delete(schema.products).where(eq(schema.products.id, product.id));

    // Junction record should be automatically cascade-deleted
    const junctionRecords = await db
      .select()
      .from(schema.productIngredients)
      .where(eq(schema.productIngredients.productId, product.id));
    expect(junctionRecords).toHaveLength(0);

    // Ingredient must still exist!
    const ingredientRecordList = await db
      .select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.id, ing.id));
    const ingredientRecord = ingredientRecordList[0]!;
    expect(ingredientRecord).toBeDefined();
    expect(ingredientRecord.name).toBe('Syrah Grapes');
  });
});
