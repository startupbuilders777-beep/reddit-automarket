import AgentDashboard from '@/components/dashboard/agent-dashboard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Agent Monitor</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring dashboard for your AI agents
        </p>
      </div>
      <AgentDashboard />
    </div>
  );
}
