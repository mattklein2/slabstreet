'use client';

import { useTheme } from '../ThemeProvider';

const tickerItems = [
  { label: 'WEMBY AUTO /25',      value: '$2,840',       change: '+8.4%',    up: true  },
  { label: 'WEMBY LOGOMAN 1/1',   value: 'UNACCOUNTED',  change: '⚡ SIGNAL', up: true  },
  { label: 'WEMBY RC PSA 10',     value: '$480',         change: '-2.1%',    up: false },
  { label: 'MVP ODDS',            value: '-320',         change: '+DK',      up: true  },
  { label: 'WEMBY PRIZM SILVER',  value: '$220',         change: '+12.7%',   up: true  },
  { label: 'POP REPORT PSA 10',   value: '847',          change: '+23 NEW',  up: true  },
];

export default function Ticker() {
  const { colors: c } = useTheme();
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div
      className="overflow-hidden whitespace-nowrap py-1.5"
      style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}
    >
      <div className="inline-flex" style={{ animation: 'ticker 28s linear infinite' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 px-7 font-mono text-[11px]"
            style={{ borderRight: `1px solid ${c.border}` }}
          >
            <span className="tracking-wider" style={{ color: c.muted }}>{item.label}</span>
            <span className="font-bold" style={{ color: c.text }}>{item.value}</span>
            <span style={{ color: item.up ? c.green : c.red }}>{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
