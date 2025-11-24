# Admin Dashboard System

## Overview

The Admin Dashboard provides a comprehensive administrative interface for monitoring, managing, and configuring the There platform. It includes real-time analytics, user management, role configuration, emotional intelligence monitoring, feedback moderation, and system health tracking.

**Created:** 2025-01-20  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [Backend API](#backend-api)
4. [Frontend Components](#frontend-components)
5. [Security & Access Control](#security--access-control)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Architecture

### Tech Stack

**Backend:**
- Node.js with TypeScript
- Express.js for REST API
- Prisma ORM with PostgreSQL
- JWT-based authentication
- Role-based access control (RBAC)

**Frontend:**
- React with TypeScript
- Material-UI (MUI) components
- Axios for API calls
- React Hooks for state management

### File Structure

```
Backend:
├── src/controllers/adminController.ts    (523 lines - 10 endpoints)
├── src/routes/adminRoutes.ts             (Updated with admin routes)
└── src/middleware/authMiddleware.ts      (Role-based access control)

Frontend:
├── src/services/adminService.ts          (168 lines - API client)
└── src/pages/admin/
    ├── SystemAnalyticsPage.tsx           (217 lines)
    ├── UserMetricsPage.tsx               (278 lines)
    ├── RoleManagementPage.tsx            (207 lines)
    ├── EmotionalIntelligencePage.tsx     (280 lines)
    ├── FeedbackModerationPage.tsx        (258 lines)
    ├── SystemHealthPage.tsx              (292 lines)
    └── index.ts                          (Exports)
```

### Admin Roles

```typescript
enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',      // Full access to all operations
  CONFIG_MANAGER = 'CONFIG_MANAGER', // Manage configurations and roles
  VIEWER = 'VIEWER'                  // Read-only access
}
```

**Permission Matrix:**

| Feature | SUPER_ADMIN | CONFIG_MANAGER | VIEWER |
|---------|-------------|----------------|--------|
| View Analytics | ✅ | ✅ | ✅ |
| View User Metrics | ✅ | ✅ | ✅ |
| Update Admin Roles | ✅ | ❌ | ❌ |
| Manage Role Templates | ✅ | ✅ | ❌ |
| Delete Role Templates | ✅ | ❌ | ❌ |
| View Emotional Config | ✅ | ✅ | ✅ |
| View Feedback/Logs | ✅ | ✅ | ✅ |
| View System Health | ✅ | ✅ | ✅ |

---

## Features

### 1. System Analytics & User Metrics ✅

**SystemAnalyticsPage.tsx** - Comprehensive dashboard showing:
- **Summary Cards:**
  - Total Users (with active count)
  - Total Messages (with avg per user)
  - Engagement Rate (percentage)
  - Total Relationships (with admin count)
- **Time Range Selector:** 7, 30, 90, 365 days
- **Emotional Tone Distribution:** Visual progress bars
- **Usage Events:** Event type breakdown with counts
- **Recent Activity:** Last 10 audit logs

**UserMetricsPage.tsx** - User management dashboard:
- **User Table:** Email, display name, provider, counts, admin role, join date
- **Search:** Real-time filtering by email/name
- **Pagination:** 10/20/50 rows per page
- **Admin Role Management:**
  - Update admin role dialog
  - Remove admin privileges
  - Role descriptions (SUPER_ADMIN, CONFIG_MANAGER, VIEWER)

**API Endpoints:**
```
GET /api/admin/analytics/system?timeRange=30
GET /api/admin/users/metrics?page=1&limit=20&search=query
PUT /api/admin/users/admin-role
DELETE /api/admin/users/admin-role/:userId
```

### 2. Role Configuration & Management ✅

**RoleManagementPage.tsx** - Role template management:
- **Template Table:** Type, key, display name, description, usage count
- **Create/Edit Dialog:**
  - Type selector (FATHER, MOTHER, SIBLING, MENTOR, CUSTOM)
  - Key input (unique identifier)
  - Display name and description
- **Delete Protection:** Cannot delete templates in use
- **Usage Tracking:** Shows relationship count per template

**API Endpoints:**
```
GET /api/admin/roles/templates
POST /api/admin/roles/templates
DELETE /api/admin/roles/templates/:id
```

**Role Template Schema:**
```typescript
interface RoleTemplate {
  id: string;
  type: 'FATHER' | 'MOTHER' | 'SIBLING' | 'MENTOR' | 'CUSTOM';
  key: string;
  displayName: string;
  description?: string;
  _count?: {
    relationships: number;
  };
}
```

### 3. Emotional Intelligence Tuning ✅

**EmotionalIntelligencePage.tsx** - Emotional tone monitoring:
- **Growth Metrics Cards:**
  - Positive Growth %
  - Neutral Growth %
  - Negative Growth %
  - Mixed Growth %
- **Tone Distribution:** Linear progress bars with percentages
- **Recent Trends:** 7-day daily tone breakdown
- **Visual Icons:** Sentiment-based icons for each tone

**API Endpoint:**
```
GET /api/admin/emotional/config
```

**Response Schema:**
```typescript
interface EmotionalConfig {
  toneStatistics: Array<{
    tone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';
    count: number;
    percentage: number;
  }>;
  growthMetrics: {
    positiveGrowth: number;
    neutralGrowth: number;
    negativeGrowth: number;
    mixedGrowth: number;
  };
  emotionalTrends: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    mixed: number;
  }>;
}
```

### 4. User Feedback & Moderation ✅

**FeedbackModerationPage.tsx** - Audit log viewer:
- **Audit Log Table:** User, action, entity type/ID, timestamp
- **Action Filter:** All, CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- **Pagination:** 10/20/50/100 rows per page
- **Detail Dialog:**
  - Full user information
  - Action with color-coded chip
  - Entity details
  - JSON metadata viewer

**API Endpoint:**
```
GET /api/admin/feedback?page=1&limit=20&type=CREATE
```

**Action Color Coding:**
- CREATE: Green (success)
- UPDATE: Blue (info)
- DELETE: Red (error)
- LOGIN: Primary
- LOGOUT: Default

### 5. System Health Monitoring ✅

**SystemHealthPage.tsx** - Real-time system status:
- **Overall Status:** Health score (0-100) with color indicator
- **Component Status Cards:**
  - Database: Status, latency, message
  - API: Status, operational message
  - Errors: Status, error count
- **System Metrics:**
  - Total Users
  - Active Users (24h)
  - Total Messages
  - Messages (24h)
  - Average Response Time
- **Auto-Refresh:** Toggle 30-second auto-refresh
- **Manual Refresh:** Refresh now button

**API Endpoint:**
```
GET /api/admin/health
```

**Health Response Schema:**
```typescript
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  healthScore: number; // 0-100
  components: {
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency: number;
      message: string;
    };
    api: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      message: string;
    };
    errors: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      count: number;
      message: string;
    };
  };
  metrics: {
    totalUsers: number;
    activeUsers24h: number;
    totalMessages: number;
    messages24h: number;
    avgResponseTime: number;
  };
  timestamp: string;
}
```

**Health Calculation:**
- Healthy: 80-100 score
- Degraded: 50-79 score
- Unhealthy: 0-49 score

---

## Backend API

### Admin Controller (`src/controllers/adminController.ts`)

#### 1. getSystemAnalytics

```typescript
GET /api/admin/analytics/system?timeRange=30

Query Parameters:
- timeRange: number (days: 7, 30, 90, 365)

Response:
{
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalRelationships: number;
    totalMessages: number;
    engagementRate: number;
  };
  userGrowth: Array<{ date: string; count: number }>;
  messagesByTone: Array<{ tone: string; count: number }>;
  usageByType: Array<{ type: string; count: number }>;
  relationshipsByRole: Array<{ roleKey: string; count: number }>;
  recentAuditLogs: AuditLog[];
}
```

#### 2. getUserMetrics

```typescript
GET /api/admin/users/metrics?page=1&limit=20&search=query

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- search: string (optional)

Response:
{
  users: Array<{
    id: string;
    email: string;
    authProvider: string;
    createdAt: string;
    profile?: { displayName: string };
    adminProfile?: { role: string };
    _count: {
      relationships: number;
      messages: number;
      usageEvents: number;
    };
  }>;
  total: number;
  page: number;
  limit: number;
}
```

#### 3. getRoleTemplates

```typescript
GET /api/admin/roles/templates

Response:
Array<{
  id: string;
  type: string;
  key: string;
  displayName: string;
  description?: string;
  _count: { relationships: number };
}>
```

#### 4. upsertRoleTemplate

```typescript
POST /api/admin/roles/templates

Body:
{
  id?: string;
  type: 'FATHER' | 'MOTHER' | 'SIBLING' | 'MENTOR' | 'CUSTOM';
  key: string;
  displayName: string;
  description?: string;
}

Response:
{
  message: string;
  template: RoleTemplate;
}
```

**Validation:**
- Type: Required enum value
- Key: Required string, unique
- Display Name: Required string

#### 5. deleteRoleTemplate

```typescript
DELETE /api/admin/roles/templates/:id

Response:
{
  message: string;
}

Error (if in use):
{
  error: string;
  usageCount: number;
}
```

#### 6. getEmotionalConfig

```typescript
GET /api/admin/emotional/config

Response:
{
  toneStatistics: Array<{ tone: string; count: number; percentage: number }>;
  growthMetrics: {
    positiveGrowth: number;
    neutralGrowth: number;
    negativeGrowth: number;
    mixedGrowth: number;
  };
  emotionalTrends: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    mixed: number;
  }>;
}
```

#### 7. getUserFeedback

```typescript
GET /api/admin/feedback?page=1&limit=20&type=CREATE

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- type: string (optional: CREATE, UPDATE, DELETE, etc.)

Response:
{
  logs: Array<{
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata: any;
    timestamp: string;
    user: { email: string; profile?: { displayName: string } };
  }>;
  total: number;
  page: number;
  limit: number;
}
```

#### 8. getSystemHealth

```typescript
GET /api/admin/health

Response:
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  healthScore: number;
  components: {
    database: { status: string; latency: number; message: string };
    api: { status: string; message: string };
    errors: { status: string; count: number; message: string };
  };
  metrics: {
    totalUsers: number;
    activeUsers24h: number;
    totalMessages: number;
    messages24h: number;
    avgResponseTime: number;
  };
  timestamp: string;
}
```

#### 9. updateAdminRole

```typescript
PUT /api/admin/users/admin-role

Body:
{
  userId: string;
  role: 'SUPER_ADMIN' | 'CONFIG_MANAGER' | 'VIEWER';
}

Response:
{
  message: string;
  adminProfile: { userId: string; role: string };
}
```

**Access:** SUPER_ADMIN only

#### 10. removeAdmin

```typescript
DELETE /api/admin/users/admin-role/:userId

Response:
{
  message: string;
}
```

**Access:** SUPER_ADMIN only  
**Protection:** Cannot remove self

---

## Frontend Components

### Admin Service (`frontend/src/services/adminService.ts`)

```typescript
class AdminService {
  getSystemAnalytics(timeRange: number): Promise<SystemAnalytics>
  getUserMetrics(page: number, limit: number, search?: string): Promise<UserMetrics>
  getRoleTemplates(): Promise<RoleTemplate[]>
  upsertRoleTemplate(template: Partial<RoleTemplate>): Promise<RoleTemplate>
  deleteRoleTemplate(id: string): Promise<void>
  getEmotionalConfig(): Promise<EmotionalConfig>
  getUserFeedback(page: number, limit: number, type?: string): Promise<PaginatedLogs>
  getSystemHealth(): Promise<SystemHealth>
  updateAdminRole(userId: string, role: string): Promise<AdminProfile>
  removeAdmin(userId: string): Promise<void>
}

export default new AdminService();
```

### Component Features

**Common Features Across All Pages:**
- ✅ Loading states with CircularProgress
- ✅ Error handling with Alert components
- ✅ Success notifications
- ✅ Responsive Material-UI layout
- ✅ TypeScript type safety
- ✅ React Hooks (useState, useEffect)

**Interactive Components:**
- Tables with sorting and pagination
- Search and filter functionality
- Create/Edit/Delete dialogs
- Real-time data refresh
- Color-coded status indicators
- Expandable detail views

---

## Security & Access Control

### Authentication Flow

1. User logs in → JWT token issued
2. Token stored in localStorage/cookies
3. Axios interceptor adds token to requests
4. Backend verifies token via `authenticate` middleware
5. Role checked via `requireRole` middleware

### Middleware Chain

```typescript
// Example protected route
router.get(
  '/analytics/system',
  authenticate,
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER', 'VIEWER']),
  adminController.getSystemAnalytics
);
```

### Audit Logging

All admin actions are logged:
```typescript
await prisma.auditLog.create({
  data: {
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'RoleTemplate',
    entityId: template.id,
    metadata: { changes: ... }
  }
});
```

### Data Protection

- ✅ Password hashing (bcrypt)
- ✅ JWT token expiration
- ✅ Role-based access control
- ✅ Input validation (Zod schemas)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React sanitization)
- ✅ CSRF protection
- ✅ Rate limiting

---

## Usage Examples

### Creating a New Admin

```typescript
// 1. SUPER_ADMIN creates admin via UserMetricsPage
await adminService.updateAdminRole('user-id', 'CONFIG_MANAGER');

// 2. Backend creates AdminProfile
const adminProfile = await prisma.adminProfile.create({
  data: {
    userId: 'user-id',
    role: 'CONFIG_MANAGER'
  }
});

// 3. Audit log created
await prisma.auditLog.create({
  data: {
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'AdminProfile',
    entityId: adminProfile.id
  }
});
```

### Viewing System Health

```typescript
// Frontend component
const SystemHealthPage = () => {
  const [health, setHealth] = useState(null);
  
  useEffect(() => {
    const loadHealth = async () => {
      const data = await adminService.getSystemHealth();
      setHealth(data);
    };
    loadHealth();
  }, []);
  
  return (
    <Box>
      <Typography>Status: {health.status}</Typography>
      <Typography>Score: {health.healthScore}</Typography>
      <Typography>DB Latency: {health.components.database.latency}ms</Typography>
    </Box>
  );
};
```

### Managing Role Templates

```typescript
// Create template
const template = await adminService.upsertRoleTemplate({
  type: 'CUSTOM',
  key: 'mentor-tech',
  displayName: 'Tech Mentor',
  description: 'A mentor focused on technology guidance'
});

// Delete template (only if not in use)
try {
  await adminService.deleteRoleTemplate(template.id);
} catch (error) {
  // Error: Template is in use by 5 relationships
}
```

---

## Testing

### Unit Tests

```typescript
// Test admin controller
describe('AdminController', () => {
  it('should get system analytics', async () => {
    const req = { user: { id: 'admin-id' }, query: { timeRange: '30' } };
    const res = { json: jest.fn() };
    await adminController.getSystemAnalytics(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      summary: expect.any(Object),
      userGrowth: expect.any(Array)
    }));
  });
});
```

### Integration Tests

```typescript
// Test admin routes
describe('Admin Routes', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/admin/analytics/system')
      .expect(401);
  });
  
  it('should return analytics for admin', async () => {
    const token = generateToken({ id: 'admin-id', role: 'SUPER_ADMIN' });
    const response = await request(app)
      .get('/api/admin/analytics/system')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body).toHaveProperty('summary');
  });
});
```

### E2E Tests

```typescript
// Test admin dashboard flow
describe('Admin Dashboard E2E', () => {
  it('should allow SUPER_ADMIN to manage users', async () => {
    await page.goto('/admin/users');
    await page.click('[data-testid="edit-user-btn"]');
    await page.select('[name="role"]', 'CONFIG_MANAGER');
    await page.click('[data-testid="save-btn"]');
    await page.waitForSelector('[data-testid="success-alert"]');
  });
});
```

---

## Deployment

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/there
JWT_SECRET=your-secret-key
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.there.com
VITE_APP_ENV=production
```

### Build Commands

```bash
# Backend
cd /workspaces/There
npm run build
npm start

# Frontend
cd /workspaces/There/frontend
npm run build
# Builds to: frontend/dist
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]

# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Database Migrations

```bash
# Run migrations
npx prisma migrate deploy

# Seed initial admin
npx prisma db seed
```

### Monitoring

- **Health Endpoint:** `GET /api/admin/health`
- **Metrics:** Prometheus-compatible metrics
- **Logging:** Winston logger with daily rotation
- **Alerts:** Health score < 50 triggers alert

---

## Roadmap

### Completed ✅
- System analytics with time ranges
- User metrics and admin management
- Role template configuration
- Emotional intelligence monitoring
- Feedback and audit logging
- System health monitoring

### Future Enhancements 🚀
- [ ] Export analytics to CSV/PDF
- [ ] Real-time WebSocket updates
- [ ] Custom dashboard widgets
- [ ] Advanced filtering and search
- [ ] Scheduled reports via email
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Mobile responsive improvements
- [ ] GraphQL API alternative
- [ ] Advanced charting (Chart.js/D3)

---

## Support

For issues, questions, or contributions:
- **Documentation:** `/workspaces/There/ADMIN-DASHBOARD.md`
- **Related Docs:** `/workspaces/There/USER-PROFILE-SETTINGS.md`
- **Backend Code:** `/workspaces/There/src/controllers/adminController.ts`
- **Frontend Code:** `/workspaces/There/frontend/src/pages/admin/`

---

**Last Updated:** 2025-01-20  
**Total Lines:** 1,732 lines across 7 frontend pages + 523 backend lines  
**Status:** ✅ Production Ready
