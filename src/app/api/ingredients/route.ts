import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { ingredients, insertIngredientSchema } from '@/models/Schema';

export async function GET() {
  try {
    const allIngredients = await db.select().from(ingredients);
    return NextResponse.json(allIngredients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ingredients', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    const body = await request.json();
    const validatedData = insertIngredientSchema.parse(body);

    const createdBy = userId;

    const newIngredient = await db
      .insert(ingredients)
      .values({ ...validatedData, createdBy })
      .returning();

    return NextResponse.json(newIngredient[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ingredient', detail: error instanceof Error ? error.message : error }, { status: 400 });
  }
}
