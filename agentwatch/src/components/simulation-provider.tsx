'use client';

import { useEffect, useState } from 'react';

export default function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Fetch agents periodically to trigger server-side simulation
    const interval = setInterval(async () => {
      try {
        await fetch('/api/agents', { cache: 'no-store' });
      } catch {
        // Ignore errors
      }
    }, 5000);
    
    setStarted(true);
    
    return () => clearInterval(interval);
  }, []);

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
