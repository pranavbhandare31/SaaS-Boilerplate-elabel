import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';
import { getI18nPath } from './utils/Helpers';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
  '/api(.*)',
  '/:locale/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const isApi = req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.includes('/api/');
    if (!isApi) {
      const pathnameLocale = AllLocales.find(
        loc => req.nextUrl.pathname === `/${loc}` || req.nextUrl.pathname.startsWith(`/${loc}/`),
      );
      const locale = pathnameLocale || AppConfig.defaultLocale;
      const signInUrl = new URL(getI18nPath('/sign-in', locale), req.url);

      await auth.protect({
        // `unauthenticatedUrl` ensures next-intl locale context is preserved on unauthenticated redirects
        unauthenticatedUrl: signInUrl.toString(),
      });
    }
  }

  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
};
