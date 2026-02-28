"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const slabScore = 74;
const signal = "BUY";

const pillars = [
  { label: "Market", weight: 30, score: 72 },
  { label: "Scarcity", weight: 25, score: 65 },
  { label: "Momentum", weight: 20, score: 81 },
  { label: "Performance", weight: 15, score: 78 },
  { label: "Risk", weight: 10, score: 88 },
];

const cards = [
  { name: "2023-24 Prizm Base", grade: "PSA 10", pop: "26,000", tier: "COMMON", price: "$480", change: "▼ -2.1% 7d", dir: "down", serial: null },
  { name: "2023-24 Prizm Silver", grade: "PSA 10", pop: "2,000", tier: "MID", price: "$1,240", change: "▲ +5.3% 7d", dir: "up", serial: null },
  { name: "2023-24 Prizm Silver Auto /25", grade: "PSA 10", pop: "142", tier: "MID", price: "$2,840", change: "▲ +8.4% 7d", dir: "up", serial: "/25" },
  { name: "2023-24 National Treasures RPA", grade: "PSA 10", pop: "28", tier: "RARE", price: "$18,500", change: "▲ +3.2% 7d", dir: "up", serial: "/99" },
  { name: "NT Logoman Auto", grade: "PSA 10", pop: "1", tier: "RARE", price: "~$150K", change: "▲ UNACCOUNTED", dir: "up", serial: "1/1" },
  { name: "2024-25 Hoops Prizm Gold", grade: "BGS 9.5", pop: "34", tier: "MID", price: "$1,200", change: "▲ +12.7% 7d", dir: "up", serial: "/10" },
];

const recentSales = [
  { card: "2023-24 Prizm Silver Auto /25", grade: "PSA 10", price: "$2,840", date: "Feb 27" },
  { card: "2023-24 Prizm Base", grade: "PSA 10", price: "$472", date: "Feb 27" },
  { card: "NT RPA /99", grade: "PSA 10", price: "$18,200", date: "Feb 26" },
  { card: "2023-24 Prizm Silver", grade: "PSA 10", price: "$1,190", date: "Feb 26" },
  { card: "2024-25 Hoops Prizm Gold /10", grade: "BGS 9.5", price: "$1,155", date: "Feb 25" },
  { card: "2023-24 Prizm Base", grade: "PSA 9", price: "$210", date: "Feb 25" },
];

const news = [
  { headline: "Wembanyama drops 40-point triple-double in Spurs win over Lakers", source: "ESPN", time: "2h ago" },
  { headline: "Wemby MVP odds tighten as Spurs surge to .500 record", source: "Bleacher Report", time: "5h ago" },
  { headline: "Victor Wembanyama named Western Conference Player of the Week", source: "NBA.com", time: "1d ago" },
  { headline: "Spurs front office signals long-term commitment around Wembanyama", source: "The Athletic", time: "2d ago" },
  { headline: "Wemby card market surges following historic 5-block performance", source: "CBS Sports", time: "3d ago" },
];

const odds = [
  { market: "NBA MVP", odds: "-320", book: "DraftKings", dir: "up" },
  { market: "Defensive Player of Year", odds: "-450", book: "FanDuel", dir: "up" },
  { market: "NBA Champion", odds: "+2800", book: "BetMGM", dir: "neutral" },
  { market: "All-NBA First Team", odds: "-900", book: "DraftKings", dir: "up" },
];

const stats = [
  { label: "PPG", val: "24.8" },
  { label: "RPG", val: "10.6" },
  { label: "APG", val: "3.9" },
  { label: "BPG", val: "3.7" },
  { label: "FG%", val: "49.2" },
  { label: "GP", val: "54" },
];

const historyData = {
  daily: [
    { label: "Feb 21", score: 70 }, { label: "Feb 22", score: 71 }, { label: "Feb 23", score: 69 },
    { label: "Feb 24", score: 72 }, { label: "Feb 25", score: 73 }, { label: "Feb 26", score: 72 },
    { label: "Feb 27", score: 74 }, { label: "Feb 28", score: 74 },
  ],
  weekly: [
    { label: "Nov W1", score: 58 }, { label: "Nov W2", score: 61 }, { label: "Nov W3", score: 60 },
    { label: "Nov W4", score: 63 }, { label: "Dec W1", score: 62 }, { label: "Dec W2", score: 65 },
    { label: "Dec W3", score: 63 }, { label: "Dec W4", score: 64 }, { label: "Jan W1", score: 66 },
    { label: "Jan W2", score: 68 }, { label: "Jan W3", score: 67 }, { label: "Jan W4", score: 70 },
    { label: "Feb W1", score: 71 }, { label: "Feb W2", score: 72 }, { label: "Feb W3", score: 73 },
    { label: "Feb W4", score: 74 },
  ],
  monthly: [
    { label: "Mar 23", score: 48 }, { label: "Apr 23", score: 50 }, { label: "May 23", score: 51 },
    { label: "Jun 23", score: 52 }, { label: "Jul 23", score: 53 }, { label: "Aug 23", score: 54 },
    { label: "Sep 23", score: 54 }, { label: "Oct 23", score: 56 }, { label: "Nov 23", score: 58 },
    { label: "Dec 23", score: 57 }, { label: "Jan 24", score: 60 }, { label: "Feb 24", score: 62 },
    { label: "Mar 24", score: 63 }, { label: "Apr 24", score: 64 }, { label: "May 24", score: 63 },
    { label: "Oct 24", score: 65 }, { label: "Nov 24", score: 67 }, { label: "Dec 24", score: 66 },
    { label: "Jan 25", score: 70 }, { label: "Feb 25", score: 74 },
  ],
  yearly: [
    { label: "2023", score: 52 },
    { label: "2024", score: 63 },
    { label: "2025", score: 74 },
  ],
};

type DrillDown = "daily" | "weekly" | "monthly" | "yearly";

function SlabScoreChart({ drill }: { drill: DrillDown }) {
  const data = historyData[drill];
  const W = 700;
  const H = 200;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xStep = chartW / (data.length - 1);
  const points = data.map((d, i) => ({
    x: padL + i * xStep,
    y: padT + chartH - (d.score / 100) * chartH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

  const yLabels = [0, 25, 50, 75, 100];
  const showEvery = data.length > 12 ? Math.ceil(data.length / 8) : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {yLabels.map(v => {
        const y = padT + chartH - (v / 100) * chartH;
        return (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#1e2530" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fill="#4a5568" fontSize="10" fontFamily="IBM Plex Mono">{v}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ff87" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke="#00ff87" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        i % showEvery === 0 && (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#00ff87" />
            <text x={p.x} y={padT + chartH + 20} textAnchor="middle" fill="#4a5568" fontSize="9" fontFamily="IBM Plex Mono">{p.label}</text>
          </g>
        )
      ))}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="#00ff87" style={{ filter: "drop-shadow(0 0 6px #00ff87)" }} />
    </svg>
  );
}

export default function WembyPage() {
  const router = useRouter();
  const [drill, setDrill] = useState<DrillDown>("monthly");

  return (
    <>
      <nav>
        <div>
          <div className="logo" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            SLAB<span>STREET</span>
          </div>
          <div className="nav-tag">Market Intelligence</div>
        </div>
        <div className="nav-right">
          <button
            onClick={() => router.push("/")}
            style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            ← BACK
          </button>
        </div>
      </nav>

      <div style={{ borderBottom: "1px solid var(--border)", padding: "48px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--green)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
              SAS · CENTER · #1
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "0.02em", color: "var(--text)" }}>
              VICTOR<br />WEMBANYAMA
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 3vw, 42px)", letterSpacing: "0.08em", color: "var(--text)", marginBottom: "4px" }}>
              SLAB SCORE<span style={{ color: "var(--green)" }}>™</span>
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: "112px", lineHeight: 1, color: "var(--green)", textShadow: "0 0 40px rgba(0,255,135,0.3)" }}>
              {slabScore}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: "16px", letterSpacing: "0.25em", color: "var(--green)", fontWeight: 700 }}>{signal}</span>
            </div>
          </div>
        </div>

        {/* HISTORICAL CHART */}
        <div style={{ marginTop: "40px", background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              SLAB SCORE HISTORY
            </div>
            <div style={{ display: "flex", gap: "2px" }}>
              {(["daily", "weekly", "monthly", "yearly"] as DrillDown[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDrill(d)}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    background: drill === d ? "var(--green)" : "transparent",
                    color: drill === d ? "var(--bg)" : "var(--muted)",
                    border: "1px solid",
                    borderColor: drill === d ? "var(--green)" : "var(--border)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <SlabScoreChart drill={drill} />
        </div>

        {/* PILLARS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px", marginTop: "32px" }}>
          {pillars.map(p => (
            <div key={p.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{p.label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--green)", fontWeight: 600 }}>{p.score}</span>
              </div>
              <div style={{ height: "2px", background: "var(--border)" }}>
                <div style={{ height: "2px", background: "var(--green)", width: `${p.score}%`, boxShadow: "0 0 6px rgba(0,255,135,0.4)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", borderBottom: "1px solid var(--border)" }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ padding: "28px 32px", borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: "44px", color: "var(--text)", marginBottom: "6px" }}>{s.val}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "0.15em" }}>{s.label} · 2024-25</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "48px" }}>

          <div>
            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--green)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                CARD LISTINGS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border)" }}>
                {cards.map((c, i) => (
                  <div key={i}
                    style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "24px", alignItems: "center", padding: "18px 20px", background: "var(--bg)", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
                        {c.name} {c.serial && <span style={{ color: "var(--green)" }}>{c.serial}</span>}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>{c.grade} · Pop: {c.pop}</div>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.15em", padding: "3px 10px", border: "1px solid var(--border)", color: "var(--muted)", textTransform: "uppercase" }}>{c.tier}</span>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "15px", color: "var(--text)", fontWeight: 600, textAlign: "right" }}>{c.price}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: c.dir === "up" ? "var(--green)" : "var(--red)", textAlign: "right", minWidth: "110px" }}>{c.change}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--green)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                RECENT SALES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "24px", padding: "12px 20px", background: "var(--surface)" }}>
                  {["CARD", "GRADE", "PRICE", "DATE"].map(h => (
                    <div key={h} style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "0.15em" }}>{h}</div>
                  ))}
                </div>
                {recentSales.map((s, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "24px", alignItems: "center", padding: "16px 20px", background: "var(--bg)" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text)" }}>{s.card}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--muted)" }}>{s.grade}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "14px", color: "var(--green)", fontWeight: 600 }}>{s.price}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>{s.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--green)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                BETTING ODDS · MOMENTUM SIGNALS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border)" }}>
                {odds.map((o, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg)" }}>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text)", marginBottom: "4px" }}>{o.market}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>{o.book}</div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "18px", fontWeight: 600, color: o.dir === "up" ? "var(--green)" : "var(--text)" }}>{o.odds}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--green)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                RECENT NEWS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border)" }}>
                {news.map((n, i) => (
                  <div key={i}
                    style={{ padding: "18px", background: "var(--bg)", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}
                  >
                    <div style={{ fontFamily: "var(--body)", fontSize: "14px", color: "var(--text)", lineHeight: 1.5, marginBottom: "8px" }}>{n.headline}</div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--green)", letterSpacing: "0.1em" }}>{n.source}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-logo">SLAB<span>STREET</span></div>
        <div className="footer-copy">© 2026 Slab Street · slabstreet.io · All rights reserved</div>
      </footer>
    </>
  );
}