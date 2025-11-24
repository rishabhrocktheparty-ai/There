import axios from 'axios';

const API_BASE = '/api/admin';

export interface SystemAnalytics {
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalRelationships: number;
    totalMessages: number;
    totalAdmins: number;
    engagementRate: number;
    avgMessagesPerUser: number;
    timeRange: number;
  };
  userGrowth: Array<{ date: string; count: number }>;
  messagesByTone: Array<{ tone: string; count: number }>;
  usageByType: Array<{ type: string; count: number }>;
  relationshipsByRole: Array<{ roleId: string; count: number }>;
  recentAuditLogs: any[];
}

export interface UserMetrics {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RoleTemplate {
  id: string;
  type: string;
  key: string;
  displayName: string;
  description?: string;
  defaultSettings?: any;
  _count?: {
    relationships: number;
  };
}

export interface EmotionalConfig {
  toneDistribution: Array<{
    tone: string;
    count: number;
    percentage: number;
  }>;
  growthMetrics: Array<{
    bucketDate: string;
    messagesCount: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
  }>;
  totalMessages: number;
  availableTones: string[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  healthScore: number;
  timestamp: string;
  components: {
    database: {
      status: string;
      latency: number;
      connected: boolean;
    };
    api: {
      status: string;
      recentMessages: number;
      recentUsers: number;
    };
    errors: {
      count: number;
      status: string;
    };
  };
  metrics: any[];
}

class AdminService {
  /**
   * Get system analytics
   */
  async getSystemAnalytics(timeRange: number = 30): Promise<SystemAnalytics> {
    const response = await axios.get(`${API_BASE}/analytics/system`, {
      params: { timeRange },
    });
    return response.data;
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(page: number = 1, limit: number = 20, search: string = ''): Promise<UserMetrics> {
    const response = await axios.get(`${API_BASE}/users/metrics`, {
      params: { page, limit, search },
    });
    return response.data;
  }

  /**
   * Get role templates
   */
  async getRoleTemplates(): Promise<RoleTemplate[]> {
    const response = await axios.get(`${API_BASE}/roles/templates`);
    return response.data;
  }

  /**
   * Create or update role template
   */
  async upsertRoleTemplate(template: Partial<RoleTemplate>): Promise<RoleTemplate> {
    const response = await axios.post(`${API_BASE}/roles/templates`, template);
    return response.data;
  }

  /**
   * Delete role template
   */
  async deleteRoleTemplate(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/roles/templates/${id}`);
  }

  /**
   * Get emotional intelligence configuration
   */
  async getEmotionalConfig(): Promise<EmotionalConfig> {
    const response = await axios.get(`${API_BASE}/emotional/config`);
    return response.data;
  }

  /**
   * Get user feedback
   */
  async getUserFeedback(page: number = 1, limit: number = 20, type: string = 'all'): Promise<any> {
    const response = await axios.get(`${API_BASE}/feedback`, {
      params: { page, limit, type },
    });
    return response.data;
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  }

  /**
   * Update admin user role
   */
  async updateAdminRole(userId: string, role: 'SUPER_ADMIN' | 'CONFIG_MANAGER' | 'VIEWER'): Promise<any> {
    const response = await axios.put(`${API_BASE}/users/admin-role`, { userId, role });
    return response.data;
  }

  /**
   * Remove admin privileges
   */
  async removeAdmin(userId: string): Promise<void> {
    await axios.delete(`${API_BASE}/users/admin-role/${userId}`);
  }
}

export const adminService = new AdminService();
