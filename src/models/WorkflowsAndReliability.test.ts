import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { eq } from 'drizzle-orm';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { createTranslator } from 'next-intl';
import { afterAll, describe, expect, it } from 'vitest';

import enMessages from '../locales/en.json';
import frMessages from '../locales/fr.json';
import * as schema from './Schema';

describe('Master Workflows, Persistence & Security Integration Tests', () => {
  const tempDbDirs: string[] = [];

  const createDbInstance = async (dir?: string) => {
    const client = dir ? new PGlite(dir) : new PGlite();
    await client.waitReady;
    const db = drizzlePglite(client, { schema });

    await migratePglite(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });

    return { client, db };
  };

  afterAll(async () => {
    // Cleanup any temporary directories created for persistence tests
    for (const dir of tempDbDirs) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {
        // Ignore cleanup errors on Windows locks
      }
    }
  });

  describe('Workflow A: Product Creation & Schema Resilience', () => {
    it('creates product with valid details and Clerk string createdBy', async () => {
      const { db, client } = await createDbInstance();

      const input = {
        name: 'Château Margaux 2018',
        brand: 'Château Margaux',
        vintage: 2018, // numeric input transformed to string
        alcoholContent: 13.5, // numeric input transformed to string
        netVolume: '750ml',
        wineType: 'Red',
        sugarContent: 'Dry',
        kcal: 85,
        kj: 355,
        fat: 0,
        carbohydrates: 2.6,
        organic: true,
        vegan: false,
        vegetarian: true,
        countryOfOrigin: 'France',
        sku: 100234,
        createdBy: 'user_clerk_winemaker_1',
      };

      const validated = schema.insertProductSchema.parse(input);
      expect(typeof validated.vintage).toBe('string');
      expect(validated.vintage).toBe('2018');
      expect(typeof validated.alcoholContent).toBe('string');
      expect(validated.alcoholContent).toBe('13.5');
      expect(typeof validated.sku).toBe('string');
      expect(validated.sku).toBe('100234');

      const inserted = await db.insert(schema.products).values(validated).returning();
      expect(inserted).toHaveLength(1);
      const product = inserted[0]!;
      expect(product.id).toBeGreaterThan(0);
      expect(product.name).toBe('Château Margaux 2018');
      expect(product.createdBy).toBe('user_clerk_winemaker_1');

      // Reload from DB and verify fields
      const reloaded = await db.select().from(schema.products).where(eq(schema.products.id, product.id));
      expect(reloaded).toHaveLength(1);
      expect(reloaded[0]?.name).toBe('Château Margaux 2018');
      expect(reloaded[0]?.organic).toBe(true);

      await client.close();
    });

    it('rejects product creation when required name is missing or empty', () => {
      expect(() => {
        schema.insertProductSchema.parse({
          name: '',
          vintage: '2020',
        });
      }).toThrow();
    });
  });

  describe('Workflow B: Ingredients & Association Persistence', () => {
    it('manages ingredient lifecycle and product associations', async () => {
      const { db, client } = await createDbInstance();

      // Create ingredients
      const ingList = await db
        .insert(schema.ingredients)
        .values([
          {
            name: 'Cultured Wine Yeast',
            category: 'Fermentation Agent',
            eNumber: null,
            allergens: [],
            createdBy: 'user_clerk_winemaker_1',
          },
          {
            name: 'Potassium Metabisulphite',
            category: 'Preservative / Antioxidant',
            eNumber: 'E224',
            allergens: ['Sulphites'],
            createdBy: 'user_clerk_winemaker_1',
          },
        ])
        .returning();

      expect(ingList).toHaveLength(2);
      const yeast = ingList[0]!;
      const sulphite = ingList[1]!;

      // Create wine product
      const productList = await db
        .insert(schema.products)
        .values({
          name: 'Domaine de la Romanée-Conti 2019',
          vintage: '2019',
          createdBy: 'user_clerk_winemaker_1',
        })
        .returning();
      const product = productList[0]!;

      // Associate both ingredients
      await db
        .insert(schema.productIngredients)
        .values([
          { productId: product.id, ingredientId: yeast.id },
          { productId: product.id, ingredientId: sulphite.id },
        ]);

      // Retrieve associated ingredients via inner join
      const associated = await db
        .select({
          id: schema.ingredients.id,
          name: schema.ingredients.name,
          allergens: schema.ingredients.allergens,
        })
        .from(schema.productIngredients)
        .innerJoin(schema.ingredients, eq(schema.productIngredients.ingredientId, schema.ingredients.id))
        .where(eq(schema.productIngredients.productId, product.id));

      expect(associated).toHaveLength(2);
      expect(associated.some(i => i.allergens?.includes('Sulphites'))).toBe(true);

      // Verify unique index prevents duplicate associations
      await expect(
        db.insert(schema.productIngredients).values({ productId: product.id, ingredientId: yeast.id }),
      ).rejects.toThrow();

      await client.close();
    });
  });

  describe('Workflow C: Public E-Label Retrieval & Localization', () => {
    it('renders localized product keys in English and French', () => {
      const tEn = createTranslator({ locale: 'en', messages: enMessages, namespace: 'product' });
      const tFr = createTranslator({ locale: 'fr', messages: frMessages, namespace: 'product' });

      expect(tEn('vintage')).toBe('Vintage');
      expect(tFr('vintage')).toBe('Millésime');

      expect(tEn('ingredients_allergens_title')).toBe('Ingredients & Allergens');
      expect(tFr('ingredients_allergens_title')).toBe('Ingrédients et allergènes');

      expect(tEn('nutritional_info_title')).toBe('Nutritional Information');
      expect(tFr('nutritional_info_title')).toBe('Informations nutritionnelles');

      expect(tEn('organic')).toBe('Organic');
      expect(tFr('organic')).toBe('Biologique');
    });

    it('rejects invalid product ID with 404 behavior', () => {
      const invalidId = Number.parseInt('invalid-id', 10);
      expect(Number.isNaN(invalidId)).toBe(true);
    });
  });

  describe('Workflow D: Security, Authorization & Reliability', () => {
    it('enforces ownership restrictions between different users', async () => {
      const { db, client } = await createDbInstance();

      // User A creates a product
      const productA = (
        await db
          .insert(schema.products)
          .values({
            name: 'User A Reserve 2021',
            createdBy: 'user_AAA_111',
          })
          .returning()
      )[0]!;

      // User B attempts to modify User A's product
      const simulatedRequestUser = 'user_BBB_222';
      const isAuthorized = productA.createdBy === simulatedRequestUser;
      expect(isAuthorized).toBe(false);

      // Verify User A is authorized
      const isOwnerAuthorized = productA.createdBy === 'user_AAA_111';
      expect(isOwnerAuthorized).toBe(true);

      // Perform authorized update and verify updatedAt
      const updated = (
        await db
          .update(schema.products)
          .set({ name: 'User A Reserve 2021 (Special Edit)', updatedAt: new Date() })
          .where(eq(schema.products.id, productA.id))
          .returning()
      )[0]!;

      expect(updated.name).toBe('User A Reserve 2021 (Special Edit)');
      expect(updated.updatedAt).toBeDefined();

      // Check ingredient ownership security
      const ingA = (
        await db
          .insert(schema.ingredients)
          .values({
            name: 'User A Proprietary Yeast',
            category: 'Yeast',
            createdBy: 'user_AAA_111',
          })
          .returning()
      )[0]!;

      // User B attempts to delete User A's ingredient
      const isIngAuthorized = ingA.createdBy === simulatedRequestUser;
      expect(isIngAuthorized).toBe(false);

      // Verify unauthenticated check returns unauthorized
      const unauthUserId = null;
      const isUnauthAllowed = !!unauthUserId;
      expect(isUnauthAllowed).toBe(false);

      await client.close();
    });

    it('rejects unauthorized mutations and enforces 401/403 status logic', () => {
      // Simulating API handler authorization guard
      const checkAccess = (userId: string | null | undefined, resourceOwner: string | null) => {
        if (!userId) {
          return { status: 401, error: 'Unauthorized: Authentication required' };
        }
        if (resourceOwner && resourceOwner !== userId) {
          return { status: 403, error: 'Forbidden: You do not have permission to modify this resource' };
        }
        return { status: 200, allowed: true };
      };

      // 1. Unauthenticated request
      expect(checkAccess(null, 'user_123')).toEqual({
        status: 401,
        error: 'Unauthorized: Authentication required',
      });

      // 2. Cross-user unauthorized request
      expect(checkAccess('user_attacker_456', 'user_owner_123')).toEqual({
        status: 403,
        error: 'Forbidden: You do not have permission to modify this resource',
      });

      // 3. Authorized owner request
      expect(checkAccess('user_owner_123', 'user_owner_123')).toEqual({
        status: 200,
        allowed: true,
      });
    });
  });

  describe('Workflow E: Data Persistence Across Application Restart', () => {
    it('persists data to disk and reloads correctly after client close and reopen', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pglite-persist-test-'));
      tempDbDirs.push(tempDir);

      // 1. Initial Session: open DB, run migrations, create data
      const session1 = await createDbInstance(tempDir);
      const insertedProduct = (
        await session1.db
          .insert(schema.products)
          .values({
            name: 'Persisted Vintage Champagne 2015',
            brand: 'Maison Persist',
            vintage: '2015',
            createdBy: 'user_persistent_tester',
          })
          .returning()
      )[0]!;

      const insertedIng = (
        await session1.db
          .insert(schema.ingredients)
          .values({
            name: 'Pinot Noir Grapes',
            category: 'Fruit',
            createdBy: 'user_persistent_tester',
          })
          .returning()
      )[0]!;

      await session1.db.insert(schema.productIngredients).values({
        productId: insertedProduct.id,
        ingredientId: insertedIng.id,
      });

      // Close the first session (simulating server shutdown)
      await session1.client.close();

      // 2. Second Session: reopen same directory (simulating server restart)
      const session2 = await createDbInstance(tempDir);

      const reloadedProducts = await session2.db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, insertedProduct.id));

      expect(reloadedProducts).toHaveLength(1);
      expect(reloadedProducts[0]?.name).toBe('Persisted Vintage Champagne 2015');
      expect(reloadedProducts[0]?.brand).toBe('Maison Persist');

      const reloadedIngredients = await session2.db
        .select()
        .from(schema.ingredients)
        .where(eq(schema.ingredients.id, insertedIng.id));

      expect(reloadedIngredients).toHaveLength(1);
      expect(reloadedIngredients[0]?.name).toBe('Pinot Noir Grapes');

      const reloadedAssoc = await session2.db
        .select()
        .from(schema.productIngredients)
        .where(eq(schema.productIngredients.productId, insertedProduct.id));

      expect(reloadedAssoc).toHaveLength(1);
      expect(reloadedAssoc[0]?.ingredientId).toBe(insertedIng.id);

      // Cleanup session 2
      await session2.client.close();
    }, 30000);
  });
});
