'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LeagueId } from '@/lib/leagues';

type LeagueFilter = 'ALL' | LeagueId;

interface LeagueContextType {
  activeLeague: LeagueFilter;
  setActiveLeague: (league: LeagueFilter) => void;
}

const LeagueContext = createContext<LeagueContextType | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [activeLeague, setActiveLeague] = useState<LeagueFilter>('ALL');

  const handleSetLeague = useCallback((league: LeagueFilter) => {
    setActiveLeague(league);
  }, []);

  return (
    <LeagueContext.Provider value={{ activeLeague, setActiveLeague: handleSetLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
}
