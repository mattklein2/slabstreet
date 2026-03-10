'use client';

import { useTheme } from '../ThemeProvider';

interface ScheduleGameRowProps {
  homeTeam: string;
  awayTeam: string;
  time: string;
  homeScore?: string;
  awayScore?: string;
  status: string;
  spread?: string;
  total?: string;
  boxscoreUrl?: string;
  league: string;
}

export default function ScheduleGameRow({
  homeTeam,
  awayTeam,
  time,
  homeScore,
  awayScore,
  status,
  spread,
  total,
  boxscoreUrl,
}: ScheduleGameRowProps) {
  const { colors: c } = useTheme();

  const isLive = status === 'in_progress' || status === 'halftime';
  const isFinal = status === 'final';
  const hasScores = homeScore !== undefined && awayScore !== undefined;

  const content = (
    <div
      className="flex items-center justify-between rounded px-5 py-3.5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      {/* Left side: teams + scores + status */}
      <div className="flex flex-col gap-0.5">
        <div className="font-mono text-xs font-semibold" style={{ color: c.text }}>
          {awayTeam} @ {homeTeam}
        </div>

        {hasScores && (
          <div
            className="font-mono text-sm font-bold"
            style={{ color: isFinal ? c.text : c.green }}
          >
            {awayScore} - {homeScore}
          </div>
        )}

        <div className="flex items-center gap-2 mt-0.5">
          {isLive && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: c.green }}
              />
              <span
                className="font-mono text-[10px] font-bold uppercase"
                style={{ color: c.green }}
              >
                LIVE
              </span>
            </span>
          )}
          {isFinal && (
            <span className="font-mono text-[10px] uppercase" style={{ color: c.muted }}>
              FINAL
            </span>
          )}
          {!isLive && !isFinal && (
            <span className="font-mono text-[10px]" style={{ color: c.muted }}>
              {time}
            </span>
          )}
        </div>
      </div>

      {/* Right side: odds info */}
      {(spread || total) && (
        <div className="text-right flex flex-col gap-0.5">
          {spread && (
            <div>
              <div className="font-mono text-[9px] uppercase" style={{ color: c.muted }}>
                SPREAD
              </div>
              <div className="font-mono text-xs" style={{ color: c.text }}>
                {spread}
              </div>
            </div>
          )}
          {total && (
            <div>
              <div className="font-mono text-[9px] uppercase" style={{ color: c.muted }}>
                O/U
              </div>
              <div className="font-mono text-xs" style={{ color: c.text }}>
                {total}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (boxscoreUrl && isFinal) {
    return (
      <a
        href={boxscoreUrl}
        className="block no-underline rounded hover:opacity-80 transition-opacity"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return content;
}
