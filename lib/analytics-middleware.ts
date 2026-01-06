import { NextRequest, NextResponse } from 'next/server';
import { trackUserActivity } from './realtime-analytics';

export function analyticsMiddleware(request: NextRequest) {
  // Extract session information
  const sessionId = request.cookies.get('analytics_session_id')?.value || 
                   `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const userId = request.headers.get('x-user-id') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;
  const ipAddress = request.ip || 
                   request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  // Track user activity
  trackUserActivity(
    sessionId,
    userId,
    request.nextUrl.pathname,
    userAgent,
    ipAddress
  );
  
  // Create response with session cookie
  const response = NextResponse.next();
  
  // Set session cookie if not exists
  if (!request.cookies.get('analytics_session_id')) {
    response.cookies.set('analytics_session_id', sessionId, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }
  
  return response;
}


