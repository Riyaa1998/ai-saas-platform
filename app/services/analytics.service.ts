import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface UsageMetrics {
  totalRequests: number;
  activeUsers: number;
  newUsers: number;
  requestsByDay: Record<string, number>;
  usageByPlan: Record<string, number>;
}

export interface UserAnalytics {
  userId: string;
  totalRequests: number;
  lastActive: string;
  plan: string;
  features: Record<string, number>;
}

export interface FeatureUsage {
  feature: string;
  count: number;
  percentage: number;
}

export interface PeakHours {
  hour: number;
  requestCount: number;
}

class AnalyticsService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/analytics`,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  /**
   * Get overall usage metrics
   * @param days Number of days of data to include (default: 30)
   */
  async getUsageMetrics(days: number = 30): Promise<UsageMetrics> {
    const response = await this.api.get('/usage/metrics', {
      params: { days },
    });
    return response.data;
  }

  /**
   * Get analytics for a specific user
   * @param userId ID of the user to get analytics for
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const response = await this.api.get(`/user/analytics/${userId}`);
    return response.data;
  }

  /**
   * Get feature usage statistics
   * @param days Number of days of data to include (default: 30)
   */
  async getFeatureUsage(days: number = 30): Promise<FeatureUsage[]> {
    const response = await this.api.get('/usage/features', {
      params: { days },
    });
    return response.data;
  }

  /**
   * Get peak usage hours
   * @param days Number of days of data to include (default: 30)
   */
  async getPeakHours(days: number = 30): Promise<PeakHours[]> {
    const response = await this.api.get('/usage/peak-hours', {
      params: { days },
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
