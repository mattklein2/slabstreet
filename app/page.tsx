"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const tickerItems = [
  { label: "WEMBY AUTO /25", val: "$2,840", change: "+8.4%", dir: "up" },
  { label: "WEMBY LOGOMAN 1/1", val: "UNACCOUNTED", change: "⚡ SIGNAL", dir: "up" },
  { label: "WEMBY RC PSA 10", val: "$480", change: "-2.1%", dir: "down" },
  { label: "MVP ODDS", val: "-320", change: "+DK", dir: "up" },
  { label: "WEMBY PRIZM SILVER", val: "$220", change: "+12.7%", dir: "up" },
  { label: "POP REPORT PSA 10", val: "847", change: "+23 NEW", dir: "up" },
];

const cardRows = [
  { name: "2023 Prizm Silver Auto /25", detail: "PSA 10 · Serial #14/25", price: "$2,840", change: "▲ +8.4% 7d", dir: "up" },
  { name: "2023 Prizm RC Base PSA 10", detail: "Pop: 847 · /10 variant avail", price: "$480", change: "▼ -2.1% 7d", dir: "down" },
  { name: "NT Logoman Auto 1/1", detail: "Status: UNACCOUNTED ⚡", price: "~$150K", change: "▲ BUY SIGNAL", dir: "up" },
  { name: "2024 Hoops Prizm Gold /10", detail: "Serial #03/10 · BGS 9.5", price: "$1,200", change: "▲ +12.7% 7d", dir: "up" },
];

const features = [
  { num: "01", icon: "📈", title: "Card Tracker", desc: "Price charts, trend signals, volume spikes, and edge alerts per card. Every eBay sale feeds directly into your dashboard in real time.", tag: "Live", live: true },
  { num: "02", icon: "🧠", title: "Player Intel", desc: "MVP odds, game logs, stats, news feed, and card correlation tables. Know how performance moves card prices before the market does.", tag: "Live", live: true },
  { num: "03", icon: "⚡", title: "Pull Tracker", desc: "Confirmed vs unaccounted 1/1 registry. The most powerful trading signal in the hobby — know the moment a key card surfaces publicly.", tag: "Live", live: true },
  { num: "04", icon: "💼", title: "Portfolio Tracker", desc: "Cost basis, unrealized P&L, buy/sell signals, and year-end tax summary. Your entire collection valued in real time.", tag: "Coming Soon", live: false },
  { num: "05", icon: "🔬", title: "Grade Decision Tool", desc: "Should you grade this card? ROI calculator weighs grading fees against pop report data and comparable sales. No more guessing.", tag: "Coming Soon", live: false },
];

const chartHeights = [30,35,28,40,38,45,42,50,47,55,52,48,58,62,60,68,65,72,70,75,73,80,78,85,82,88,90,87,92,96];

const PLAYERS = [
  { name: "Victor Wembanyama", team: "SAS", slug: "wemby", score: 74, signal: "BUY" },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof PLAYERS>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const bars = document.getElementById("chartBars");
    if (!bars) return;
    chartHeights.forEach((h, i) => {
      const bar = document.createElement("div");
      const isLast = i === chartHeights.length - 1;
      const isActive = i > chartHeights.length - 8;
      bar.className = "bar" + (isLast ? " highlight" : isActive ? " active" : "");
      bar.style.height = h + "%";
      bars.appendChild(bar);
    });
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(PLAYERS.filter(p =>
      p.name.toLowerCase().includes(q) || p.slug.includes(q) || p.team.toLowerCase().includes(q)
    ));
  }, [query]);

  return (
    <>
      <div className="ticker-wrap">
        <div className="ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div className="ticker-item" key={i}>
              <span className="label">{item.label}</span>
              <span className="val">{item.val}</span>
              <span className={item.dir}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>

      <nav>
        <div>
          <div className="logo">SLAB<span>STREET</span></div>
          <div className="nav-tag">Market Intelligence</div>
        </div>
        <div className="nav-right">
          <a href="#features" className="nav-link">Features</a>
          <button className="btn-early" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
            Learn More
          </button>
        </div>
      </nav>

      {/* SEARCH BAR */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "12px 24px",
        position: "relative",
        zIndex: 50,
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--bg)",
            border: `1px solid ${focused ? "var(--green)" : "var(--border)"}`,
            padding: "10px 16px",
            transition: "border-color 0.2s",
          }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "14px", color: "var(--muted)", flexShrink: 0 }}>⌕</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search player, team, or card..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                fontFamily: "var(--mono)",
                fontSize: "14px",
                color: "var(--text)",
                outline: "none",
                minWidth: 0,
              }}
            />
            {query.length > 0 && (
              <button
                onClick={() => setQuery("")}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "16px", padding: "0 4px", flexShrink: 0 }}
              >×</button>
            )}
          </div>

          {results.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--surface)",
              border: "1px solid var(--green)",
              borderTop: "none",
              zIndex: 200,
            }}>
              {results.map(p => (
                <div
                  key={p.slug}
                  onClick={() => router.push(`/players/${p.slug}`)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.15s",
                    gap: "12px",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#0f1318")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.1em", flexShrink: 0 }}>{p.team}</span>
                    <span style={{ fontFamily: "var(--display)", fontSize: "clamp(16px, 4vw, 22px)", color: "var(--text)", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.toUpperCase()}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--green)", letterSpacing: "0.1em" }}>SS {p.score}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "3px 10px", border: "1px solid var(--green)", color: "var(--green)" }}>{p.signal}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <section style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="hero">
          <div>
            <div className="hero-eyebrow fade-in">Card Market Intelligence</div>
            <h1 className="fade-in">
              THE <span className="accent">EDGE</span> SERIOUS TRADERS NEED
            </h1>
            <p className="hero-sub fade-in">
              Bloomberg Terminal meets card collecting. Real-time eBay comps, graded card signals, 1/1 pull tracking, and MVP odds — all in one platform built for collectors who trade to win.
            </p>
            <div className="hero-cta fade-in">
              <button className="btn-primary" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                See Features
              </button>
              <button className="btn-secondary" onClick={() => (document.querySelector("input") as HTMLInputElement)?.focus()}>
                Search Players →
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="card-terminal">
              <div className="terminal-header">
                <div className="terminal-title">Wemby Card Tracker · Live Feed</div>
                <div className="live-dot">LIVE</div>
              </div>
              {cardRows.map((row, i) => (
                <div className="card-row" key={i}>
                  <div>
                    <div className="card-name">{row.name}</div>
                    <div className="card-detail">{row.detail}</div>
                  </div>
                  <div className="card-price">
                    <div className="price">{row.price}</div>
                    <div className={`change ${row.dir}`}>{row.change}</div>
                  </div>
                </div>
              ))}
              <div className="mini-chart">
                <div className="chart-label">30-Day Price Index · Wemby Portfolio</div>
                <div className="chart-bars" id="chartBars"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-section">
        <div className="stat-box"><div className="stat-num">500<span>K+</span></div><div className="stat-label">Cards Tracked</div></div>
        <div className="stat-box"><div className="stat-num"><span>$</span>2.4M</div><div className="stat-label">Sales Indexed Daily</div></div>
        <div className="stat-box"><div className="stat-num">1<span>/1</span></div><div className="stat-label">Pull Registry Active</div></div>
        <div className="stat-box"><div className="stat-num">RT<span>+</span></div><div className="stat-label">Real-Time eBay Feed</div></div>
      </div>

      <section className="features-section" id="features">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Platform Features</div>
            <div className="section-title">BUILT FOR<br />TRADERS</div>
          </div>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.num}>
              <div className="feature-num">{f.num}</div>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className={`feature-tag${f.live ? " live" : ""}`}>{f.tag}</div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-logo">SLAB<span>STREET</span></div>
        <div className="footer-copy">© 2026 Slab Street · slabstreet.io · All rights reserved</div>
      </footer>
    </>
  );
}