# Copilot Instructions for SaaS E-Label

## Architecture Overview

This is a **Next.js 14 App Router SaaS boilerplate** for an e-labeling system managing products and ingredients. Built on:
- **Next.js 14** with App Router (`src/app/` structure)
- **Clerk** for authentication & multi-tenancy
- **DrizzleORM** with dual database strategy:
  - PGlite (local/dev) - in-memory SQLite-compatible PostgreSQL
  - PostgreSQL (production) - via `DATABASE_URL` env var
- **next-intl** for i18n with locale-prefixed routes (`[locale]` segments)
- **Shadcn UI** + Tailwind CSS for components
- **TypeScript** with strict mode and path aliases (`@/` → `src/`)

### Key Architectural Patterns

**Route Organization:**
- `src/app/[locale]/(auth)/` - Protected routes requiring authentication
- `src/app/[locale]/(unauth)/` - Public landing pages
- `src/app/[locale]/public/` - Bypasses auth middleware entirely
- `src/app/api/` - REST API routes (products, ingredients, users, webhooks)

**Database Switching Logic** (`src/libs/DB.ts`):
- Production build (`NEXT_PHASE === PHASE_PRODUCTION_BUILD`) + `DATABASE_URL` set → PostgreSQL
- Otherwise → PGlite (stored in global scope to prevent hot-reload duplication)
- Migrations auto-run on connection initialization

**Auth & Organization Flow:**
1. Unauthenticated users → `/sign-in` or `/sign-up` (Clerk hosted)
2. Authenticated without org → `/onboarding/organization-selection` (enforced by middleware)
3. Authenticated with org → `/dashboard` (access granted)

## Development Workflows

### Essential Commands
```bash
pnpm dev              # Start Next.js dev server + Spotlight debugger
pnpm db:generate      # Generate Drizzle migrations from schema changes
pnpm db:migrate       # Apply migrations (production only)
pnpm db:studio        # Open Drizzle Studio UI
pnpm check-types      # TypeScript type checking (runs in CI)
pnpm test             # Unit tests (Vitest + React Testing Library)
pnpm test:e2e         # E2E tests (Playwright)
```

### Making Schema Changes
1. Edit `src/models/Schema.ts`
2. Run `pnpm db:generate` to create migration file in `migrations/`
3. Dev DB auto-migrates on next `pnpm dev`
4. Production: `pnpm db:migrate` (requires DATABASE_URL)

### Environment Variables
Type-safe env validation via `src/libs/Env.ts` (T3 Env):
- Server vars: `CLERK_SECRET_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, etc.
- Client vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`
- **Never access `process.env` directly** - always import from `Env.ts`

## Code Conventions

### Component Patterns
```tsx
// Server Component (default in App Router)
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations('PageNamespace');
  return <div>{t('key')}</div>;
}

// Client Component (mark with 'use client')
'use client';
import { useTranslations } from 'next-intl';
export default function ClientComponent() {
  const t = useTranslations('ComponentNamespace');
  return <button>{t('action')}</button>;
}
```

### Styling & UI
- Use **Shadcn UI components** from `src/components/ui/`
- Apply `cn()` helper from `src/utils/Helpers.ts` for conditional classes:
  ```tsx
  <div className={cn('base-class', isActive && 'active-class')} />
  ```
- Variants defined separately (e.g., `buttonVariants.ts`) using `class-variance-authority`

### Database Patterns
```typescript
// Always use typed schemas from Schema.ts
import { db } from '@/libs/DB';
import { products, insertProductSchema } from '@/models/Schema';

// Validate input with Zod schemas before insert
const validated = insertProductSchema.parse(body);
const result = await db.insert(products).values(validated).returning();
```

### API Route Structure
```typescript
// src/app/api/[resource]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';

export async function GET() {
  try {
    const data = await db.select().from(table);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Message', stack: error }, { status: 500 });
  }
}
```

### Internationalization (i18n)
- All user-facing text goes in `src/locales/{en,fr}.json`
- Use translation keys with namespaces matching component names
- Server components: `getTranslations()` (async)
- Client components: `useTranslations()` (hook)
- Routes automatically prefixed with locale by middleware (e.g., `/en/dashboard`, `/fr/dashboard`)

### Testing Conventions
- **Unit tests**: Co-located with source files (e.g., `Helpers.test.ts`)
- Use `describe`/`it` from Vitest (globals enabled in `vitest.config.mts`)
- React components: Use `@testing-library/react` with `jsdom` environment
- **E2E tests**: In `tests/e2e/` with `.e2e.ts` suffix for Playwright

## Critical Integration Points

### Middleware Stack (`src/middleware.ts`)
Executes in order:
1. Public routes (`/public/*`) → Skip auth, apply i18n only
2. Auth routes + protected routes → Run Clerk middleware
3. Org check: Authenticated without `orgId` → Redirect to org selection
4. API routes → Pass through without i18n
5. All other routes → Apply i18n middleware

### Clerk Multi-Tenancy
- User can belong to multiple organizations
- `auth().orgId` required for dashboard access
- Switch orgs via Clerk's `<OrganizationSwitcher />` component
- Role-based permissions managed by Clerk (not in local DB)

### Error Handling & Logging
- Use `logger` from `src/libs/Logger.ts` (pino + Logtail integration)
- Sentry configured for error tracking (see `sentry.client.config.ts`)
- Never log sensitive data (tokens, passwords, etc.)

## Domain-Specific Context

This project is an **e-labeling system for wine/beverage products** with:
- **Products**: Full nutritional info, allergens, operator details, QR code generation
- **Ingredients**: Categorized with E-numbers, allergen tags, searchable database
- Public-facing product pages at `/public/product/[id]` (no auth required)

Key business rules:
- Products linked to ingredients (many-to-many via arrays)
- Organic/vegan/vegetarian flags as booleans
- External links for product redirects (e.g., manufacturer sites)
- Image uploads via Vercel Blob storage (`@vercel/blob`)

## Common Gotchas

1. **Route groups** `(auth)`, `(unauth)`, `(center)` are invisible in URLs - they're for layout organization only
2. **PGlite limitations**: No concurrent writes, limited pg extensions. Use PostgreSQL for production.
3. **Locale prefixing**: All routes automatically prefixed except those in middleware `isPublicRoute` matcher
4. **TypeScript strictness**: `noUncheckedIndexedAccess` enabled - array access returns `T | undefined`
5. **ESLint config**: Uses Antfu's opinionated config - auto-sorts imports, enforces semicolons
6. **Migrations folder**: Do NOT manually edit generated migrations - always use `db:generate`

## Quick Reference

**File Lookup:**
- Component library: `src/components/ui/`
- DB schemas: `src/models/Schema.ts`
- Env config: `src/libs/Env.ts`
- i18n config: `src/libs/i18n.ts`, `src/utils/AppConfig.ts`
- Database client: `src/libs/DB.ts`

**When to use 'use client':**
- React hooks (`useState`, `useEffect`, custom hooks)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)
- Third-party client libraries (charts, maps, etc.)
