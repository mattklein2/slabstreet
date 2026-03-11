'use client';

import { useTheme } from '../ThemeProvider';

interface ScoreBugCardProps {
  homeTeam: string;
  awayTeam: string;
  homeAbbrev: string;
  awayAbbrev: string;
  homeScore: string | null;
  awayScore: string | null;
  status: string;
  period: number | null;
  clock: string | null;
  time: string;
  boxscoreUrl: string | null;
  espnLeague: string;
}

function logoUrl(league: string, abbrev: string): string {
  return `https://a.espncdn.com/i/teamlogos/${league}/500/${abbrev.toLowerCase()}.png`;
}

export default function ScoreBugCard({
  homeTeam,
  awayTeam,
  homeAbbrev,
  awayAbbrev,
  homeScore,
  awayScore,
  status,
  period,
  clock,
  time,
  boxscoreUrl,
  espnLeague,
}: ScoreBugCardProps) {
  const { colors: c } = useTheme();

  const isLive =
    status === 'In Progress' ||
    status === 'Halftime' ||
    status === 'End of Period';
  const isFinal = status === 'Final';
  const hasScores = homeScore !== null && awayScore !== null;

  // Determine winner for bold highlighting
  const homeWins =
    isFinal && hasScores && Number(homeScore) > Number(awayScore);
  const awayWins =
    isFinal && hasScores && Number(awayScore) > Number(homeScore);

  // Status display
  let statusText = time;
  let statusColor = c.muted;
  if (isLive) {
    statusText = clock && period ? `Q${period} · ${clock}` : 'LIVE';
    statusColor = c.green;
  } else if (isFinal) {
    statusText = 'FINAL';
    statusColor = c.muted;
  }

  const card = (
    <div
      className="flex flex-col rounded-lg overflow-hidden shrink-0"
      style={{
        width: 180,
        background: c.surface,
        border: isLive ? `2px solid ${c.green}` : `1px solid ${c.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: boxscoreUrl ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        if (boxscoreUrl) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {/* Top accent stripe */}
      <div
        style={{
          height: 3,
          background: isLive ? c.green : c.cyan,
        }}
      />

      {/* Team logos row */}
      <div className="flex items-center justify-center gap-4 pt-3 pb-1 px-3">
        <div className="flex flex-col items-center gap-1">
          <img
            src={logoUrl(espnLeague, awayAbbrev)}
            alt={awayAbbrev}
            width={36}
            height={36}
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span
            className="font-body text-[11px] font-semibold"
            style={{
              color: awayWins ? c.text : c.muted,
            }}
          >
            {awayAbbrev}
          </span>
        </div>

        {/* Score or VS */}
        <div className="flex flex-col items-center">
          {hasScores ? (
            <div className="flex items-center gap-1.5">
              <span
                className="font-display text-[22px] leading-none"
                style={{ color: awayWins ? c.text : c.muted }}
              >
                {awayScore}
              </span>
              <span
                className="font-body text-[10px]"
                style={{ color: c.muted }}
              >
                –
              </span>
              <span
                className="font-display text-[22px] leading-none"
                style={{ color: homeWins ? c.text : c.muted }}
              >
                {homeScore}
              </span>
            </div>
          ) : (
            <span
              className="font-body text-[11px] font-medium"
              style={{ color: c.muted }}
            >
              VS
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <img
            src={logoUrl(espnLeague, homeAbbrev)}
            alt={homeAbbrev}
            width={36}
            height={36}
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span
            className="font-body text-[11px] font-semibold"
            style={{
              color: homeWins ? c.text : c.muted,
            }}
          >
            {homeAbbrev}
          </span>
        </div>
      </div>

      {/* Status line */}
      <div className="flex items-center justify-center gap-1.5 pb-3 pt-1">
        {isLive && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: c.green }}
          />
        )}
        <span
          className="font-body text-[10px] font-medium uppercase tracking-wider"
          style={{ color: statusColor }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );

  if (boxscoreUrl) {
    return (
      <a
        href={boxscoreUrl}
        className="block no-underline"
        style={{ textDecoration: 'none' }}
      >
        {card}
      </a>
    );
  }

  return card;
}
