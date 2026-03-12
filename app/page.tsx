export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1a',
        color: '#e8edf5',
        fontFamily: "'IBM Plex Sans', sans-serif",
        padding: '2rem',
      }}
    >
      {/* Logo */}
      <h1
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          letterSpacing: '8px',
          color: '#00ff87',
          marginBottom: '0.5rem',
          lineHeight: 1,
        }}
      >
        SLABSTREET
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
          letterSpacing: '4px',
          color: '#556677',
          textTransform: 'uppercase',
          marginBottom: '3rem',
        }}
      >
        Something new is coming
      </p>

      {/* Divider line */}
      <div
        style={{
          width: 60,
          height: 2,
          background: '#00ff87',
          opacity: 0.4,
          marginBottom: '3rem',
          borderRadius: 1,
        }}
      />

      {/* Description */}
      <p
        style={{
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          color: '#556677',
          textAlign: 'center',
          maxWidth: 420,
          lineHeight: 1.7,
        }}
      >
        We&apos;re rebuilding SlabStreet from the ground up.
        <br />
        Stay tuned.
      </p>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.65rem',
          color: '#333d4d',
          letterSpacing: '2px',
        }}
      >
        slabstreet.io
      </div>
    </div>
  );
}
