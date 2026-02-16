#!/usr/bin/env node

/**
 * MCP Server for Agent Activity Logging
 * 
 * This server exposes agent activity logging capabilities via the
 * Model Context Protocol (MCP). External agents can connect and log
 * their activities.
 * 
 * Usage:
 *   node mcp-server/index.js
 * 
 * Or run with: npx tsx mcp-server/index.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// MCP Protocol Types
interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Log an activity to the database
 */
async function logActivity(params: {
  agentId?: string;
  sessionId?: string;
  action: string;
  message?: string;
  metadata?: Record<string, unknown>;
  source?: string;
}) {
  const { agentId, sessionId, action, message, metadata, source = 'mcp' } = params;
  
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
 * Get activities with filters
 */
async function getActivities(params: {
  agentId?: string;
  sessionId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  const { agentId, sessionId, action, limit = 100, offset = 0 } = params;
  
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
 * Handle MCP requests
 */
async function handleRequest(request: MCPRequest): Promise<MCPResponse> {
  const { id, method, params = {} } = request;
  
  try {
    switch (method) {
      case 'tools/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'log_activity',
                description: 'Log an agent activity (spawn, complete, fail, error, heartbeat, etc.)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    agentId: { type: 'string', description: 'Agent ID' },
                    sessionId: { type: 'string', description: 'Session ID' },
                    action: { 
                      type: 'string', 
                      enum: ['spawn', 'complete', 'fail', 'error', 'heartbeat', 'started', 'stopped', 'timeout', 'blocked'],
                      description: 'The action type' 
                    },
                    message: { type: 'string', description: 'Human-readable message' },
                    metadata: { type: 'object', description: 'Additional metadata as JSON' },
                  },
                  required: ['action'],
                },
              },
              {
                name: 'get_activities',
                description: 'Get recent agent activities',
                inputSchema: {
                  type: 'object',
                  properties: {
                    agentId: { type: 'string', description: 'Filter by agent ID' },
                    sessionId: { type: 'string', description: 'Filter by session ID' },
                    action: { type: 'string', description: 'Filter by action type' },
                    limit: { type: 'number', description: 'Number of activities to return (default 100)' },
                    offset: { type: 'number', description: 'Number of activities to skip (default 0)' },
                  },
                },
              },
              {
                name: 'ping',
                description: 'Health check endpoint',
                inputSchema: {
                  type: 'object',
                  properties: {},
                },
              },
            ],
          },
        };
      }
      
      case 'tools/call': {
        const { name, arguments: args } = params as { name: string; arguments: Record<string, unknown> };
        
        switch (name) {
          case 'log_activity': {
            const activity = await logActivity({
              agentId: args.agentId as string | undefined,
              sessionId: args.sessionId as string | undefined,
              action: args.action as string,
              message: args.message as string | undefined,
              metadata: args.metadata as Record<string, unknown> | undefined,
              source: 'mcp',
            });
            return {
              jsonrpc: '2.0',
              id,
              result: { activity },
            };
          }
          
          case 'get_activities': {
            const activities = await getActivities({
              agentId: args.agentId as string | undefined,
              sessionId: args.sessionId as string | undefined,
              action: args.action as string | undefined,
              limit: args.limit as number | undefined,
              offset: args.offset as number | undefined,
            });
            return {
              jsonrpc: '2.0',
              id,
              result: { activities },
            };
          }
          
          case 'ping': {
            return {
              jsonrpc: '2.0',
              id,
              result: { status: 'ok', timestamp: new Date().toISOString() },
            };
          }
          
          default:
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: `Unknown tool: ${name}`,
              },
            };
        }
      }
      
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Unknown method: ${method}`,
          },
        };
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: String(error),
      },
    };
  }
}

/**
 * Read stdin and process MCP requests
 */
async function main() {
  console.error('MCP Agent Activity Logger starting...');
  
  let buffer = '';
  
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    
    // Try to parse complete JSON-RPC messages
    // MCP uses JSON-RPC 2.0
    try {
      const request = JSON.parse(buffer) as MCPRequest;
      buffer = '';
      
      handleRequest(request).then((response) => {
        console.log(JSON.stringify(response));
      });
    } catch {
      // Incomplete JSON, wait for more data
    }
  });
  
  process.stdin.on('end', () => {
    console.error('MCP Server stdin closed');
  });
}

main().catch(console.error);
