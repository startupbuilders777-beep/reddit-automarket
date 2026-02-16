import { NextResponse } from 'next/server';
import { getAllAgents, updateAgent } from '@/lib/agent-store';

export async function POST() {
  const agents = getAllAgents();
  
  agents.forEach(agent => {
    if (agent.status === 'running') {
      updateAgent(agent.id, {
        uptime: agent.uptime + 1,
        cpuUsage: Math.min(100, Math.max(10, agent.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(64, agent.memoryUsage + (Math.random() - 0.5) * 20),
        lastActivity: new Date(),
      });
    }
  });
  
  return NextResponse.json({ success: true });
}
