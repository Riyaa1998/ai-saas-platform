"use client";

import { useState, useEffect, useCallback } from 'react';
import { realtimeAnalytics } from '@/lib/realtime-analytics';

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

interface ToolUsageStats {
  [tool: string]: {
    count: number;
    percentage: number;
  };
}

export function useRealtimeAnalytics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [toolUsageStats, setToolUsageStats] = useState<ToolUsageStats>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRealtimeData = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`/api/analytics/realtime?sessionId=${sessionId}&page=${window.location.pathname}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data.metrics);
          setActiveSessions(data.data.activeSessions);
          setToolUsageStats(data.data.toolUsageStats);
          setLastUpdate(new Date(data.data.timestamp));
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch real-time analytics:', error);
      setIsConnected(false);
    }
  }, []);

  const trackUserActivity = useCallback(async (page?: string) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/analytics/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          page: page || window.location.pathname,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state immediately for better UX
          fetchRealtimeData();
        }
      }
    } catch (error) {
      console.error('Failed to track user activity:', error);
    }
  }, [fetchRealtimeData]);

  const trackAPIRequest = useCallback(async (toolName: string, duration: number, success: boolean) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/analytics/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          toolName,
          duration,
          success,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state immediately for better UX
          fetchRealtimeData();
        }
      }
    } catch (error) {
      console.error('Failed to track API request:', error);
    }
  }, [fetchRealtimeData]);

  useEffect(() => {
    // Initial fetch
    fetchRealtimeData();

    // Set up polling for real-time updates
    const interval = setInterval(fetchRealtimeData, 5000); // Update every 5 seconds

    // Track page view on mount
    trackUserActivity();

    // Track page changes
    const handleRouteChange = () => {
      trackUserActivity();
    };

    // Listen for route changes (Next.js router events)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [fetchRealtimeData, trackUserActivity]);

  // Track user activity on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        trackUserActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackUserActivity]);

  return {
    metrics,
    activeSessions,
    toolUsageStats,
    isConnected,
    lastUpdate,
    trackUserActivity,
    trackAPIRequest,
    refreshData: fetchRealtimeData,
  };
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}


