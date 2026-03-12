'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetEmpty } from './WidgetShell';
import { getUpcomingEvents, type CatalystEvent, type EventCategory } from '@/lib/catalyst-events';

// ─── CATEGORY STYLING ────────────────────────────────────────

function useCategoryColor(category: EventCategory): string {
  const { colors: c } = useTheme();
  const map: Record<EventCategory, string> = {
    playoffs: c.red,
    draft: c.purple,
    freeagency: c.cyan,
    allstar: c.amber,
    award: c.green,
    season: c.orange,
    international: c.muted,
  };
  return map[category];
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  playoffs: 'PLAYOFFS',
  draft: 'DRAFT',
  freeagency: 'FREE AGENCY',
  allstar: 'ALL-STAR',
  award: 'AWARD',
  season: 'SEASON',
  international: 'INTERNATIONAL',
};

// ─── DATE HELPERS ────────────────────────────────────────────

function formatDate(dateStr: string, endDateStr?: string): string {
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid TZ issues
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();

  if (!endDateStr) return `${month} ${day}`;

  const end = new Date(endDateStr + 'T12:00:00');
  const endMonth = end.toLocaleString('en-US', { month: 'short' });
  const endDay = end.getDate();

  if (month === endMonth) return `${month} ${day}–${endDay}`;
  return `${month} ${day} – ${endMonth} ${endDay}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T12:00:00');
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getTimeGroup(dateStr: string): 'THIS WEEK' | 'THIS MONTH' | 'COMING UP' {
  const days = daysUntil(dateStr);
  if (days <= 7) return 'THIS WEEK';
  if (days <= 30) return 'THIS MONTH';
  return 'COMING UP';
}

// ─── EVENT ROW ───────────────────────────────────────────────

function EventRow({ event }: { event: CatalystEvent }) {
  const { colors: c } = useTheme();
  const catColor = useCategoryColor(event.category);
  const days = daysUntil(event.date);
  const isHappening = days <= 0;
  const isImminent = days > 0 && days <= 3;

  return (
    <div
      className="flex items-start gap-3"
      style={{
        padding: '14px 0',
        borderBottom: `1px solid ${c.border}`,
      }}
    >
      {/* Color dot + date */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 60 }}>
        <div
          className="font-mono text-[13px] font-semibold leading-tight text-center"
          style={{ color: c.text }}
        >
          {formatDate(event.date, event.endDate)}
        </div>
        {isHappening ? (
          <span
            className="font-mono text-[10px] font-bold tracking-wider mt-1 px-1.5 py-0.5"
            style={{
              color: c.surface,
              background: catColor,
              borderRadius: 4,
            }}
          >
            NOW
          </span>
        ) : isImminent ? (
          <span
            className="font-mono text-[10px] font-bold tracking-wider mt-1"
            style={{ color: catColor }}
          >
            {days}d away
          </span>
        ) : (
          <span
            className="font-mono text-[10px] mt-1"
            style={{ color: c.muted }}
          >
            {days}d
          </span>
        )}
      </div>

      {/* Impact indicator */}
      <div className="flex flex-col items-center justify-start shrink-0 pt-1">
        <div
          style={{
            width: event.impact === 'high' ? 10 : 7,
            height: event.impact === 'high' ? 10 : 7,
            borderRadius: '50%',
            background: catColor,
            opacity: event.impact === 'high' ? 1 : 0.5,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-body text-[14px] font-semibold"
            style={{ color: c.text }}
          >
            {event.title}
          </span>
          <span
            className="font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5"
            style={{
              color: catColor,
              background: `${catColor}14`,
              borderRadius: 4,
            }}
          >
            {CATEGORY_LABELS[event.category]}
          </span>
          {/* League pills */}
          {event.leagues.map((lg) => (
            <span
              key={lg}
              className="font-mono text-[9px] tracking-wider px-1.5 py-0.5"
              style={{
                color: c.muted,
                background: `${c.muted}14`,
                borderRadius: 4,
              }}
            >
              {lg}
            </span>
          ))}
        </div>
        <div
          className="font-body text-[12px] leading-relaxed mt-1"
          style={{ color: c.text, opacity: 0.7 }}
        >
          {event.description}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN WIDGET ─────────────────────────────────────────────

const INITIAL_SHOW = 6;

export default function CatalystLookAhead() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [showAll, setShowAll] = useState(false);

  const events = useMemo(() => {
    const league = activeLeague === 'ALL' ? undefined : activeLeague;
    return getUpcomingEvents(league);
  }, [activeLeague]);

  // Group events
  const grouped = useMemo(() => {
    const groups: { label: string; events: CatalystEvent[] }[] = [
      { label: 'THIS WEEK', events: [] },
      { label: 'THIS MONTH', events: [] },
      { label: 'COMING UP', events: [] },
    ];

    const visible = showAll ? events : events.slice(0, INITIAL_SHOW);

    for (const event of visible) {
      const group = getTimeGroup(event.date);
      if (group === 'THIS WEEK') groups[0].events.push(event);
      else if (group === 'THIS MONTH') groups[1].events.push(event);
      else groups[2].events.push(event);
    }

    return groups.filter((g) => g.events.length > 0);
  }, [events, showAll]);

  const hasMore = events.length > INITIAL_SHOW && !showAll;

  return (
    <WidgetShell
      title="LOOK AHEAD"
      icon="📅"
      accentColor={c.amber}
    >
      {events.length === 0 ? (
        <WidgetEmpty message="No upcoming events for this league" />
      ) : (
        <div>
          {grouped.map((group) => (
            <div key={group.label}>
              {/* Group header */}
              <div
                className="font-display text-[11px] tracking-[3px] font-bold mt-4 mb-1"
                style={{
                  color: group.label === 'THIS WEEK' ? c.amber : c.muted,
                }}
              >
                {group.label}
              </div>
              {group.events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          ))}

          {/* Show more / Show less */}
          {(hasMore || showAll) && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="font-body text-[12px] cursor-pointer"
                style={{
                  color: c.muted,
                  background: 'none',
                  border: `1px solid ${c.border}`,
                  borderRadius: 8,
                  padding: '6px 16px',
                }}
              >
                {showAll
                  ? 'Show less'
                  : `Show ${events.length - INITIAL_SHOW} more events`}
              </button>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
