'use client';

import { useTheme } from '../ThemeProvider';

interface GameRowProps {
  homeTeam: string;
  awayTeam: string;
  time: string;
  spread?: string;
}

export default function GameRow({ homeTeam, awayTeam, time, spread }: GameRowProps) {
  const { colors: c } = useTheme();

  return (
    <div
      className="flex items-center justify-between rounded px-5 py-3.5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div>
        <div className="font-mono text-xs font-semibold" style={{ color: c.text }}>
          {awayTeam} vs {homeTeam}
        </div>
        <div className="font-mono text-[9px] mt-0.5" style={{ color: c.muted }}>
          {time}
        </div>
      </div>
      {spread && (
        <div className="text-right">
          <div className="font-mono text-[10px]" style={{ color: c.muted }}>SPREAD</div>
          <div className="font-mono text-xs" style={{ color: c.text }}>{spread}</div>
        </div>
      )}
    </div>
  );
}
