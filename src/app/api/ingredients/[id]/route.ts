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
    return NextResponse.json({ error: 'Failed to fetch ingredient', stack: error }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = insertIngredientSchema.partial().parse(body);

    const updatedIngredient = await db
      .update(ingredients)
      .set(validatedData)
      .where(eq(ingredients.id, id))
      .returning();

    if (updatedIngredient.length === 0) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json(updatedIngredient[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ingredient', stack: error }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deletedIngredient = await db.delete(ingredients).where(eq(ingredients.id, id)).returning();

    if (deletedIngredient.length === 0) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json(deletedIngredient[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ingredient', stack: error }, { status: 500 });
  }
}
