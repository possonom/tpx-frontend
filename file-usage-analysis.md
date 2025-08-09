# File Usage Analysis - Untracked Files

## Analysis Date: August 9, 2025

### Methodology

1. Check direct imports/references in code
2. Check Next.js routing patterns
3. Check configuration file references
4. Determine if files are functionally used

---

## Core System Files (USED)

### Translation System

- ✅ **messages/de.json** - USED by src/i18n.ts (dynamic import)
- ✅ **messages/en.json** - USED by src/i18n.ts (dynamic import)
- ✅ **src/i18n.ts** - USED by next.config.ts (createNextIntlPlugin)

### Middleware & Routing

- ✅ **src/middleware.ts** - USED by Next.js automatically (convention)

### Auth System

- ✅ **src/infrastructure/auth/oidc/utils.ts** - USED by auth system

### Components

- ✅ **src/presentation/components/LanguageSwitcher.tsx** - USED by locale-aware pages

### Domain

- ✅ **src/domain/index.ts** - USED as domain exports entry point

---

## Next.js App Router Files (USED by Convention)

### Root Layout & Pages

- ✅ **src/app/[locale]/layout.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/page.tsx** - USED by Next.js App Router (home page)
- ✅ **src/app/layout.tsx** - USED by Next.js App Router (root layout)
- ✅ **src/app/page.tsx** - USED by Next.js App Router (fallback home)

### Error & Loading Pages

- ✅ **src/app/[locale]/error.tsx** - USED by Next.js App Router (error boundary)
- ✅ **src/app/[locale]/loading.tsx** - USED by Next.js App Router (loading UI)
- ✅ **src/app/[locale]/not-found.tsx** - USED by Next.js App Router (404 page)
- ✅ **src/app/not-found.tsx** - USED by Next.js App Router (fallback 404)

### Auth Routes

- ✅ **src/app/[locale]/login/layout.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/login/page.tsx** - USED by Next.js App Router
- ✅ **src/app/login/page.tsx** - USED by Next.js App Router (fallback login)
- ✅ **src/app/api/auth/[...nextauth]/route.ts** - USED by NextAuth

### Protected Routes

- ✅ **src/app/[locale]/(auth)/layout.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/(auth)/dashboard/page.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/(auth)/practices/page.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/(auth)/practices/add/page.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/(auth)/pharmacies/page.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/(auth)/pharmacies/add/page.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/(auth)/transactions/page.tsx** - USED by Next.js App Router
- ✅ **src/app/[locale]/(auth)/announcements/page.tsx** - USED by Next.js App Router

---

## Development/Testing Files

### Testing

- ⚠️ **src/app/[locale]/test-translations/page.tsx** - DEVELOPMENT ONLY (can be removed)

### Documentation

- 📄 **CLAUDE.md** - DOCUMENTATION (keep for reference)
- 📄 **GERMAN_ONLY_MIGRATION_PLAN.md** - DOCUMENTATION (keep for reference)

---

## Summary

### USED Files: 28 files

All translation files, routing files, middleware, auth components, and Next.js convention-based files are actively used.

### DEVELOPMENT ONLY: 1 file

- `src/app/[locale]/test-translations/page.tsx` - Can be removed in production

### DOCUMENTATION: 2 files

- `CLAUDE.md` - Keep for development reference
- `GERMAN_ONLY_MIGRATION_PLAN.md` - Keep for migration planning

### RECOMMENDATION

- Remove only: `src/app/[locale]/test-translations/page.tsx`
- Keep all other files as they are functionally required by the application
