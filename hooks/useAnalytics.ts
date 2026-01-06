import { useEffect, useCallback } from 'react';
import { analytics, trackToolUsage, trackAPIRequest, trackError, trackPerformanceMetric } from '@/lib/analytics';

export const useAnalytics = () => {
  useEffect(() => {
    // Initialize analytics when the hook is used
    analytics.initialize();
  }, []);

  const trackTool = useCallback((toolName: string, metadata?: Record<string, any>) => {
    trackToolUsage(toolName, metadata);
  }, []);

  const trackAPI = useCallback((toolName: string, duration: number, success: boolean, errorMessage?: string) => {
    trackAPIRequest(toolName, duration, success, errorMessage);
  }, []);

  const trackErrorEvent = useCallback((error: Error, context?: Record<string, any>) => {
    trackError(error, context);
  }, []);

  const trackPerformance = useCallback((metricName: string, value: number, metadata?: Record<string, any>) => {
    trackPerformanceMetric(metricName, value, metadata);
  }, []);

  const trackPageView = useCallback((path: string, metadata?: Record<string, any>) => {
    analytics.trackEvent({
      eventType: 'tool_usage',
      sessionId: analytics.getSessionId(),
      toolName: path,
      metadata: {
        path,
        referrer: document.referrer,
        title: document.title,
        ...metadata
      }
    });
  }, []);

  const trackUserAction = useCallback((action: string, metadata?: Record<string, any>) => {
    analytics.trackEvent({
      eventType: 'tool_usage',
      sessionId: analytics.getSessionId(),
      toolName: action,
      metadata
    });
  }, []);

  return {
    trackTool,
    trackAPI,
    trackError: trackErrorEvent,
    trackPerformance,
    trackPageView,
    trackUserAction,
    getSessionId: analytics.getSessionId,
    getAnalyticsSummary: analytics.getAnalyticsSummary
  };
};

// Hook for tracking specific tool usage
export const useToolAnalytics = (toolName: string) => {
  const { trackTool, trackAPI, trackError, trackPerformance } = useAnalytics();

  const trackStart = useCallback((metadata?: Record<string, any>) => {
    trackTool(toolName, { action: 'start', ...metadata });
  }, [toolName, trackTool]);

  const trackSuccess = useCallback((metadata?: Record<string, any>) => {
    trackTool(toolName, { action: 'success', ...metadata });
  }, [toolName, trackTool]);

  const trackFailure = useCallback((error: Error, metadata?: Record<string, any>) => {
    trackError(error, { tool: toolName, ...metadata });
  }, [toolName, trackError]);

  const trackAPICall = useCallback((duration: number, success: boolean, errorMessage?: string) => {
    trackAPI(toolName, duration, success, errorMessage);
  }, [toolName, trackAPI]);

  const trackMetric = useCallback((metricName: string, value: number, metadata?: Record<string, any>) => {
    trackPerformance(metricName, value, { tool: toolName, ...metadata });
  }, [toolName, trackPerformance]);

  return {
    trackStart,
    trackSuccess,
    trackFailure,
    trackAPICall,
    trackMetric
  };
};

// Hook for tracking user engagement
export const useEngagementAnalytics = () => {
  const { trackUserAction } = useAnalytics();

  const trackClick = useCallback((element: string, metadata?: Record<string, any>) => {
    trackUserAction('click', { element, ...metadata });
  }, [trackUserAction]);

  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    trackUserAction('form_submit', { formName, ...metadata });
  }, [trackUserAction]);

  const trackDownload = useCallback((fileType: string, metadata?: Record<string, any>) => {
    trackUserAction('download', { fileType, ...metadata });
  }, [trackUserAction]);

  const trackShare = useCallback((platform: string, metadata?: Record<string, any>) => {
    trackUserAction('share', { platform, ...metadata });
  }, [trackUserAction]);

  return {
    trackClick,
    trackFormSubmit,
    trackDownload,
    trackShare
  };
};
