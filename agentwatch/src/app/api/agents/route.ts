import { NextResponse } from 'next/server';
import { getAllAgents, getAgent } from '@/lib/agent-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const agent = getAgent(id);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json(agent);
  }

  const agents = getAllAgents();
  return NextResponse.json(agents);
}
