import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { ingredients, insertIngredientSchema } from '@/models/Schema';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const ingredient = await db.select().from(ingredients).where(eq(ingredients.id, id));

    if (ingredient.length === 0) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json(ingredient[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ingredient', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existingIngredient = await db.select().from(ingredients).where(eq(ingredients.id, id));
    if (existingIngredient.length === 0) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (existingIngredient[0]?.createdBy && existingIngredient[0].createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to modify this ingredient' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = insertIngredientSchema.partial().parse(body);

    const updatedIngredient = await db
      .update(ingredients)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, id))
      .returning();

    return NextResponse.json(updatedIngredient[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ingredient', detail: error instanceof Error ? error.message : error }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existingIngredient = await db.select().from(ingredients).where(eq(ingredients.id, id));
    if (existingIngredient.length === 0) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (existingIngredient[0]?.createdBy && existingIngredient[0].createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this ingredient' }, { status: 403 });
    }

    const deletedIngredient = await db.delete(ingredients).where(eq(ingredients.id, id)).returning();

    return NextResponse.json(deletedIngredient[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ingredient', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
