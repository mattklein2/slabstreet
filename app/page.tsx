import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SlabStreet — The Bloomberg Terminal for Card Collectors",
  description: "Real-time market intelligence and investment ratings for sports card collectors.",
};

const pillars = [
  { label: "Market", weight: 30, score: 72, color: "#E2E8F0" },
  { label: "Scarcity", weight: 25, score: 65, color: "#CBD5E1" },
  { label: "Momentum", weight: 20, score: 81, color: "#94A3B8" },
  { label: "Performance", weight: 15, score: 78, color: "#64748B" },
  { label: "Risk", weight: 10, score: 88, color: "#475569" },
];

export default function Home() {
  return (
    <main
      style={{
        background: "#080808",
        minHeight: "100vh",
        fontFamily: "'Courier New', Courier, monospace",
        color: "#F1F5F9",
        overflowX: "hidden",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid #1E293B",
          padding: "0 48px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(8,8,8,0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#F8FAFC",
            textTransform: "uppercase",
          }}
        >
          SLAB<span style={{ color: "#94A3B8" }}>STREET</span>
        </span>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: "#475569",
            textTransform: "uppercase",
          }}
        >
          PRIVATE BETA
        </span>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "120px 48px 80px",
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Background grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "inline-block",
              border: "1px solid #1E293B",
              padding: "4px 12px",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "#64748B",
              textTransform: "uppercase",
              marginBottom: "32px",
            }}
          >
            MARKET INTELLIGENCE PLATFORM
          </div>

          <h1
            style={{
              fontSize: "clamp(42px, 7vw, 88px)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              fontFamily: "Georgia, 'Times New Roman', serif",
              marginBottom: "32px",
              color: "#F8FAFC",
            }}
          >
            The Bloomberg
            <br />
            <span
              style={{
                WebkitTextStroke: "1px #475569",
                color: "transparent",
              }}
            >
              Terminal
            </span>{" "}
            for
            <br />
            Card Collectors.
          </h1>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "#64748B",
              maxWidth: "480px",
              marginBottom: "48px",
              fontFamily: "'Courier New', monospace",
            }}
          >
            Real-time market data, scarcity analysis, and proprietary investment
            ratings for every slab in your portfolio.
          </p>

          <button
            style={{
              background: "#F1F5F9",
              color: "#080808",
              border: "none",
              padding: "14px 36px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
            }}
          >
            REQUEST ACCESS
          </button>
        </div>
      </section>

      {/* SLAB SCORE SHOWCASE */}
      <section
        style={{
          padding: "80px 48px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "#475569",
            textTransform: "uppercase",
            marginBottom: "48px",
            borderBottom: "1px solid #1E293B",
            paddingBottom: "16px",
          }}
        >
          SLAB SCORE™ — COMPOSITE INVESTMENT RATING
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
            background: "#1E293B",
            border: "1px solid #1E293B",
          }}
        >
          {/* Score panel */}
          <div
            style={{
              background: "#0F172A",
              padding: "48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                color: "#475569",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              LUKA DONCIC — PRIZM BASE PSA 10
            </div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                color: "#334155",
                marginBottom: "40px",
              }}
            >
              2023-24 SEASON · COMMON TIER
            </div>

            <div
              style={{
                fontSize: "120px",
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: "Georgia, serif",
                color: "#F8FAFC",
                marginBottom: "8px",
              }}
            >
              74
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#F1F5F9",
                  borderRadius: "50%",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.25em",
                  fontWeight: 700,
                  color: "#F1F5F9",
                }}
              >
                BUY
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "#334155", letterSpacing: "0.1em" }}>
              SCORE RANGE: 70–100 BUY · 40–69 HOLD · 0–39 SELL
            </div>
          </div>

          {/* Pillars panel */}
          <div style={{ background: "#080808", padding: "48px" }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                color: "#475569",
                textTransform: "uppercase",
                marginBottom: "32px",
              }}
            >
              PILLAR BREAKDOWN
            </div>

            {pillars.map((p) => (
              <div key={p.label} style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.15em",
                      color: "#94A3B8",
                      textTransform: "uppercase",
                    }}
                  >
                    {p.label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      color: "#64748B",
                    }}
                  >
                    {p.weight}% · {p.score}/100
                  </span>
                </div>
                <div
                  style={{
                    height: "2px",
                    background: "#1E293B",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      height: "2px",
                      background: p.color,
                      width: `${p.score}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          padding: "80px 48px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2px",
            background: "#1E293B",
            border: "1px solid #1E293B",
          }}
        >
          {[
            {
              num: "01",
              title: "Real-Time Market Data",
              body: "Live eBay sales feed and price history across every player, set, and grade. No more guessing what a card is worth.",
            },
            {
              num: "02",
              title: "Portfolio Intelligence",
              body: "Track your entire collection with cost basis, current market value, and gain/loss on every card you own.",
            },
            {
              num: "03",
              title: "Edge Detection",
              body: "Proprietary algorithms surface mispriced cards before the market corrects. Find the edge before everyone else.",
            },
          ].map((f) => (
            <div
              key={f.num}
              style={{
                background: "#080808",
                padding: "40px 32px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  color: "#334155",
                  marginBottom: "20px",
                }}
              >
                {f.num}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#E2E8F0",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "#475569",
                }}
              >
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #1E293B",
          padding: "32px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#334155",
            textTransform: "uppercase",
          }}
        >
          SLAB<span style={{ color: "#1E293B" }}>STREET</span>
        </span>
        <span style={{ fontSize: "11px", color: "#1E293B", letterSpacing: "0.1em" }}>
          © 2026 SLABSTREET. ALL RIGHTS RESERVED.
        </span>
      </footer>
    </main>
  );
}