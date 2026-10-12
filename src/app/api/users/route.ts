import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { insertUserSchema, users } from '@/models/Schema';

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertUserSchema.parse(body);

    const newUser = await db.insert(users).values(validatedData).returning();
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
  }
}
