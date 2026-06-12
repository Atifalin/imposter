'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { PlayerProvider } from './PlayerProvider';
import { SocketProvider } from './SocketProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <PlayerProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </PlayerProvider>
    </QueryProvider>
  );
}
