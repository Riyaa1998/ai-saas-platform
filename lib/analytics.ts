import { z } from "zod";

// Analytics event schemas
export const AnalyticsEventSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string(),
  eventType: z.enum([
    'tool_usage',
    'user_login',
    'user_signup',
    'payment_success',
    'api_request',
    'error_occurred',
    'performance_metric'
  ]),
  toolName: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date().default(() => new Date()),
  duration: z.number().optional(), // in milliseconds
  success: z.boolean().optional(),
  errorMessage: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Analytics service class
export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Initialize analytics tracking
    this.setupEventListeners();
    this.isInitialized = true;
  }

  private setupEventListeners(): void {
    // Track page views
    if (typeof window !== 'undefined') {
      this.trackPageView();
      
      // Track user interactions
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-analytics]')) {
          const eventData = target.closest('[data-analytics]')?.getAttribute('data-analytics');
          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);
              this.trackEvent({
                eventType: 'tool_usage',
                sessionId: this.getSessionId(),
                toolName: parsed.tool,
                metadata: parsed
              });
            } catch (error) {
              console.warn('Invalid analytics data:', eventData);
            }
          }
        }
      });
    }
  }

  private trackPageView(): void {
    this.trackEvent({
      eventType: 'tool_usage',
      sessionId: this.getSessionId(),
      toolName: window.location.pathname,
      metadata: {
        path: window.location.pathname,
        referrer: document.referrer,
        title: document.title
      }
    });
  }

  public async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const validatedEvent = AnalyticsEventSchema.parse({
        ...event,
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });

      this.events.push(validatedEvent);
      
      // Send to analytics API
      await this.sendToAPI(validatedEvent);
      
      // Keep only last 1000 events in memory
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  private async sendToAPI(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics to API:', error);
    }
  }

  public async trackToolUsage(toolName: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'tool_usage',
      sessionId: this.getSessionId(),
      toolName,
      metadata,
      success: true,
    });
  }

  public async trackAPIRequest(toolName: string, duration: number, success: boolean, errorMessage?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'api_request',
      sessionId: this.getSessionId(),
      toolName,
      duration,
      success,
      errorMessage,
    });
  }

  public async trackPerformanceMetric(metricName: string, value: number, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'performance_metric',
      sessionId: this.getSessionId(),
      metadata: {
        metricName,
        value,
        ...metadata
      }
    });
  }

  public async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'error_occurred',
      sessionId: this.getSessionId(),
      errorMessage: error.message,
      metadata: {
        stack: error.stack,
        ...context
      }
    });
  }

  public getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public getEventsByType(eventType: AnalyticsEvent['eventType']): AnalyticsEvent[] {
    return this.events.filter(event => event.eventType === eventType);
  }

  public getEventsByTool(toolName: string): AnalyticsEvent[] {
    return this.events.filter(event => event.toolName === toolName);
  }

  public getRecentEvents(limit: number = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  public async getAnalyticsSummary(): Promise<{
    totalEvents: number;
    toolUsage: Record<string, number>;
    successRate: number;
    averageResponseTime: number;
    errorCount: number;
  }> {
    const toolUsage: Record<string, number> = {};
    let totalRequests = 0;
    let successfulRequests = 0;
    let totalResponseTime = 0;
    let errorCount = 0;

    this.events.forEach(event => {
      if (event.eventType === 'tool_usage' && event.toolName) {
        toolUsage[event.toolName] = (toolUsage[event.toolName] || 0) + 1;
      }
      
      if (event.eventType === 'api_request') {
        totalRequests++;
        if (event.success) {
          successfulRequests++;
        } else {
          errorCount++;
        }
        if (event.duration) {
          totalResponseTime += event.duration;
        }
      }
    });

    return {
      totalEvents: this.events.length,
      toolUsage,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      errorCount
    };
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// Utility functions for easy tracking
export const trackToolUsage = (toolName: string, metadata?: Record<string, any>) => {
  analytics.trackToolUsage(toolName, metadata);
};

export const trackAPIRequest = (toolName: string, duration: number, success: boolean, errorMessage?: string) => {
  analytics.trackAPIRequest(toolName, duration, success, errorMessage);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackPerformanceMetric = (metricName: string, value: number, metadata?: Record<string, any>) => {
  analytics.trackPerformanceMetric(metricName, value, metadata);
};
