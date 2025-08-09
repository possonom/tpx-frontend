# 📋 Systematic File Usage Analysis

**Date:** August 9, 2025  
**Repository:** tpx-frontend

## 🔍 Analysis Results

### ✅ **ESSENTIAL FILES (KEEP ALL)** - 28 files

#### **Core System Files**

| File                                               | Usage               | Reason                                                |
| -------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| `messages/de.json`                                 | ✅ USED             | Referenced by `src/i18n.ts` (dynamic import)          |
| `messages/en.json`                                 | ✅ USED             | Referenced by `src/i18n.ts` (dynamic import)          |
| `src/i18n.ts`                                      | ✅ USED             | Referenced by `next.config.ts` (createNextIntlPlugin) |
| `src/middleware.ts`                                | ✅ USED             | Next.js convention - auto-loaded for route protection |
| `src/domain/index.ts`                              | ✅ USED             | Domain exports - imported throughout app              |
| `src/infrastructure/auth/oidc/utils.ts`            | ✅ USED             | Auth utilities                                        |
| `src/presentation/components/LanguageSwitcher.tsx` | ⚠️ **NOT IMPORTED** | Component exists but no import found                  |

#### **Next.js App Router Files (Convention-Based)**

| File                                | Usage   | Purpose                          |
| ----------------------------------- | ------- | -------------------------------- |
| `src/app/layout.tsx`                | ✅ USED | Root layout (Next.js convention) |
| `src/app/page.tsx`                  | ✅ USED | Fallback home page               |
| `src/app/not-found.tsx`             | ✅ USED | Global 404 page                  |
| `src/app/login/page.tsx`            | ✅ USED | Fallback login page              |
| `src/app/[locale]/layout.tsx`       | ✅ USED | Locale-aware root layout         |
| `src/app/[locale]/page.tsx`         | ✅ USED | Locale-aware home page           |
| `src/app/[locale]/error.tsx`        | ✅ USED | Locale-aware error boundary      |
| `src/app/[locale]/loading.tsx`      | ✅ USED | Locale-aware loading UI          |
| `src/app/[locale]/not-found.tsx`    | ✅ USED | Locale-aware 404 page            |
| `src/app/[locale]/login/layout.tsx` | ✅ USED | Login layout                     |
| `src/app/[locale]/login/page.tsx`   | ✅ USED | Locale-aware login page          |

#### **API Routes**

| File                                      | Usage   | Purpose              |
| ----------------------------------------- | ------- | -------------------- |
| `src/app/api/auth/[...nextauth]/route.ts` | ✅ USED | NextAuth API handler |

#### **Protected Application Routes**

| File                                              | Usage   | Purpose               |
| ------------------------------------------------- | ------- | --------------------- |
| `src/app/[locale]/(auth)/layout.tsx`              | ✅ USED | Protected area layout |
| `src/app/[locale]/(auth)/dashboard/page.tsx`      | ✅ USED | Dashboard page        |
| `src/app/[locale]/(auth)/practices/page.tsx`      | ✅ USED | Practices listing     |
| `src/app/[locale]/(auth)/practices/add/page.tsx`  | ✅ USED | Add practice form     |
| `src/app/[locale]/(auth)/pharmacies/page.tsx`     | ✅ USED | Pharmacies listing    |
| `src/app/[locale]/(auth)/pharmacies/add/page.tsx` | ✅ USED | Add pharmacy form     |
| `src/app/[locale]/(auth)/transactions/page.tsx`   | ✅ USED | Transactions page     |
| `src/app/[locale]/(auth)/announcements/page.tsx`  | ✅ USED | Announcements page    |

---

### ⚠️ **QUESTIONABLE FILES** - 1 file

| File                                               | Status                | Recommendation                   |
| -------------------------------------------------- | --------------------- | -------------------------------- |
| `src/presentation/components/LanguageSwitcher.tsx` | Not imported anywhere | **ORPHANED** - Consider removing |

---

### 🧪 **DEVELOPMENT/TESTING FILES** - 1 file

| File                                          | Purpose             | Recommendation           |
| --------------------------------------------- | ------------------- | ------------------------ |
| `src/app/[locale]/test-translations/page.tsx` | Translation testing | **REMOVE** in production |

---

### 📚 **DOCUMENTATION FILES** - 2 files

| File                            | Purpose                   | Recommendation                |
| ------------------------------- | ------------------------- | ----------------------------- |
| `CLAUDE.md`                     | Development documentation | **KEEP** for reference        |
| `GERMAN_ONLY_MIGRATION_PLAN.md` | Migration planning        | **KEEP** for future reference |

---

## 🎯 **FINAL RECOMMENDATIONS**

### Files to Remove (3 files):

1. **`src/app/[locale]/test-translations/page.tsx`** - Development testing only
2. **`src/presentation/components/LanguageSwitcher.tsx`** - Orphaned component (not imported)
3. **`src/lib/german-text.ts`** - Legacy translation system (already identified)

### Files to Keep (All others):

- All Next.js convention-based routing files are essential
- Translation system files are actively used
- API routes are functional
- Documentation files provide valuable context

---

## 📊 **Summary Statistics**

- **Total Untracked Files Analyzed:** 32
- **Essential Files:** 28 (87.5%)
- **Development/Testing Files:** 1 (3.1%)
- **Documentation Files:** 2 (6.25%)
- **Orphaned Files:** 1 (3.1%)

**Cleanup Impact:** Removing 3 files will eliminate unused code while preserving all functional components.
