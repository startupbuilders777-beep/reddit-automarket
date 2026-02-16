'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Agent {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'error';
  type: string;
  uptime: number;
  lastActivity: string;
  cpuUsage: number;
  memoryUsage: number;
  tasksCompleted: number;
  tasksFailed: number;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatusBadge({ status }: { status: Agent['status'] }) {
  const variants: Record<Agent['status'], 'default' | 'secondary' | 'destructive'> = {
    running: 'default',
    idle: 'secondary',
    error: 'destructive',
  };
  
  return (
    <Badge variant={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function AgentDetails({ agent }: { agent: Agent }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <StatusBadge status={agent.status} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="font-medium">{agent.type}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Uptime</p>
          <p className="font-medium">{formatUptime(agent.uptime)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Last Activity</p>
          <p className="font-medium">{formatTimeAgo(agent.lastActivity)}</p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Metrics</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU Usage</span>
              <span>{agent.cpuUsage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${agent.cpuUsage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Memory Usage</span>
              <span>{agent.memoryUsage.toFixed(0)} MB</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, (agent.memoryUsage / 512) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Task Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{agent.tasksCompleted}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{agent.tasksFailed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    
    // Heartbeat to simulate agent activity
    const heartbeat = async () => {
      try {
        await fetch('/api/agents/heartbeat', { method: 'POST' });
      } catch {
        // Ignore errors
      }
    };
    
    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      heartbeat();
      fetchAgents();
    }, 2000);
    
    // Initial heartbeat
    heartbeat();
    
    // Also set up Server-Sent Events for real-time updates
    const eventSource = new EventSource('/api/agents/events');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAgents(data);
      } catch (e) {
        console.error('Failed to parse SSE data:', e);
      }
    };
    
    eventSource.onerror = () => {
      console.log('SSE connection closed, falling back to polling');
      eventSource.close();
    };
    
    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, [fetchAgents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  const runningCount = agents.filter(a => a.status === 'running').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;
  const errorCount = agents.filter(a => a.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{agents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{runningCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-500">{idleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{errorCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent List */}
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>Real-time status of all monitored agents</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {agents.map((agent) => (
                <Dialog key={agent.id}>
                  <DialogTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {agent.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {agent.type} • {formatTimeAgo(agent.lastActivity)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium">{formatUptime(agent.uptime)}</p>
                          <p className="text-xs text-muted-foreground">uptime</p>
                        </div>
                        <StatusBadge status={agent.status} />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{agent.name}</DialogTitle>
                      <DialogDescription>
                        Detailed metrics and information
                      </DialogDescription>
                    </DialogHeader>
                    <AgentDetails agent={agent} />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
