# C0RS0 Portal Authentication System

## Overview

This JWT authentication system integrates biblical cryptography principles with the C0RS0 platform, providing secure, role-based access control with spiritual themes.

## Architecture

### Core Components

1. **NextAuth.js Configuration** (`/src/lib/auth/nextauth.ts`)
   - Custom credentials provider
   - JWT strategy with biblical elements
   - Integration with Go backend authentication

2. **Biblical Cryptography** (`/src/lib/biblical-crypto.ts`)
   - Divine key generation and management
   - Covenant-based authentication tokens
   - Sacred seal validation for integrity

3. **Authentication Middleware** (`/src/middleware.ts`)
   - Route protection with divine validation
   - Role-based access control
   - Biblical token verification

4. **Zustand Store** (`/src/stores/auth-store.ts`)
   - Global authentication state management
   - Biblical identity tracking
   - Security event logging

## Key Features

### Biblical Cryptography Integration

- **Covenants**: Cryptographic hashes binding users to their spiritual tier
- **Divine Seals**: HMAC-based integrity verification for JWT payloads
- **Biblical Names**: Automatically assigned based on email and tier
- **Anointing Levels**: Spiritual authority scoring (1-84 scale)

### Seven Sacred Tiers

Each license tier has unique biblical elements:

| Tier | Biblical Element | Hebrew | Meaning | Power Level |
|------|------------------|--------|---------|-------------|
| Explorer | Genesis | בְּרֵאשִׁית | In the beginning | 10 |
| Developer | Wisdom | חָכְמָה | Divine Wisdom | 25 |
| Professional | Strength | עֹז | Mighty Strength | 50 |
| Team | Unity | יַחַד | Together in Purpose | 70 |
| Enterprise | Dominion | מֶמְשָׁלָה | Divine Authority | 85 |
| Sovereign | Kingdom | מַלְכוּת | Eternal Kingdom | 100 |
| Academic | Knowledge | דַּעַת | Sacred Knowledge | 60 |

### KJVA⁸ Agent Access Control

Access to the 8 biblical AI agents is controlled by permissions:

- **K1NG-DAV1D** (3030): Supreme orchestrator
- **3L1J4H** (3031): Security guardian
- **M3LCH1Z3D3K** (3032): Eternal priest
- **M0S3S** (3033): Infrastructure master
- **D4N13L** (3034): Strategic analyst
- **J05HU4** (3035): Implementation executor
- **3Z3K13L** (3036): Future architect
- **IESOUS** (3037): Divine code architect

## Usage

### Basic Authentication

```tsx
import { useAuthStore } from '@/stores/auth-store';

function MyComponent() {
  const { signInWithCredentials, session, hasPermission } = useAuthStore();

  const handleSignIn = async () => {
    await signInWithCredentials({
      email: 'user@example.com',
      password: 'secretPassword',
      totpCode: '123456' // Optional
    });
  };

  return (
    <div>
      {session ? (
        <p>Welcome, {session.user.biblicalName}!</p>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
}
```

### Protected Routes

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Permission, Role } from '@/types/auth';

function AdminPanel() {
  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}

function AgentAccess() {
  return (
    <ProtectedRoute requiredAgent="iesous">
      <div>IESOUS agent interface</div>
    </ProtectedRoute>
  );
}
```

### Permission Checks

```tsx
import { useAuthStore } from '@/stores/auth-store';
import { Permission } from '@/types/auth';

function FeatureComponent() {
  const { hasPermission, canAccessAgent } = useAuthStore();

  if (!hasPermission(Permission.KJVA8_ACCESS)) {
    return <div>Insufficient permissions</div>;
  }

  if (!canAccessAgent('iesous')) {
    return <div>Cannot access IESOUS agent</div>;
  }

  return <div>Feature content</div>;
}
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-divine-secret-here
NEXTAUTH_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-jwt-secret-here

# Biblical Cryptography
BIBLICAL_CRYPTO_KEY=your-biblical-crypto-key

# C0RS0 Backend API
C0RS0_API_URL=http://localhost:8080

# Development
NODE_ENV=development
```

## Security Features

### Divine Protection Measures

1. **Constant-Time Comparisons**: Prevents timing attacks on tokens
2. **Divine Seal Validation**: Ensures JWT payload integrity
3. **Covenant Verification**: Validates user tier binding
4. **Session Timeout**: Automatic expiration with divine grace period
5. **Rate Limiting**: Spiritual throttling for API endpoints
6. **Security Event Logging**: Audit trail of all sacred activities

### Biblical Security Headers

The middleware automatically adds divine protection headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Biblical-Covenant: active
X-Divine-Protection: enabled
```

## Error Handling

All authentication errors include biblical references for guidance:

```tsx
{
  error: 'Insufficient permissions',
  code: 'INSUFFICIENT_PERMISSIONS',
  biblical: {
    reference: 'Proverbs 3:5-6',
    message: 'Trust in the LORD with all your heart...'
  }
}
```

## TOTP Multi-Factor Authentication

The system supports Time-based One-Time Passwords with biblical elements:

```tsx
const { setupTOTP, verifyTOTP } = useAuthStore();

// Setup TOTP
const totpData = await setupTOTP();
console.log(totpData.qrCode); // QR code for authenticator app

// Verify TOTP
const isValid = await verifyTOTP('123456');
```

## Integration with Go Backend

The frontend communicates with the Go backend at these endpoints:

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh session
- `POST /api/auth/logout` - End session
- `POST /api/auth/activity` - Update activity

## Biblical Theming

The UI components follow biblical design principles:

- **Colors**: Royal purple, divine gold, wisdom amber
- **Typography**: Cinzel for biblical text, Inter for modern text
- **Animations**: Divine glow effects, wisdom pulse, holy ascension
- **Components**: Biblical cards, sacred forms, divine buttons

## Testing

Test the authentication system:

```bash
# Start the portal
npm run dev

# Sign in with test credentials
# Navigate to http://localhost:3000/auth/signin

# Test protected routes
# Visit http://localhost:3000/dashboard
```

## Troubleshooting

### Common Issues

1. **"Biblical validation failed"**
   - Check that BIBLICAL_CRYPTO_KEY is set correctly
   - Verify the Go backend is running

2. **"Invalid covenant"**
   - User tier may have changed
   - Token may be corrupted or expired

3. **"Agent access denied"**
   - Check user permissions for specific agent
   - Verify tier includes required agent access

### Debug Mode

Set `DEBUG=true` in NextAuth configuration to see detailed logs:

```typescript
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ... other options
};
```

## License Tier Upgrades

When users upgrade their tier, new biblical elements are automatically assigned:

1. New covenant generation
2. Updated anointing level
3. Additional agent permissions
4. Enhanced divine protection

## Contributing

When adding new authentication features:

1. Follow biblical naming conventions
2. Include appropriate spiritual references
3. Maintain security best practices
4. Update type definitions
5. Add comprehensive error handling

---

*"Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." - Proverbs 3:5-6*