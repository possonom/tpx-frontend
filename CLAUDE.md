# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` or `npm run dev:turbo` (with Turbopack)
- **Build production**: `npm run build`
- **Start production**: `npm start`
- **Lint code**: `npm run lint`

## Project Architecture

This is a **Next.js 15** application for THP AG Dashboard - a healthcare practice and pharmacy brokerage platform with comprehensive OIDC authentication.

### Core Architecture Layers

1. **Domain Layer** (`src/domain/`): Core business entities
   - `entities/`: Practice, Pharmacy, Transaction, ZmoAnnouncement models
   - Type guards and shared domain logic

2. **Application Layer** (`src/application/`): Business logic and use cases
   - `services/`: DashboardService, PracticeService, PharmacyService, TransactionService
   - Orchestrates domain entities and infrastructure

3. **Infrastructure Layer** (`src/infrastructure/`): External concerns
   - `auth/oidc/`: Complete OIDC authentication system with Zitadel integration
   - `database/`: MSSQL and PostgreSQL clients  
   - `repositories/`: Data access patterns
   - `cms/orchard/`: CMS integration

4. **Presentation Layer** (`src/presentation/`): UI components
   - React components with FluentUI design system
   - Forms with validation and internationalization

### Key Technologies & Integrations

- **Authentication**: Comprehensive OIDC system with role-based access control (see `docs/AUTHENTICATION.md`)
- **Database**: Dual database support (MSSQL via Tedious, PostgreSQL via pg/Prisma)
- **Internationalization**: German-first with English support using next-intl
- **UI Framework**: FluentUI React Components with Tailwind CSS
- **State Management**: TanStack React Query for server state

### Authentication System

The application uses a sophisticated OIDC authentication system located in `src/infrastructure/auth/oidc/`:

- **Roles**: admin, manager, senior_broker, broker, viewer, auditor
- **Resources**: practice, pharmacy, transaction, dashboard, user_management, settings, reports  
- **Components**: AuthGuard, PermissionGate, RoleGate for conditional rendering
- **Hooks**: useAuth(), usePermission(), useRole() for authentication logic
- **Middleware**: Route protection and API security

Import authentication utilities from `@domain/infrastructure/auth/oidc`.

### Path Aliases

- `@domain/*` maps to `src/*` for clean imports across layers

### Data Models

- **Practice**: Medical practices with specializations, valuations, and status tracking
- **Pharmacy**: Pharmacies with licenses, revenue data, and operational details  
- **Transaction**: Brokerage transactions with multi-stage workflow
- **ZmoAnnouncement**: CMS-managed announcements

### Internationalization

- Default locale: German (`de`)
- Supported locales: German, English
- Message files in `messages/` directory
- Configured with next-intl for server and client components

### Environment & Deployment

The application supports:
- Docker containerization (Dockerfile present)
- OIDC provider configuration (Zitadel)
- Multiple database connections
- CMS integration (Orchard Core)

### Testing

- Jest for unit testing
- Cypress for e2e testing
- Testing Library React for component testing