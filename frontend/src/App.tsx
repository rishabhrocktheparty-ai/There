import { Route, Routes, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { EthicalConfigsPage } from './pages/admin/EthicalConfigsPage';
import { RoleTemplatesPage } from './pages/admin/RoleTemplatesPage';
import { CulturalSettingsPage } from './pages/admin/CulturalSettingsPage';
import { UserAnalyticsPage } from './pages/admin/UserAnalyticsPage';
import { MonitoringLogsPage } from './pages/admin/MonitoringLogsPage';
import { BackupExportPage } from './pages/admin/BackupExportPage';
import { DashboardPage } from './pages/user/DashboardPage';
import { RoleSelectionPage } from './pages/user/RoleSelectionPage';
import { RelationshipsPage } from './pages/user/RelationshipsPage';
import { RelationshipActivityPage } from './pages/user/RelationshipActivityPage';
import { ConversationPage } from './pages/user/ConversationPage';
import { CustomizationPage } from './pages/user/CustomizationPage';
import { UsageStatsPage } from './pages/user/UsageStatsPage';
import { SettingsPage } from './pages/user/SettingsPage';
import { ChatPage } from './pages/user/ChatPage';
import { HealthCheckPage } from './pages/HealthCheckPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/health" element={<HealthCheckPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="configs" element={<EthicalConfigsPage />} />
        <Route path="roles" element={<RoleTemplatesPage />} />
        <Route path="cultural" element={<CulturalSettingsPage />} />
        <Route path="users-analytics" element={<UserAnalyticsPage />} />
        <Route path="monitoring" element={<MonitoringLogsPage />} />
        <Route path="backup" element={<BackupExportPage />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="relationships" replace />} />
        <Route path="roles" element={<RoleSelectionPage />} />
        <Route path="relationships" element={<RelationshipsPage />} />
        <Route path="relationships/:id/chat" element={<ConversationPage />} />
        <Route path="relationships/:id/activity" element={<RelationshipActivityPage />} />
        <Route path="customization" element={<CustomizationPage />} />
        <Route path="usage" element={<UsageStatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="conversations" element={<RelationshipsPage />} />
        <Route path="conversation/:id" element={<ConversationPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:conversationId" element={<ChatPage />} />
        <Route path="role-selection" element={<RoleSelectionPage />} />
        <Route path="ai-insights" element={<UsageStatsPage />} />
        <Route path="analytics" element={<UsageStatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
