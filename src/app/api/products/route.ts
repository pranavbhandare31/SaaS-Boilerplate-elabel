import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { insertProductSchema, products } from '@/models/Schema';

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

    const newProduct = await db.insert(products).values(validatedData).returning();
    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product', stack: error }, { status: 400 });
  }
}
