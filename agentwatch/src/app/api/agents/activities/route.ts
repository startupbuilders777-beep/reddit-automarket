import { NextRequest, NextResponse } from 'next/server';
import { logActivity, getRecentActivities } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, sessionId, action, message, metadata, source } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    const validActions = ['spawn', 'complete', 'fail', 'error', 'heartbeat', 'started', 'stopped', 'timeout', 'blocked'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }
    
    const activity = await logActivity({
      agentId,
      sessionId,
      action,
      message,
      metadata,
      source,
    });
    
    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const activities = await getRecentActivities(limit);
    
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
