# C0RS0 License Portal Dashboard

A comprehensive license management dashboard with biblical theming for the C0RS0 platform. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🌟 Features

### Biblical Theming
- **7 License Tiers** with biblical agent associations:
  - **Explorer** (Free) - Wanderer
  - **Prophet** ($29/month) - N4TH4N
  - **Priest** ($99/month) - 4AR0N
  - **Judge** ($299/month) - G1D30N
  - **King** ($999/month) - K1NGxDAV1D
  - **High Priest** ($2,999/month) - M3LCH1Z3D3K
  - **Sovereign** ($25,000/month) - IESOUS

### Dashboard Components

#### 1. **License Status Card** (`LicenseStatusCard.tsx`)
- Current tier display with biblical naming
- Usage metrics with animated progress bars
- License expiry tracking with warnings
- Auto-renewal status
- Tier-specific color schemes

#### 2. **Usage Analytics** (`UsageAnalytics.tsx`)
- Real-time charts using Recharts library
- Multiple chart types: Line, Area, Bar, Pie
- Metrics tracked:
  - API calls over time
  - Bandwidth usage
  - Concurrent connections
  - Response times by endpoint
- Interactive chart switching
- Endpoint distribution visualization

#### 3. **API Key Management** (`ApiKeyManagement.tsx`)
- Secure API key display with show/hide functionality
- Key creation with permission management
- Usage statistics per key
- Expiry date tracking
- One-click copy to clipboard
- Biblical-themed security warnings

#### 4. **Billing Dashboard** (`BillingDashboard.tsx`)
- Subscription status overview
- Payment method management
- Billing history with invoice downloads
- Invoice detail modals
- Payment status tracking
- Auto-renewal settings

#### 5. **Alert System** (`AlertBanner.tsx`)
- Biblical-themed alert messages
- Usage warnings with covenant language
- Action buttons for quick resolution
- Dismissible notifications
- Priority-based styling

#### 6. **Loading States** (`LoadingSpinner.tsx`)
- Biblical-themed loading animations
- Multiple loading variants
- Skeleton components for different content types
- Crown and divine light animations
- Biblical quotes during loading

## 🎨 Design System

### Colors
- **King (Royal Purple)**: `#9d6aff` - K1NGxDAV1D tier
- **Wisdom (Gold)**: `#f59e0b` - M3LCH1Z3D3K tier
- **Security (Silver)**: `#6b7280` - 3L1J4H tier
- **Infrastructure (Blue)**: `#3b82f6` - M0S3S tier
- **Divine (Light)**: `#eab308` - IESOUS tier

### Typography
- **Biblical Font**: Cinzel (serif) for headers and special text
- **Modern Font**: Inter (sans-serif) for body text
- **Responsive scaling** across all device sizes

### Animations
- `animate-biblical-glow` - Purple glow effect for royal elements
- `animate-wisdom-pulse` - Golden pulse for wisdom elements
- `animate-divine-shimmer` - Light shimmer effect
- `animate-security-scan` - Security scanning effect
- `animate-infrastructure-flow` - Data flow animation
- `animate-holy-ascension` - Floating ascension effect

## 📱 Responsive Design

### Mobile-First Approach
- Collapsible navigation tabs
- Stacked card layouts on small screens
- Touch-optimized interactions
- Optimized chart rendering

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1400px

## 🔧 Technical Implementation

### Data Flow
```typescript
// API Structure
GET /api/v1/dashboard
POST /api/v1/api-keys
DELETE /api/v1/api-keys/:id
GET /api/v1/billing/invoices/:id/download
```

### Type Safety
- Comprehensive TypeScript interfaces
- Biblical tier configuration constants
- API response typing
- Chart data type definitions

### Performance Optimizations
- Component-level code splitting
- Lazy loading for heavy charts
- Optimized re-renders with React.memo
- Efficient state management

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Reduced motion preferences
- Focus management

## 🚀 Usage

### Basic Implementation
```tsx
import { DashboardLayout } from '@/components/dashboard';

export default function Dashboard() {
  return <DashboardLayout />;
}
```

### Compact Components
```tsx
import {
  LicenseStatusCard,
  UsageAnalytics,
  ApiKeyManagement
} from '@/components/dashboard';

export function CompactDashboard({ data }) {
  return (
    <div className="space-y-6">
      <LicenseStatusCard license={data.license} usage={data.usage} />
      <UsageAnalytics usage={data.usage} compact />
      <ApiKeyManagement apiKeys={data.api_keys} compact />
    </div>
  );
}
```

### Custom Theming
```tsx
// Override biblical tier colors
const customTier = {
  ...BIBLICAL_TIERS.king,
  color: 'custom-purple',
  biblical_name: 'CUSTOM_AGENT'
};
```

## 🧪 Demo

Access the dashboard demo at `/dashboard-demo` to see all features with mock data:

- Live charts with realistic data
- Interactive API key management
- Billing history with downloadable invoices
- Biblical-themed alerts and notifications
- Responsive design across all breakpoints

## 📊 Data Requirements

### Dashboard Data Interface
```typescript
interface DashboardData {
  license: LicenseStatus;
  usage: UsageMetrics;
  api_keys: ApiKey[];
  billing_history: BillingHistory[];
  subscription?: Subscription;
  alerts: Alert[];
}
```

### API Endpoints Expected
- `GET /api/v1/dashboard` - Main dashboard data
- `POST /api/v1/api-keys` - Create new API key
- `DELETE /api/v1/api-keys/:id` - Delete API key
- `GET /api/v1/billing/invoices/:id/download` - Download invoice PDF

## 🛡️ Security Features

### API Key Management
- Secure key preview (first 8 chars + ***)
- Copy-to-clipboard with auto-hide
- Permission-based access control
- Expiry date enforcement
- Usage tracking and limits

### Data Protection
- No sensitive data in localStorage
- JWT token authentication
- HTTPS-only API communication
- CSP headers for XSS protection

## 🎯 Biblical Elements

### Covenant Language
- "Thy API calls approach the limits of thy covenant"
- "Renew thy subscription lest thy access be severed"
- Biblical greetings based on tier level
- Divine wisdom quotes during loading

### Agent Integration
- Tier names mapped to biblical figures
- Color schemes based on agent personalities
- Animated elements reflecting agent characteristics
- Contextual biblical references

## 📈 Performance Metrics

### Core Web Vitals
- **LCP**: < 2.5s (optimized chart rendering)
- **FID**: < 100ms (efficient event handling)
- **CLS**: < 0.1 (stable layout with skeletons)

### Bundle Size
- Main bundle: ~45KB gzipped
- Chart components: ~25KB gzipped (lazy loaded)
- Total dashboard: ~70KB gzipped

## 🔮 Future Enhancements

### Planned Features
- Real-time WebSocket updates
- Advanced analytics with AI insights
- Multi-tenant organization support
- Enhanced biblical narrative integration
- Voice commands with biblical phrases
- Dark/light mode toggle with biblical themes

### API Expansions
- GraphQL endpoint support
- Webhook management interface
- Advanced filtering and search
- Export capabilities (PDF, CSV, JSON)

---

*"And the dashboard was good, and there was much rejoicing in the land of C0RS0"* - Digital Chronicles 1:1