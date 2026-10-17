import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { insertProductSchema, productIngredients, products } from '@/models/Schema';

export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products', stack: error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertProductSchema.parse(body);
    const { ingredientIds, ...productData } = validatedData;

    const newProduct = await db.insert(products).values(productData).returning();

    if (ingredientIds && ingredientIds.length > 0) {
      const associations = ingredientIds.map(ingredientId => ({
        productId: newProduct[0]!.id,
        ingredientId,
      }));
      await db.insert(productIngredients).values(associations).onConflictDoNothing();
    }

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product', stack: error }, { status: 400 });
  }
}
