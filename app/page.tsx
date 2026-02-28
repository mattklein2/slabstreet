import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SlabStreet — The Bloomberg Terminal for Card Collectors",
  description: "Real-time market intelligence and investment ratings for sports card collectors.",
};

const pillars = [
  { label: "Market", weight: 30, score: 72 },
  { label: "Scarcity", weight: 25, score: 65 },
  { label: "Momentum", weight: 20, score: 81 },
  { label: "Performance", weight: 15, score: 78 },
  { label: "Risk", weight: 10, score: 88 },
];

export default function Home() {
  return (
    <main
      style={{
        background: "#020202",
        minHeight: "100vh",
        fontFamily: "'Courier New', Courier, monospace",
        color: "#E4FDE1",
        overflowX: "hidden",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid #0D2B0D",
          padding: "0 48px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(2,2,2,0.95)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#39FF14",
            textTransform: "uppercase",
          }}
        >
          SLAB<span style={{ color: "#1A6B1A" }}>STREET</span>
        </span>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: "#1A6B1A",
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "inline-block",
              border: "1px solid #0D2B0D",
              padding: "4px 12px",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "#1A6B1A",
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
              color: "#E4FDE1",
            }}
          >
            The Bloomberg
            <br />
            <span
              style={{
                WebkitTextStroke: "1px #1A6B1A",
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
              color: "#1A6B1A",
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
              background: "#39FF14",
              color: "#020202",
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
            color: "#1A6B1A",
            textTransform: "uppercase",
            marginBottom: "48px",
            borderBottom: "1px solid #0D2B0D",
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
            background: "#0D2B0D",
            border: "1px solid #0D2B0D",
          }}
        >
          {/* Score panel */}
          <div
            style={{
              background: "#020202",
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
                color: "#1A6B1A",
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
                color: "#0D2B0D",
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
                color: "#39FF14",
                marginBottom: "8px",
                textShadow: "0 0 40px rgba(57,255,20,0.3)",
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
                  background: "#39FF14",
                  borderRadius: "50%",
                  boxShadow: "0 0 8px #39FF14",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.25em",
                  fontWeight: 700,
                  color: "#39FF14",
                }}
              >
                BUY
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "#0D2B0D", letterSpacing: "0.1em" }}>
              SCORE RANGE: 70–100 BUY · 40–69 HOLD · 0–39 SELL
            </div>
          </div>

          {/* Pillars panel */}
          <div style={{ background: "#020202", padding: "48px" }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                color: "#1A6B1A",
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
                      color: "#39FF14",
                      textTransform: "uppercase",
                    }}
                  >
                    {p.label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      color: "#1A6B1A",
                    }}
                  >
                    {p.weight}% · {p.score}/100
                  </span>
                </div>
                <div
                  style={{
                    height: "2px",
                    background: "#0D2B0D",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      height: "2px",
                      background: "#39FF14",
                      width: `${p.score}%`,
                      boxShadow: "0 0 6px rgba(57,255,20,0.5)",
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
            background: "#0D2B0D",
            border: "1px solid #0D2B0D",
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
                background: "#020202",
                padding: "40px 32px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  color: "#0D2B0D",
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
                  color: "#39FF14",
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
                  color: "#1A6B1A",
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
          borderTop: "1px solid #0D2B0D",
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
            color: "#39FF14",
            textTransform: "uppercase",
          }}
        >
          SLAB<span style={{ color: "#1A6B1A" }}>STREET</span>
        </span>
        <span style={{ fontSize: "11px", color: "#0D2B0D", letterSpacing: "0.1em" }}>
          © 2026 SLABSTREET. ALL RIGHTS RESERVED.
        </span>
      </footer>
    </main>
  );
}