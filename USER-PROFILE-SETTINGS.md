# User Profile & Settings System

## Overview

Comprehensive user profile management and settings system with five main sections: User Profile, Relationship Preferences, Notification Settings, Privacy & Data Controls, and Usage Statistics & Insights.

## Architecture

### Backend Components

#### Profile Controller (`src/controllers/profileController.ts`)
Handles all profile and settings-related API operations:

**Profile Management:**
- `getProfile()` - Retrieve user profile with avatar, voice profiles
- `updateProfile()` - Update display name, locale, timezone

**Preferences Management:**
- `getPreferences()` - Get all user preferences (theme, notifications, privacy, etc.)
- `updatePreferences()` - Update preferences with deep merge support

**Notification Settings:**
- `getNotificationSettings()` - Get notification preferences
- `updateNotificationSettings()` - Update notification channels and types

**Privacy Settings:**
- `getPrivacySettings()` - Get privacy and data sharing preferences
- `updatePrivacySettings()` - Update privacy controls

**Usage Analytics:**
- `getUsageStats()` - Comprehensive usage statistics with customizable time ranges
- `exportUserData()` - GDPR-compliant data export
- `deleteAccount()` - Permanent account deletion with email confirmation

#### Profile Routes (`src/routes/profileRoutes.ts`)
All routes require authentication:

```typescript
GET    /api/profile/user/profile          - Get user profile
PUT    /api/profile/user/profile          - Update user profile
GET    /api/profile/user/preferences      - Get preferences
PUT    /api/profile/user/preferences      - Update preferences
GET    /api/profile/user/usage-stats      - Get usage statistics
GET    /api/profile/user/export           - Export user data
DELETE /api/profile/user/account          - Delete account
GET    /api/profile/user/notifications    - Get notification settings
PUT    /api/profile/user/notifications    - Update notification settings
GET    /api/profile/user/privacy          - Get privacy settings
PUT    /api/profile/user/privacy          - Update privacy settings
```

### Frontend Components

#### 1. User Profile Page (`UserProfilePage.tsx`)
**Features:**
- Avatar upload and display
- Display name editing
- Language selection (7 languages supported)
- Timezone selection (9 major timezones)
- Account creation and last update dates
- Voice and avatar profile status

**UI Elements:**
- Editable form with save/cancel actions
- Avatar with photo upload button
- Profile information cards
- Success/error notifications

#### 2. Relationship Preferences Page (`RelationshipPreferencesPage.tsx`)
**Features:**
- Message retention period slider (7-365 days)
- Cultural adaptation settings:
  - Communication style (Direct, Balanced, Indirect)
  - Formality level (Casual, Balanced, Formal)
  - Cultural region selection (6 regions)
- AI personality customization:
  - Empathy level display
  - Response length preferences
  - Humor level settings

**UI Elements:**
- Interactive sliders and selects
- Cultural preference cards
- AI personality overview cards
- Real-time preference preview

#### 3. Notification Settings Page (`NotificationSettingsPage.tsx`)
**Features:**
- Notification channels:
  - Email notifications
  - Push notifications
  - In-app notifications
- Activity alerts:
  - Message alerts
  - Relationship updates
  - Achievement notifications
- Digests and reminders:
  - Weekly digest
  - Daily reminders
- Bulk actions (Enable All / Disable All)

**UI Elements:**
- Toggle switches with descriptions
- Grouped settings by category
- Active notifications summary
- Quick action buttons

#### 4. Privacy Settings Page (`PrivacySettingsPage.tsx`)
**Features:**
- Profile visibility (Public, Friends, Private)
- Online status visibility toggle
- Data collection preferences:
  - Allow data collection
  - Allow analytics
  - Share usage data
  - Allow personalization
- Data management:
  - Export all user data (GDPR compliant)
  - Delete account with confirmation
- Privacy summary display

**UI Elements:**
- Visibility selector
- Privacy toggle switches
- Data export button
- Account deletion with confirmation dialog
- Warning alerts for destructive actions

#### 5. Usage Statistics Page (`UsageStatsPage.tsx`)
**Features:**
- Summary cards:
  - Total messages with daily average
  - Total and active relationships
  - Total activity events
  - Time range selector
- Emotional distribution:
  - Visual progress bars
  - Percentage breakdown
  - Color-coded by emotion
- Daily activity chart:
  - Last 14 days visualization
  - Message count per day
- Recent activity feed:
  - Latest 10 events
  - Event type and timestamp
- Activity breakdown:
  - Event type distribution
  - Interactive chips
- Insights:
  - Most active day
  - Engagement rate calculation

**UI Elements:**
- Time range selector (7, 30, 90, 365 days)
- Interactive charts and graphs
- Progress bars with color coding
- Activity timeline
- Statistical insights

#### 6. Settings Hub Page (`SettingsPage.tsx`)
**Features:**
- Unified settings navigation
- Section-based organization
- Sticky sidebar navigation
- Dynamic content area
- Visual section indicators

**UI Elements:**
- Sidebar navigation list
- Icon indicators for each section
- Selected state highlighting
- Content area with dynamic components

### Frontend Service Layer

#### Profile Service (`services/profileService.ts`)
TypeScript service with full type safety:

**Interfaces:**
```typescript
UserProfile           - Complete user profile data
UserPreferences       - All preference categories
NotificationSettings  - Notification channel preferences
PrivacySettings      - Privacy and data controls
RelationshipPreferences - AI relationship customization
AccessibilitySettings - Accessibility options
UsageStats           - Comprehensive analytics data
```

**Methods:**
- `getProfile()` - Fetch user profile
- `updateProfile()` - Update profile fields
- `getPreferences()` - Get all preferences
- `updatePreferences()` - Update any preference
- `getNotificationSettings()` - Get notifications
- `updateNotificationSettings()` - Update notifications
- `getPrivacySettings()` - Get privacy settings
- `updatePrivacySettings()` - Update privacy
- `getUsageStats(timeRange)` - Get analytics
- `exportUserData()` - Download data export
- `deleteAccount(confirmEmail)` - Delete account

## Data Models

### User Preferences Structure
```typescript
{
  theme: 'light' | 'dark' | 'auto',
  language: string,
  notifications: {
    email: boolean,
    push: boolean,
    inApp: boolean,
    messageAlerts: boolean,
    relationshipUpdates: boolean,
    weeklyDigest: boolean,
    dailyReminders: boolean,
    achievementNotifications: boolean
  },
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends',
    showOnlineStatus: boolean,
    allowDataCollection: boolean,
    allowAnalytics: boolean,
    shareUsageData: boolean,
    allowPersonalization: boolean
  },
  relationship: {
    defaultRole: string,
    autoSaveMessages: boolean,
    messageRetentionDays: number (7-365),
    culturalPreferences: {
      region: string,
      formalityLevel: 'casual' | 'balanced' | 'formal',
      communicationStyle: 'direct' | 'indirect' | 'balanced'
    }
  },
  accessibility: {
    fontSize: 'small' | 'medium' | 'large',
    highContrast: boolean,
    reduceMotion: boolean,
    screenReaderOptimized: boolean
  }
}
```

### Usage Statistics Structure
```typescript
{
  summary: {
    totalMessages: number,
    totalRelationships: number,
    activeRelationships: number,
    avgMessagesPerDay: number,
    timeRange: number
  },
  emotionalDistribution: Array<{
    tone: string,
    count: number,
    percentage: number
  }>,
  eventDistribution: Array<{
    type: string,
    count: number
  }>,
  recentActivity: Array<{
    id: string,
    type: string,
    metadata: any,
    createdAt: string
  }>,
  messagesPerDay: Array<{
    date: string,
    count: number
  }>,
  relationshipGrowth: Array<{
    bucketDate: string,
    messagesCount: number,
    positiveCount: number,
    neutralCount: number,
    negativeCount: number
  }>
}
```

## Features

### 1. User Profile Management
- ✅ Avatar upload and display
- ✅ Display name customization
- ✅ Multi-language support (7 languages)
- ✅ Timezone configuration (9 major zones)
- ✅ Account information display
- ✅ Voice profile integration
- ✅ Avatar profile integration
- ✅ Real-time profile updates
- ✅ Validation and error handling

### 2. Relationship Preferences
- ✅ Message retention control (7-365 days)
- ✅ Cultural adaptation:
  - Communication style preferences
  - Formality level settings
  - Regional cultural profiles
- ✅ AI personality display:
  - Empathy level
  - Response length
  - Humor settings
- ✅ Auto-save functionality
- ✅ Preference persistence

### 3. Notification Settings
- ✅ 8 notification types
- ✅ 3 notification channels
- ✅ Grouped settings organization
- ✅ Bulk enable/disable actions
- ✅ Active notifications summary
- ✅ Real-time toggle updates
- ✅ Visual feedback on changes

### 4. Privacy & Data Controls
- ✅ Profile visibility control (3 levels)
- ✅ Online status toggle
- ✅ 4 data sharing preferences
- ✅ GDPR-compliant data export
- ✅ Account deletion with safeguards:
  - Email confirmation required
  - Warning dialogs
  - Irreversible action notice
- ✅ Privacy settings summary
- ✅ Data management dashboard

### 5. Usage Statistics & Insights
- ✅ 4 time range options (7-365 days)
- ✅ Summary metrics:
  - Total messages
  - Active relationships
  - Event counts
  - Daily averages
- ✅ Emotional distribution visualization
- ✅ Daily activity charts
- ✅ Recent activity feed
- ✅ Event type breakdown
- ✅ Calculated insights:
  - Most active day
  - Engagement rate
- ✅ Responsive charts and graphs

## Security Features

### Authentication
- All endpoints require authentication
- JWT token validation
- User ID verification

### Data Protection
- Email confirmation for account deletion
- Audit logging for sensitive actions
- Secure password handling
- Privacy-first defaults

### GDPR Compliance
- Complete data export
- Right to deletion
- Data processing transparency
- User consent management

## API Integration

### Request Examples

**Get Profile:**
```bash
GET /api/profile/user/profile
Authorization: Bearer <token>
```

**Update Preferences:**
```bash
PUT /api/profile/user/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false
  }
}
```

**Get Usage Stats:**
```bash
GET /api/profile/user/usage-stats?timeRange=30
Authorization: Bearer <token>
```

**Export Data:**
```bash
GET /api/profile/user/export
Authorization: Bearer <token>
```

**Delete Account:**
```bash
DELETE /api/profile/user/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "confirmEmail": "user@example.com"
}
```

## Navigation Structure

```
Settings & Preferences
├── User Profile
│   ├── Avatar & Display Name
│   ├── Language & Timezone
│   └── Account Information
├── Relationship Preferences
│   ├── Message Settings
│   ├── Cultural Adaptation
│   └── AI Personality
├── Notifications
│   ├── Notification Channels
│   ├── Activity Notifications
│   └── Digests & Reminders
├── Privacy & Data
│   ├── Profile Visibility
│   ├── Data Collection
│   └── Data Management
└── Usage Statistics
    ├── Summary Metrics
    ├── Emotional Analysis
    ├── Activity Charts
    └── Insights
```

## UI/UX Features

### Responsive Design
- Mobile-friendly layouts
- Adaptive grid system
- Touch-optimized controls
- Responsive navigation

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Reduce motion options
- Font size controls

### User Feedback
- Success notifications
- Error messages
- Loading states
- Confirmation dialogs
- Progress indicators

### Visual Design
- Material-UI components
- Consistent iconography
- Color-coded emotions
- Interactive charts
- Card-based layouts

## Testing

### Manual Testing Checklist

**Profile Management:**
- [ ] Update display name
- [ ] Change language
- [ ] Select timezone
- [ ] Upload avatar
- [ ] View account info

**Relationship Preferences:**
- [ ] Adjust message retention
- [ ] Change communication style
- [ ] Set formality level
- [ ] Select cultural region
- [ ] Save preferences

**Notifications:**
- [ ] Toggle email notifications
- [ ] Enable/disable push
- [ ] Configure alerts
- [ ] Test bulk actions
- [ ] Verify summary

**Privacy:**
- [ ] Change visibility
- [ ] Toggle online status
- [ ] Adjust data settings
- [ ] Export data
- [ ] Test deletion flow

**Usage Stats:**
- [ ] Switch time ranges
- [ ] View emotional distribution
- [ ] Check daily activity
- [ ] Review recent events
- [ ] Calculate insights

## Future Enhancements

### Planned Features
1. **Advanced Analytics:**
   - Sentiment trends over time
   - Relationship health scores
   - Engagement predictions
   - Custom report generation

2. **Enhanced Privacy:**
   - Two-factor authentication
   - Login history
   - Device management
   - Session controls

3. **Profile Extensions:**
   - Custom themes
   - Profile backgrounds
   - Badge system
   - Achievement tracking

4. **Social Features:**
   - Friend connections
   - Profile sharing
   - Relationship recommendations
   - Community features

5. **Accessibility:**
   - Voice commands
   - Custom color schemes
   - Dyslexia-friendly fonts
   - Screen reader optimization

## Maintenance

### Regular Tasks
- Monitor usage statistics
- Review error logs
- Update privacy policies
- Backup user data
- Performance optimization

### Known Limitations
- Avatar upload size limited to 5MB
- Data export may take time for large datasets
- Statistics calculated in real-time (may be slow)
- Time zones limited to major zones

## Support

### Common Issues

**Profile not updating:**
- Check authentication token
- Verify field validation
- Review error messages
- Clear browser cache

**Statistics not loading:**
- Check time range selection
- Verify data exists
- Review API connection
- Try smaller time range

**Data export failing:**
- Check disk space
- Verify permissions
- Review data size
- Contact support

## Conclusion

The User Profile & Settings System provides comprehensive control over user preferences, privacy, and data with an intuitive interface and robust backend. All features are production-ready with proper validation, error handling, and security measures in place.
