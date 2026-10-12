# SaaS E-Label - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Database Operations](#database-operations)
3. [Running the Application](#running-the-application)
4. [Testing](#testing)
5. [Deployment to Vercel](#deployment-to-vercel)
6. [Post-Deployment Setup](#post-deployment-setup)

---

## 🚀 Initial Setup

### Prerequisites
- **Node.js** 18.17 or later
- **pnpm** (recommended package manager)
- **Git**

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd saas-elabel

# Install pnpm (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install
```

### 2. Environment Variables Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local  # If example exists
# OR create manually
touch .env.local
```

**Required Environment Variables:**

```env
# Clerk Authentication (Get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

# Database (Optional for local dev, required for production)
DATABASE_URL=postgresql://user:password@host:5432/database

# Stripe (Required for payment features)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
BILLING_PLAN_ENV=dev

# Vercel Blob (For image uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Optional: Better Stack Logging
LOGTAIL_SOURCE_TOKEN=xxxxx

# Optional: Application URL (auto-detected on Vercel)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Clerk Authentication Setup

1. **Create Clerk Account:**
   - Visit [Clerk.com](https://clerk.com) and sign up
   - Create a new application

2. **Get API Keys:**
   - In Clerk Dashboard → API Keys
   - Copy `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy `Secret Key` → `CLERK_SECRET_KEY`

3. **Enable Organizations:**
   - In Clerk Dashboard → Organization Settings
   - Toggle **"Enable Organizations"** → ON
   - This is required for multi-tenancy features

4. **Configure Sign-in/Sign-up Options:**
   - Go to User & Authentication → Email, Phone, Username
   - Enable/disable authentication methods as needed

### 4. Stripe Setup (Optional - for payments)

1. **Create Stripe Account:**
   - Visit [Stripe.com](https://stripe.com) and sign up
   - Use test mode for development

2. **Get API Keys:**
   - Dashboard → Developers → API Keys
   - Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy `Secret key` → `STRIPE_SECRET_KEY`

3. **Setup Webhook Secret:**
   ```bash
   # Install Stripe CLI
   # Visit: https://stripe.com/docs/stripe-cli
   
   # Login
   stripe login
   
   # Start webhook forwarding (run this with your dev server)
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET
   ```

4. **Create Product Prices:**
   ```bash
   pnpm run stripe:setup-price
   # Follow prompts to create test prices
   # Update price IDs in src/utils/AppConfig.ts
   ```

5. **Configure Customer Portal:**
   - Go to https://dashboard.stripe.com/test/settings/billing/portal
   - Configure customer portal settings
   - **Important:** Click Save settings

---

## 🗄️ Database Operations

### Understanding Database Strategy

The project uses **dual database strategy**:
- **PGlite** (local development) - Automatic, no setup needed
- **PostgreSQL** (production) - Requires `DATABASE_URL`

### Local Development (PGlite)
No database setup needed! PGlite runs in-memory automatically.

```bash
# Just start the dev server
pnpm dev
# Database auto-initializes and migrations auto-apply
```

### Production Database Setup

#### Option 1: Neon PostgreSQL (Recommended)

1. **Create Neon Account:**
   - Visit [Neon.tech](https://neon.tech)
   - Create a new project

2. **Get Connection String:**
   - Dashboard → Connection Details
   - Copy connection string
   - Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
   ```

#### Option 2: Prisma PostgreSQL

1. **Create Prisma Account:**
   - Visit [Prisma.io](https://www.prisma.io)
   - Create a new database

2. **Generate Credentials:**
   - Select "Any client" connection type
   - Generate database credentials
   - Copy connection string → `DATABASE_URL`

#### Option 3: Other PostgreSQL Providers
- Supabase
- Railway
- Heroku PostgreSQL
- AWS RDS
- Any PostgreSQL 14+ instance

### Database Schema Changes

When you modify `src/models/Schema.ts`:

```bash
# 1. Generate migration file
pnpm db:generate
# This creates a new file in migrations/ folder

# 2. Development: Migrations auto-apply on next dev server start
pnpm dev

# 3. Production: Apply migrations manually
pnpm db:migrate
```

**Example Schema Change Workflow:**

```typescript
// 1. Edit src/models/Schema.ts
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  newField: text('new_field'), // ← Add new field
});

// 2. Generate migration
// pnpm db:generate

// 3. Migration is auto-applied in dev
// For production, run: pnpm db:migrate
```

### Database Studio (Visual Database Browser)

```bash
# Open Drizzle Studio
pnpm db:studio

# Opens https://local.drizzle.studio
# Browse and edit database visually
```

### Common Database Commands

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations (production only)
pnpm db:migrate

# Open database studio
pnpm db:studio

# Check migration status
# (No built-in command - migrations auto-apply in dev)
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Start development server with hot reload
pnpm dev

# Opens http://localhost:3000
# Includes Spotlight debugger for Sentry
```

**What happens on `pnpm dev`:**
1. Next.js dev server starts on port 3000
2. Spotlight (Sentry debug tool) starts
3. Database migrations auto-apply
4. TypeScript compiler runs in watch mode

### Production Build (Local Testing)

```bash
# Create production build
pnpm build

# Start production server
pnpm start

# Opens http://localhost:3000
```

### Type Checking

```bash
# Run TypeScript type checking
pnpm check-types

# This runs: tsc --noEmit --pretty
```

### Code Quality

```bash
# Run ESLint
pnpm lint

# Auto-fix ESLint issues
pnpm lint:fix

# Format code with Prettier (auto-runs via lint:fix)
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

**Test files are co-located with source:**
- `src/utils/Helpers.test.ts`
- `src/hooks/UseMenu.test.ts`
- `src/components/ToggleMenuButton.test.tsx`

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e -- --ui

# Run specific test file
pnpm test:e2e tests/e2e/Sanity.check.e2e.ts
```

### Storybook (Component Development)

```bash
# Start Storybook
pnpm storybook
# Opens http://localhost:6006

# Build Storybook
pnpm storybook:build
```

---

## 🚀 Deployment to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. **Push Code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables:**
   - In project settings → Environment Variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `DATABASE_URL` (required!)
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `BLOB_READ_WRITE_TOKEN`
     - `BILLING_PLAN_ENV=prod`
     - etc.

4. **Deploy:**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your production URL: `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Important: Database for Production

**⚠️ Required:** Set `DATABASE_URL` in Vercel environment variables!

```bash
# Production DATABASE_URL format:
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

Without `DATABASE_URL`, production build will fail because:
- PGlite is only for local development
- Production needs persistent PostgreSQL database

### Build Settings (Auto-configured)

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

---

## 🔧 Post-Deployment Setup

### 1. Update Clerk Production URLs

In Clerk Dashboard:
- Go to **Paths**
- Update URLs to your Vercel domain:
  - Sign-in URL: `https://your-app.vercel.app/sign-in`
  - Sign-up URL: `https://your-app.vercel.app/sign-up`
  - After sign-in: `https://your-app.vercel.app/dashboard`
  - After sign-up: `https://your-app.vercel.app/dashboard`

### 2. Update Stripe Webhook Endpoint

1. **Create Production Webhook:**
   - Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

2. **Update Webhook Secret:**
   - Copy signing secret
   - Add to Vercel environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
   - Redeploy application

### 3. Update Stripe Price IDs

In `src/utils/AppConfig.ts`, update production price IDs:

```typescript
export const PricingPlanList = {
  [PLAN_ID.PREMIUM]: {
    // ...
    prodPriceId: 'price_xxxxx', // ← Update this
  },
  [PLAN_ID.ENTERPRISE]: {
    // ...
    prodPriceId: 'price_xxxxx', // ← Update this
  },
};
```

Also update in Vercel:
```env
BILLING_PLAN_ENV=prod
```

### 4. Setup Vercel Blob Storage

If using image uploads:

1. **Create Blob Store:**
   - Vercel Dashboard → Storage → Create Database
   - Select "Blob"
   - Create store

2. **Link to Project:**
   - Vercel auto-adds `BLOB_READ_WRITE_TOKEN`
   - No manual configuration needed

### 5. Setup Custom Domain (Optional)

1. **Add Domain in Vercel:**
   - Project Settings → Domains
   - Add your custom domain
   - Configure DNS (Vercel provides instructions)

2. **Update Clerk URLs:**
   - Change all URLs to your custom domain

3. **Update Stripe Webhook:**
   - Update endpoint URL to custom domain

### 6. Setup Monitoring (Optional)

#### Sentry Error Tracking

1. **Create Sentry Project:**
   - Visit [sentry.io](https://sentry.io)
   - Create Next.js project

2. **Update Configuration:**
   ```javascript
   // next.config.mjs
   export default withSentryConfig(
     // ...
     {
       org: 'your-org-name',
       project: 'your-project-name',
     }
   );
   ```

3. **Add DSN:**
   - Update in `sentry.client.config.ts`
   - Update in `sentry.server.config.ts`
   - Update in `sentry.edge.config.ts`

#### Better Stack Logging

1. **Create Source:**
   - Visit [betterstack.com](https://betterstack.com)
   - Create Node.js source

2. **Add Token:**
   ```env
   LOGTAIL_SOURCE_TOKEN=xxxxx
   ```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Vercel automatically deploys when you push to:
- **Main branch** → Production deployment
- **Other branches** → Preview deployment

```bash
# Deploy to production
git push origin main

# Deploy to preview
git checkout -b feature/new-feature
git push origin feature/new-feature
```

### GitHub Actions (Optional)

The project includes GitHub Actions for:
- Type checking
- Linting
- Testing
- E2E testing

Located in `.github/workflows/`

---

## 📝 Common Issues & Solutions

### Issue: "Unable to find next-intl locale"
**Solution:** Ensure middleware is running. Check `src/middleware.ts` is not being skipped.

### Issue: Database migration errors
**Solution:** 
```bash
# Delete local migrations (dev only!)
rm -rf migrations/
# Regenerate
pnpm db:generate
```

### Issue: Clerk "Missing organization" error
**Solution:** Enable organizations in Clerk Dashboard → Organization Settings

### Issue: Stripe webhook signature verification failed
**Solution:** 
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook endpoint URL matches exactly

### Issue: Build fails with "DATABASE_URL not found"
**Solution:** Add `DATABASE_URL` to Vercel environment variables

### Issue: Images not uploading
**Solution:** 
- Check `BLOB_READ_WRITE_TOKEN` is set
- Link Vercel Blob storage to project

---

## 🛠️ Useful Commands Reference

```bash
# Development
pnpm dev                  # Start dev server
pnpm build               # Production build
pnpm start               # Start production server

# Database
pnpm db:generate         # Generate migration
pnpm db:migrate          # Apply migrations (prod)
pnpm db:studio           # Open database studio

# Code Quality
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix ESLint issues
pnpm check-types         # TypeScript type check

# Testing
pnpm test                # Run unit tests
pnpm test:e2e            # Run E2E tests
pnpm storybook           # Start Storybook

# Git
pnpm commit              # Commitizen (guided commits)

# Utilities
pnpm clean               # Clean build artifacts
pnpm build-stats         # Analyze bundle size
```

---

## 📚 Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Clerk Docs:** https://clerk.com/docs
- **DrizzleORM Docs:** https://orm.drizzle.team/docs
- **Stripe Docs:** https://stripe.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Shadcn UI:** https://ui.shadcn.com

---

## 🆘 Support

For issues specific to:
- **Authentication:** Check Clerk Dashboard logs
- **Payments:** Check Stripe Dashboard logs
- **Deployment:** Check Vercel build logs
- **Database:** Use `pnpm db:studio` to inspect data

**Project Repository Issues:** https://github.com/your-repo/issues

---

*Last Updated: December 2025*
