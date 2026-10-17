import { auth } from '@clerk/nextjs/server';
import { eq, isNull, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { insertProductSchema, productIngredients, products } from '@/models/Schema';

export async function GET() {
  try {
    const { userId } = await auth();
    const query = userId
      ? db.select().from(products).where(or(eq(products.createdBy, userId), isNull(products.createdBy)))
      : db.select().from(products);

    const allProducts = await query;
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const validatedData = insertProductSchema.parse(body);
    const { ingredientIds, ...productData } = validatedData;

    const createdBy = productData.createdBy || userId || null;

    const newProduct = await db
      .insert(products)
      .values({ ...productData, createdBy })
      .returning();

    if (ingredientIds && ingredientIds.length > 0) {
      const associations = ingredientIds.map(ingredientId => ({
        productId: newProduct[0]!.id,
        ingredientId,
      }));
      await db.insert(productIngredients).values(associations).onConflictDoNothing();
    }

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product', detail: error instanceof Error ? error.message : error }, { status: 400 });
  }
}
