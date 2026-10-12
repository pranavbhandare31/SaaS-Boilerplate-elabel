import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { ingredients, insertIngredientSchema } from '@/models/Schema';

export async function GET() {
  try {
    const allIngredients = await db.select().from(ingredients);
    return NextResponse.json(allIngredients);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertIngredientSchema.parse(body);

    const newIngredient = await db.insert(ingredients).values(validatedData).returning();
    return NextResponse.json(newIngredient[0], { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 400 });
  }
}
