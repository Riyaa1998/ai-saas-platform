import { EventEmitter } from 'events';

// Real-time analytics data store
interface RealTimeMetrics {
  activeUsers: number;
  totalRequests: number;
  responseTime: number;
  errorRate: number;
  toolUsage: Record<string, number>;
  lastUpdated: Date;
}

interface ActiveSession {
  sessionId: string;
  userId?: string;
  lastActivity: Date;
  currentPage: string;
  userAgent?: string;
  ipAddress?: string;
}

class RealTimeAnalyticsService extends EventEmitter {
  private static instance: RealTimeAnalyticsService;
  private metrics: RealTimeMetrics;
  private activeSessions: Map<string, ActiveSession>;
  private connectedClients: Set<WebSocket>;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.metrics = {
      activeUsers: 0,
      totalRequests: 0,
      responseTime: 0,
      errorRate: 0,
      toolUsage: {},
      lastUpdated: new Date()
    };
    this.activeSessions = new Map();
    this.connectedClients = new Set();
    this.startMetricsUpdate();
  }

  public static getInstance(): RealTimeAnalyticsService {
    if (!RealTimeAnalyticsService.instance) {
      RealTimeAnalyticsService.instance = new RealTimeAnalyticsService();
    }
    return RealTimeAnalyticsService.instance;
  }

  private startMetricsUpdate(): void {
    // Update metrics every 5 seconds
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
      this.broadcastMetrics();
    }, 5000);
  }

  private updateMetrics(): void {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Update active users (users active in last 5 minutes)
    this.activeSessions.forEach((session, sessionId) => {
      if (session.lastActivity < fiveMinutesAgo) {
        this.activeSessions.delete(sessionId);
      }
    });
    
    this.metrics.activeUsers = this.activeSessions.size;
    this.metrics.lastUpdated = now;
    
    // Emit metrics update event
    this.emit('metricsUpdate', this.metrics);
  }

  public trackUserActivity(sessionId: string, userId?: string, page?: string, userAgent?: string, ipAddress?: string): void {
    const now = new Date();
    const session: ActiveSession = {
      sessionId,
      userId,
      lastActivity: now,
      currentPage: page || 'unknown',
      userAgent,
      ipAddress
    };
    
    this.activeSessions.set(sessionId, session);
    this.updateMetrics();
  }

  public trackAPIRequest(toolName: string, duration: number, success: boolean): void {
    this.metrics.totalRequests++;
    
    // Update response time (rolling average)
    this.metrics.responseTime = (this.metrics.responseTime + duration) / 2;
    
    // Update error rate
    if (!success) {
      this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalRequests;
    }
    
    // Update tool usage
    this.metrics.toolUsage[toolName] = (this.metrics.toolUsage[toolName] || 0) + 1;
    
    this.metrics.lastUpdated = new Date();
    this.broadcastMetrics();
  }

  public addWebSocketClient(ws: WebSocket): void {
    this.connectedClients.add(ws);
    
    // Send current metrics to new client
    ws.send(JSON.stringify({
      type: 'metrics',
      data: this.metrics
    }));
    
    // Handle client disconnect
    ws.addEventListener('close', () => {
      this.connectedClients.delete(ws);
    });
  }

  private broadcastMetrics(): void {
    const message = JSON.stringify({
      type: 'metrics',
      data: this.metrics
    });
    
    this.connectedClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      } else {
        this.connectedClients.delete(ws);
      }
    });
  }

  public getMetrics(): RealTimeMetrics {
    return { ...this.metrics };
  }

  public getActiveSessions(): ActiveSession[] {
    return Array.from(this.activeSessions.values());
  }

  public getToolUsageStats(): Record<string, { count: number; percentage: number }> {
    const total = Object.values(this.metrics.toolUsage).reduce((sum, count) => sum + count, 0);
    const stats: Record<string, { count: number; percentage: number }> = {};
    
    Object.entries(this.metrics.toolUsage).forEach(([tool, count]) => {
      stats[tool] = {
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
    
    return stats;
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.connectedClients.clear();
    this.activeSessions.clear();
  }
}

export const realtimeAnalytics = RealTimeAnalyticsService.getInstance();

// Utility functions for easy integration
export const trackUserActivity = (sessionId: string, userId?: string, page?: string, userAgent?: string, ipAddress?: string) => {
  realtimeAnalytics.trackUserActivity(sessionId, userId, page, userAgent, ipAddress);
};

export const trackAPIRequest = (toolName: string, duration: number, success: boolean) => {
  realtimeAnalytics.trackAPIRequest(toolName, duration, success);
};

export const getRealtimeMetrics = () => {
  return realtimeAnalytics.getMetrics();
};

export const getActiveSessions = () => {
  return realtimeAnalytics.getActiveSessions();
};

export const getToolUsageStats = () => {
  return realtimeAnalytics.getToolUsageStats();
};


