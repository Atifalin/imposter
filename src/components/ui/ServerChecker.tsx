'use client';

import { useSocket } from '../../hooks/useSocket';

export function ServerChecker() {
  const { connected } = useSocket();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-surface-light px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-sm">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'}`} />
      <span className="text-white font-medium">
        {connected ? 'Server Online' : 'Reconnecting...'}
      </span>
    </div>
  );
}
