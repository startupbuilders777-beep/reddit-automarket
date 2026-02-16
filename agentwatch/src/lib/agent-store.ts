// In-memory agent store for real-time agent state
// In production, this would be backed by Redis

export type AgentStatus = 'running' | 'idle' | 'error';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  type: string;
  uptime: number; // seconds
  lastActivity: Date;
  cpuUsage: number;
  memoryUsage: number;
  tasksCompleted: number;
  tasksFailed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentStore {
  agents: Map<string, Agent>;
  subscribers: Set<(agents: Agent[]) => void>;
}

const store: AgentStore = {
  agents: new Map(),
  subscribers: new Set(),
};

// Initialize with some demo agents
function initializeDemoAgents() {
  const demoAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'Builder Agent',
      status: 'running',
      type: 'openai',
      uptime: 3600,
      lastActivity: new Date(),
      cpuUsage: 45,
      memoryUsage: 256,
      tasksCompleted: 127,
      tasksFailed: 3,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    },
    {
      id: 'agent-2',
      name: 'QA Agent',
      status: 'idle',
      type: 'anthropic',
      uptime: 7200,
      lastActivity: new Date(Date.now() - 300000),
      cpuUsage: 12,
      memoryUsage: 128,
      tasksCompleted: 89,
      tasksFailed: 1,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(),
    },
    {
      id: 'agent-3',
      name: 'Deploy Agent',
      status: 'error',
      type: 'custom',
      uptime: 0,
      lastActivity: new Date(Date.now() - 60000),
      cpuUsage: 0,
      memoryUsage: 0,
      tasksCompleted: 45,
      tasksFailed: 12,
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(),
    },
  ];

  demoAgents.forEach(agent => store.agents.set(agent.id, agent));
}

// Initialize demo data
initializeDemoAgents();

export function getAllAgents(): Agent[] {
  return Array.from(store.agents.values());
}

export function getAgent(id: string): Agent | undefined {
  return store.agents.get(id);
}

export function updateAgent(id: string, updates: Partial<Agent>): Agent | undefined {
  const agent = store.agents.get(id);
  if (agent) {
    const updatedAgent = { ...agent, ...updates, updatedAt: new Date() };
    store.agents.set(id, updatedAgent);
    notifySubscribers();
    return updatedAgent;
  }
  return undefined;
}

export function subscribe(callback: (agents: Agent[]) => void): () => void {
  store.subscribers.add(callback);
  return () => {
    store.subscribers.delete(callback);
  };
}

function notifySubscribers() {
  const agents = getAllAgents();
  store.subscribers.forEach(callback => callback(agents));
}

// Simulate real-time updates (for demo purposes)
export function startSimulation() {
  setInterval(() => {
    const agents = getAllAgents();
    agents.forEach(agent => {
      if (agent.status === 'running') {
        // Update uptime and metrics
        updateAgent(agent.id, {
          uptime: agent.uptime + 1,
          cpuUsage: Math.min(100, Math.max(10, agent.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(64, agent.memoryUsage + (Math.random() - 0.5) * 20),
          lastActivity: new Date(),
        });
      }
    });
  }, 2000);
}
