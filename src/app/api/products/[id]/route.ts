import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { ingredients, insertProductSchema, productIngredients, products } from '@/models/Schema';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const product = await db.select().from(products).where(eq(products.id, id));

    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product[0]?.createdBy && product[0].createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view this product' }, { status: 403 });
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
      .where(eq(productIngredients.productId, id));

    return NextResponse.json({
      ...product[0],
      ingredients: associatedIngredients,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existingProduct = await db.select().from(products).where(eq(products.id, id));
    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (existingProduct[0]?.createdBy && existingProduct[0].createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to modify this product' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = insertProductSchema.partial().parse(body);
    const { ingredientIds, ...productData } = validatedData;

    const updatedProduct = await db
      .update(products)
      .set({
        ...productData,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (ingredientIds !== undefined) {
      await db.delete(productIngredients).where(eq(productIngredients.productId, id));
      if (ingredientIds.length > 0) {
        const associations = ingredientIds.map(ingredientId => ({
          productId: id,
          ingredientId,
        }));
        await db.insert(productIngredients).values(associations).onConflictDoNothing();
      }
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
      .where(eq(productIngredients.productId, id));

    return NextResponse.json({
      ...updatedProduct[0],
      ingredients: associatedIngredients,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product', detail: error instanceof Error ? error.message : error }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existingProduct = await db.select().from(products).where(eq(products.id, id));
    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (existingProduct[0]?.createdBy && existingProduct[0].createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this product' }, { status: 403 });
    }

    const deletedProduct = await db.delete(products).where(eq(products.id, id)).returning();

    return NextResponse.json(deletedProduct[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
