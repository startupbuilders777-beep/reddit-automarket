import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { startSimulation } from '@/lib/agent-store';

// Start the agent simulation
if (typeof window === 'undefined') {
  startSimulation();
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentWatch - AI Agent Monitoring',
  description: 'Real-time monitoring dashboard for AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-xl font-bold">AgentWatch</h1>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
