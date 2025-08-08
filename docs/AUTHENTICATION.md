# OIDC Authentication & Authorization Infrastructure

This document describes the comprehensive OIDC (OpenID Connect) authentication and authorization infrastructure implemented for the THP AG Dashboard application.

## Overview

The authentication system provides:

- OIDC-based authentication with automatic token refresh
- Role-based access control (RBAC)
- Permission-based authorization
- Route protection
- API endpoint security
- Audit logging
- React components and hooks for UI integration

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   OIDC Provider │    │   Next.js App    │    │   PostgreSQL    │
│   (Zitadel)     │◄──►│   (Dashboard)    │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Authorization  │
                       │   Service        │
                       └──────────────────┘
```

## Core Components

### 1. Types (`src/infrastructure/auth/oidc/types.ts`)

- **User**: Enhanced user object with roles, groups, and permissions
- **Permission**: Resource-action-condition based permissions
- **Role**: Application roles with predefined permissions
- **AppRole**: Enum of application-specific roles
- **Resource/Action**: Enums for permission definitions

### 2. Authorization Service (`src/infrastructure/auth/oidc/authorization.ts`)

Provides centralized permission checking:

- `hasPermission()`: Check resource-action permissions
- `hasRole()`: Role-based access control
- `getUserPermissions()`: Get all user permissions
- `canAccessRoute()`: Route-level authorization
- `filterByPermissions()`: Data filtering based on permissions

### 3. OIDC Client (`src/infrastructure/auth/oidc/client.ts`)

Low-level OIDC client for:

- Provider discovery
- PKCE flow support
- Token exchange
- Token refresh
- User info retrieval

### 4. Provider Configuration (`src/infrastructure/auth/oidc/provider.ts`)

NextAuth provider configuration:

- OIDC integration
- Token handling
- Profile mapping
- Automatic refresh

### 5. Middleware (`src/infrastructure/auth/oidc/middleware.ts`)

Request-level authorization:

- Route protection
- API endpoint security
- Rate limiting
- CORS handling
- API key authentication

### 6. React Hooks (`src/infrastructure/auth/oidc/hooks.ts`)

- `useAuth()`: Main authentication hook
- `usePermission()`: Permission checking
- `useRole()`: Role checking
- `useAuthGuard()`: Route protection
- `useAccessibleMenu()`: Dynamic menu generation

### 7. React Components (`src/infrastructure/auth/oidc/components.tsx`)

- `AuthGuard`: Route-level protection
- `PermissionGate`: Permission-based rendering
- `RoleGate`: Role-based rendering
- `AdminOnly`: Admin-only content
- `ManagerOrHigher`: Manager+ content

## Roles and Permissions

### Application Roles

| Role            | Description                | Level |
| --------------- | -------------------------- | ----- |
| `admin`         | Full system access         | 5     |
| `manager`       | Management operations      | 4     |
| `senior_broker` | Senior broker operations   | 3     |
| `broker`        | Basic broker operations    | 2     |
| `viewer`        | Read-only access           | 1     |
| `auditor`       | Audit and reporting access | 1     |

### Resources

- `practice`: Medical practices
- `pharmacy`: Pharmacies
- `transaction`: Brokerage transactions
- `dashboard`: Dashboard access
- `user_management`: User management
- `settings`: System settings
- `reports`: Reports and analytics

### Actions

- `create`: Create new entities
- `read`: View entities
- `update`: Modify entities
- `delete`: Remove entities
- `list`: List/browse entities
- `export`: Export data
- `approve`: Approve transactions
- `reject`: Reject transactions

## Usage Examples

### 1. Protecting Routes

```tsx
import { AuthGuard } from "@domain/infrastructure/auth/oidc";

function PracticesPage() {
  return (
    <AuthGuard resource="practice" action="list">
      <PracticeList />
    </AuthGuard>
  );
}
```

### 2. Permission-based Components

```tsx
import { PermissionGate } from "@domain/infrastructure/auth/oidc";

function PracticeActions({ practice }) {
  return (
    <div>
      <PermissionGate resource="practice" action="update">
        <EditButton />
      </PermissionGate>
      <PermissionGate resource="practice" action="delete">
        <DeleteButton />
      </PermissionGate>
    </div>
  );
}
```

### 3. Using Hooks

```tsx
import { useAuth, usePermission } from "@domain/infrastructure/auth/oidc";

function MyComponent() {
  const { user, isAdmin } = useAuth();
  const { isAllowed } = usePermission("practice", "create");

  if (isAdmin()) {
    return <AdminPanel />;
  }

  return <div>{isAllowed && <CreatePracticeButton />}</div>;
}
```

### 4. API Route Protection

```tsx
import { withAuthorization } from "@domain/infrastructure/auth/oidc";

export const GET = withAuthorization(async (req) => {
  // Your API logic here
  return NextResponse.json({ data: "protected data" });
});
```

### 5. Higher-Order Components

```tsx
import { withPermission } from "@domain/infrastructure/auth/oidc";

const ProtectedComponent = withPermission("practice", "read")(MyComponent);
```

## Middleware Configuration

The global middleware (`middleware.ts`) provides:

- Automatic authentication for protected routes
- Role-based route access
- API endpoint protection
- Redirect handling

## Environment Variables

Required environment variables:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# OIDC Provider
OIDC_ISSUER=https://your-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret

# API Security
VALID_API_KEYS=key1,key2,key3
ALLOWED_ORIGINS=http://localhost:3000
```

## Security Features

### 1. Token Management

- Automatic token refresh
- Secure token storage in HTTP-only cookies
- Token expiration handling

### 2. Permission System

- Fine-grained permissions
- Context-aware conditions
- Dynamic permission evaluation

### 3. Audit Logging

- All permission checks logged
- User activity tracking
- Security event monitoring

### 4. Rate Limiting

- API endpoint protection
- Configurable limits per endpoint
- IP-based tracking

### 5. CORS Protection

- Configurable allowed origins
- Preflight request handling
- Security headers

## Error Handling

The system provides comprehensive error handling:

- Authentication failures
- Authorization denials
- Token refresh failures
- Network errors
- Invalid permissions

## Testing

### Permission Testing

```tsx
import { AuthorizationService } from "@domain/infrastructure/auth/oidc";

const user = {
  id: "1",
  roles: ["broker"],
  permissions: AuthorizationService.getUserPermissions(user),
};

const canCreate = AuthorizationService.hasPermission(
  user,
  "practice",
  "create"
);
expect(canCreate).toBe(true);
```

### Component Testing

```tsx
import { render } from "@testing-library/react";
import { AuthGuard } from "@domain/infrastructure/auth/oidc";

const MockedAuth = ({ children, user }) => (
  <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
);

test("renders content for authorized user", () => {
  const user = { roles: ["admin"] };
  render(
    <MockedAuth user={user}>
      <AuthGuard roles={["admin"]}>
        <div>Protected Content</div>
      </AuthGuard>
    </MockedAuth>
  );
});
```

## Performance Considerations

1. **Permission Caching**: User permissions are calculated once per session
2. **Lazy Loading**: Components only check permissions when needed
3. **Efficient Filtering**: Database-level filtering when possible
4. **Token Management**: Minimal token refresh overhead

## Best Practices

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Role Hierarchy**: Use role inheritance where appropriate
3. **Context-Aware Permissions**: Use conditions for data ownership
4. **Audit Everything**: Log all security-relevant events
5. **Fail Secure**: Deny access by default
6. **Regular Reviews**: Periodically review roles and permissions

## Migration and Deployment

### Database Migrations

- User roles and permissions tables
- Audit log tables
- Session storage tables

### Deployment Checklist

- [ ] Environment variables configured
- [ ] OIDC provider setup
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup procedures in place

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check user roles and permissions
2. **Token refresh failures**: Verify OIDC provider configuration
3. **Route access denied**: Check middleware configuration
4. **API access issues**: Verify API key configuration

### Debug Mode

Enable debug logging in development:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

This will provide detailed authentication and authorization logs.

## Future Enhancements

1. **Multi-tenant Support**: Tenant-based permission isolation
2. **Dynamic Roles**: Runtime role assignment
3. **SSO Integration**: Multiple identity provider support
4. **Advanced Audit**: Enhanced audit trail with retention policies
5. **Mobile Support**: Mobile app authentication flows
