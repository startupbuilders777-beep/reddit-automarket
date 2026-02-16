import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ActivityAction = 
  | 'spawn' 
  | 'complete' 
  | 'fail' 
  | 'error' 
  | 'heartbeat' 
  | 'started' 
  | 'stopped'
  | 'timeout'
  | 'blocked';

export interface LogActivityParams {
  agentId?: string;
  sessionId?: string;
  action: ActivityAction;
  message?: string;
  metadata?: Record<string, unknown>;
  source?: 'mcp' | 'webhook' | 'api' | 'internal';
}

/**
 * Log an agent activity to the database
 */
export async function logActivity(params: LogActivityParams) {
  const { agentId, sessionId, action, message, metadata, source = 'internal' } = params;
  
  const activity = await prisma.activityLog.create({
    data: {
      agentId,
      sessionId,
      action,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
      source,
    },
  });
  
  return activity;
}

/**
 * Get activities with optional filters
 */
export async function getActivities(options?: {
  agentId?: string;
  sessionId?: string;
  action?: ActivityAction;
  limit?: number;
  offset?: number;
}) {
  const { agentId, sessionId, action, limit = 100, offset = 0 } = options || {};
  
  const where: Record<string, unknown> = {};
  if (agentId) where.agentId = agentId;
  if (sessionId) where.sessionId = sessionId;
  if (action) where.action = action;
  
  const activities = await prisma.activityLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
  });
  
  return activities;
}

/**
 * Get recent activities for Mission Control dashboard
 */
export async function getRecentActivities(limit = 50) {
  return getActivities({ limit });
}

/**
 * Get activities for a specific agent
 */
export async function getAgentActivities(agentId: string, limit = 50) {
  return getActivities({ agentId, limit });
}

/**
 * Log agent spawn event
 */
export async function logAgentSpawn(agentId: string, sessionId?: string, metadata?: Record<string, unknown>) {
  return logActivity({
    agentId,
    sessionId,
    action: 'spawn',
    message: `Agent ${agentId} spawned`,
    metadata,
    source: 'internal',
  });
}

/**
 * Log agent completion event
 */
export async function logAgentComplete(agentId: string, sessionId?: string, metadata?: Record<string, unknown>) {
  return logActivity({
    agentId,
    sessionId,
    action: 'complete',
    message: `Agent ${agentId} completed`,
    metadata,
    source: 'internal',
  });
}

/**
 * Log agent failure event
 */
export async function logAgentFail(agentId: string, sessionId?: string, error?: string, metadata?: Record<string, unknown>) {
  return logActivity({
    agentId,
    sessionId,
    action: 'fail',
    message: `Agent ${agentId} failed: ${error}`,
    metadata: { ...metadata, error },
    source: 'internal',
  });
}

/**
 * Log agent error event
 */
export async function logAgentError(agentId: string, sessionId?: string, error?: string, metadata?: Record<string, unknown>) {
  return logActivity({
    agentId,
    sessionId,
    action: 'error',
    message: `Agent ${agentId} error: ${error}`,
    metadata: { ...metadata, error },
    source: 'internal',
  });
}

/**
 * Log agent heartbeat
 */
export async function logAgentHeartbeat(agentId: string, sessionId?: string, metadata?: Record<string, unknown>) {
  return logActivity({
    agentId,
    sessionId,
    action: 'heartbeat',
    message: `Agent ${agentId} heartbeat`,
    metadata,
    source: 'internal',
  });
}
