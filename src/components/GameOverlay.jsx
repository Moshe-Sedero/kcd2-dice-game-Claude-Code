export default function GameOverlay({ winner, humanTotal, aiTotal, onPlayAgain }) {
  const won = winner === 'human';

  return (
    <div
      className="overlay-backdrop fixed inset-0 flex flex-col items-center justify-center z-50"
    >
      {/* Decorative border frame */}
      <div
        style={{
          border: `2px solid ${won ? '#c9a84c' : '#555'}`,
          borderRadius: 16,
          padding: '3rem 4rem',
          background: 'rgba(15,7,0,0.95)',
          boxShadow: won
            ? '0 0 60px rgba(201,168,76,0.35), inset 0 0 40px rgba(201,168,76,0.05)'
            : '0 0 40px rgba(0,0,0,0.8)',
          textAlign: 'center',
          maxWidth: 420,
          width: '90vw',
        }}
      >
        {/* Title */}
        <div
          className="font-cinzel"
          style={{
            fontSize: '2.8rem',
            fontWeight: 700,
            color: won ? '#e8c96a' : '#777',
            textShadow: won ? '0 0 20px rgba(201,168,76,0.7)' : 'none',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
          }}
        >
          {won ? 'Victory!' : 'Defeat...'}
        </div>

        <div
          style={{
            color: won ? '#c9a84c' : '#555',
            fontSize: '1.4rem',
            marginBottom: '1.5rem',
            letterSpacing: '0.15em',
          }}
        >
          {won ? '⚔ ⚔ ⚔' : '· · ·'}
        </div>

        {/* Score summary */}
        <div className="font-cinzel" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#999', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>You</span>
            <span style={{ color: '#999', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem' }}>
            <span style={{ color: winner === 'human' ? '#e8c96a' : '#aaa', fontSize: '2rem', fontWeight: 700 }}>
              {humanTotal}
            </span>
            <span style={{ color: winner === 'ai' ? '#e8c96a' : '#aaa', fontSize: '2rem', fontWeight: 700 }}>
              {aiTotal}
            </span>
          </div>
        </div>

        {/* Play Again */}
        <button
          onClick={onPlayAgain}
          className="tavern-btn tavern-btn-primary font-cinzel"
          style={{ padding: '0.75rem 2.5rem', fontSize: '0.85rem' }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
