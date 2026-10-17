import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

let client;
let drizzle;

// Need a database for production? Check out https://www.prisma.io/?via=saasboilerplatesrc
// Tested and compatible with Next.js Boilerplate
if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && Env.DATABASE_URL) {
  client = new Client({
    connectionString: Env.DATABASE_URL,
  });
  await client.connect();

  drizzle = drizzlePg(client, { schema });
  await migratePg(drizzle, {
    migrationsFolder: path.join(process.cwd(), 'migrations'),
  });
} else {
  // Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
  const global = globalThis as unknown as { client: PGlite; drizzle: PgliteDatabase<typeof schema> };

  if (!global.client) {
    const isBuild = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD || process.env.NODE_ENV === 'test';
    const dataDir = isBuild
      ? undefined
      : (process.env.PGLITE_DATA_DIR || path.join(process.cwd(), '.pglite'));

    global.client = dataDir ? new PGlite(dataDir) : new PGlite();
    await global.client.waitReady;

    global.drizzle = drizzlePglite(global.client, { schema });

    await migratePglite(global.drizzle, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
  }

  drizzle = global.drizzle;
}

export const db = drizzle;
