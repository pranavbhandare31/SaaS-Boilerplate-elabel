import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { ingredients, productIngredients, products } from '@/models/Schema';

const addIngredientsSchema = z.object({
  ingredientIds: z.array(z.number()).optional(),
  ingredientId: z.number().optional(),
});

const removeIngredientSchema = z.object({
  ingredientId: z.number(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await db.select().from(products).where(eq(products.id, productId));
    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const associatedIngredients = await db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        category: ingredients.category,
        eNumber: ingredients.eNumber,
        allergens: ingredients.allergens,
        details: ingredients.details,
      })
      .from(productIngredients)
      .innerJoin(ingredients, eq(productIngredients.ingredientId, ingredients.id))
      .where(eq(productIngredients.productId, productId));

    return NextResponse.json(associatedIngredients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product ingredients', stack: error }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await db.select().from(products).where(eq(products.id, productId));
    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (product[0]?.createdBy && product[0].createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to modify this product' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = addIngredientsSchema.parse(body);

    const idsToAdd: number[] = [];
    if (parsed.ingredientId !== undefined) {
      idsToAdd.push(parsed.ingredientId);
    }
    if (parsed.ingredientIds) {
      idsToAdd.push(...parsed.ingredientIds);
    }

    if (idsToAdd.length === 0) {
      return NextResponse.json({ error: 'No ingredient IDs provided' }, { status: 400 });
    }

    // Verify all ingredient IDs exist
    for (const ingredientId of idsToAdd) {
      const existing = await db.select().from(ingredients).where(eq(ingredients.id, ingredientId));
      if (existing.length === 0) {
        return NextResponse.json({ error: `Ingredient with ID ${ingredientId} not found` }, { status: 404 });
      }
    }

    const records = idsToAdd.map(ingredientId => ({
      productId,
      ingredientId,
    }));

    await db.insert(productIngredients).values(records).onConflictDoNothing();

    const updatedIngredients = await db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        category: ingredients.category,
        eNumber: ingredients.eNumber,
        allergens: ingredients.allergens,
        details: ingredients.details,
      })
      .from(productIngredients)
      .innerJoin(ingredients, eq(productIngredients.ingredientId, ingredients.id))
      .where(eq(productIngredients.productId, productId));

    return NextResponse.json(updatedIngredients, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add ingredients to product', detail: error instanceof Error ? error.message : error }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await db.select().from(products).where(eq(products.id, productId));
    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (product[0]?.createdBy && product[0].createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to modify this product' }, { status: 403 });
    }

    const body = await request.json();
    const { ingredientId } = removeIngredientSchema.parse(body);

    const deleted = await db
      .delete(productIngredients)
      .where(
        and(
          eq(productIngredients.productId, productId),
          eq(productIngredients.ingredientId, ingredientId),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Association not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, removed: deleted[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove ingredient from product', detail: error instanceof Error ? error.message : error }, { status: 400 });
  }
}
