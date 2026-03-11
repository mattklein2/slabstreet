'use client';

import { useTheme } from '../ThemeProvider';

interface ScoreBugRowProps {
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

export default function ScoreBugRow({
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
}: ScoreBugRowProps) {
  const { colors: c } = useTheme();

  const isLive =
    status === 'In Progress' ||
    status === 'Halftime' ||
    status === 'End of Period';
  const isFinal = status === 'Final';
  const hasScores = homeScore !== null && awayScore !== null;

  const homeWins =
    isFinal && hasScores && Number(homeScore) > Number(awayScore);
  const awayWins =
    isFinal && hasScores && Number(awayScore) > Number(homeScore);

  let statusText = time;
  let statusColor = c.muted;
  if (isLive) {
    statusText = clock && period ? `Q${period} ${clock}` : 'LIVE';
    statusColor = c.green;
  } else if (isFinal) {
    statusText = 'FINAL';
    statusColor = c.muted;
  }

  const row = (
    <div
      className="flex items-center transition-colors duration-100"
      style={{
        background: c.surface,
        border: isLive ? `1px solid ${c.green}` : `1px solid ${c.border}`,
        borderRadius: 12,
        padding: '10px 14px',
        cursor: boxscoreUrl ? 'pointer' : 'default',
      }}
    >
      {/* Away team */}
      <div className="flex items-center gap-1.5 w-[72px]">
        <img
          src={logoUrl(espnLeague, awayAbbrev)}
          alt={awayAbbrev}
          width={18}
          height={18}
          style={{ objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span
          className="font-body text-[12px] font-semibold"
          style={{ color: awayWins ? c.text : c.muted }}
        >
          {awayAbbrev}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-1 flex-1">
        {hasScores ? (
          <>
            <span
              className="font-display text-[15px] leading-none w-7 text-right"
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
              className="font-display text-[15px] leading-none w-7"
              style={{ color: homeWins ? c.text : c.muted }}
            >
              {homeScore}
            </span>
          </>
        ) : (
          <span
            className="font-body text-[10px] font-medium"
            style={{ color: c.muted }}
          >
            VS
          </span>
        )}
      </div>

      {/* Home team */}
      <div className="flex items-center gap-1.5 w-[72px] justify-end">
        <span
          className="font-body text-[12px] font-semibold"
          style={{ color: homeWins ? c.text : c.muted }}
        >
          {homeAbbrev}
        </span>
        <img
          src={logoUrl(espnLeague, homeAbbrev)}
          alt={homeAbbrev}
          width={18}
          height={18}
          style={{ objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-1 ml-2 w-[52px] justify-end">
        {isLive && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: c.green }}
          />
        )}
        <span
          className="font-body text-[9px] font-medium uppercase tracking-wide"
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
        {row}
      </a>
    );
  }

  return row;
}
