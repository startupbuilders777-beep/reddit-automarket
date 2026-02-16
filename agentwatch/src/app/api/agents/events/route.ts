import { getAllAgents, subscribe } from '@/lib/agent-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const agents = getAllAgents();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(agents)}\n\n`));
      
      // Subscribe to updates
      const unsubscribe = subscribe((updatedAgents) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updatedAgents)}\n\n`));
        } catch {
          // Stream might be closed
          unsubscribe();
        }
      });
      
      // Clean up on close
      return () => {
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
