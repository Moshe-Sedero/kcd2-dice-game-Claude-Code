import { useGameState } from './hooks/useGameState';
import Die from './components/Die';
import GameOverlay from './components/GameOverlay';
import { useState, useEffect, useRef } from 'react';

// Progress bar toward target score (2000)
function ScoreBar({ value }) {
  const pct = Math.min(100, (value / 2000) * 100);
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #7a4f0a, #e8c96a)',
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  );
}

// Floaty "+score" popup that fades out
function ScoreFloat({ amount }) {
  return (
    <span
      className="score-float font-cinzel"
      style={{
        position: 'absolute',
        right: 0,
        top: -22,
        color: '#6ee7b7',
        fontSize: '0.85rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      +{amount}
    </span>
  );
}

// Score panel used for both AI (top) and human (bottom)
function PlayerPanel({ label, icon, total, lastBanked }) {
  const [showFloat, setShowFloat] = useState(false);
  const prevBanked = useRef(lastBanked);

  useEffect(() => {
    if (lastBanked !== prevBanked.current && lastBanked > 0) {
      setShowFloat(true);
      const t = setTimeout(() => setShowFloat(false), 1300);
      prevBanked.current = lastBanked;
      return () => clearTimeout(t);
    }
    prevBanked.current = lastBanked;
  }, [lastBanked]);

  return (
    <div style={{ padding: '0.7rem 1.25rem 0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          className="font-cinzel"
          style={{ color: '#7a5520', fontSize: '0.7rem', letterSpacing: '0.13em', textTransform: 'uppercase' }}
        >
          {icon} {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {showFloat && <ScoreFloat amount={lastBanked} />}
          {lastBanked > 0 && (
            <span style={{ color: '#6ee7b7', fontSize: '0.7rem', opacity: 0.65 }}>
              (+{lastBanked})
            </span>
          )}
          <span className="font-cinzel" style={{ fontSize: '1.55rem', color: '#e8c96a', fontWeight: 700 }}>
            {total}
          </span>
        </div>
      </div>
      <ScoreBar value={total} />
    </div>
  );
}

export default function App() {
  const { state, actions } = useGameState();
  const { currentTurn, humanTotal, aiTotal, turnScore, dice, gamePhase, winner, lastBanked } = state;
  const { rollDice, toggleHold, bankAndPass, continueRolling, resetGame } = actions;

  const isHumanTurn = currentTurn === 'human';
  const hasNewlyHeld = dice.some((d) => d.isHeld && !d.isLocked);
  const canAct = isHumanTurn && gamePhase === 'selecting' && hasNewlyHeld;

  const isBust = gamePhase === 'bust';
  const isHotDice = gamePhase === 'hotdice';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* ── Main Card ───────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'linear-gradient(175deg, #200e02 0%, #110800 100%)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 14,
          boxShadow: '0 8px 48px rgba(0,0,0,0.85), inset 0 1px 0 rgba(201,168,76,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* AI Score */}
        <PlayerPanel icon="⚔" label="Opponent" total={aiTotal} lastBanked={lastBanked.ai} />

        <hr className="tavern-divider" />

        {/* Turn Banner */}
        <div style={{ textAlign: 'center', padding: '0.55rem 1rem', minHeight: 34 }}>
          {isBust ? (
            <span className="bust-label font-cinzel" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              BUST!
            </span>
          ) : isHotDice ? (
            <span className="hot-dice-label font-cinzel" style={{ fontSize: '0.95rem', color: '#e8c96a', fontWeight: 700 }}>
              🔥 HOT DICE — Rolling Again! 🔥
            </span>
          ) : isHumanTurn ? (
            <span className="font-cinzel" style={{ fontSize: '0.85rem', color: '#c9a84c', letterSpacing: '0.12em' }}>
              — Your Turn —
            </span>
          ) : (
            <span className="font-cinzel" style={{ fontSize: '0.85rem', color: '#7a5a30', fontStyle: 'italic' }}>
              AI is thinking...
            </span>
          )}
        </div>

        {/* Dice Tray */}
        <div
          className="dice-tray-inner"
          style={{
            margin: '0 1rem',
            padding: '1.1rem 0.75rem',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 10,
            border: '1px solid rgba(201,168,76,0.08)',
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {dice.map((die) => (
            <Die
              key={die.id}
              die={die}
              isBust={isBust}
              isHotDice={isHotDice}
              onClick={isHumanTurn && gamePhase === 'selecting' ? () => toggleHold(die.id) : undefined}
            />
          ))}
        </div>

        {/* Turn Score */}
        <div style={{ textAlign: 'center', padding: '0.9rem 0 0.4rem' }}>
          <div
            className="font-cinzel"
            style={{
              fontSize: '0.6rem',
              color: '#5a3d14',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            Turn Score
          </div>
          <div
            className="font-cinzel"
            style={{
              fontSize: '2.1rem',
              fontWeight: 700,
              color: turnScore > 0 ? '#e8c96a' : '#2e1f06',
              transition: 'color 0.3s',
            }}
          >
            {turnScore}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-row" style={{ padding: '0.6rem 1.25rem 1.25rem' }}>
          <button
            className="tavern-btn"
            disabled={!canAct}
            onClick={bankAndPass}
            style={{ flex: 1, padding: '0.6rem 0.5rem' }}
          >
            Score &amp; Pass
          </button>

          {gamePhase === 'idle' && isHumanTurn ? (
            <button
              className="tavern-btn tavern-btn-primary"
              onClick={rollDice}
              style={{ flex: 1, padding: '0.6rem 0.5rem' }}
            >
              Roll Dice
            </button>
          ) : (
            <button
              className="tavern-btn tavern-btn-primary"
              disabled={!canAct}
              onClick={continueRolling}
              style={{ flex: 1, padding: '0.6rem 0.5rem' }}
            >
              Roll Again
            </button>
          )}
        </div>

        <hr className="tavern-divider" />

        {/* Human Score */}
        <PlayerPanel icon="⚜" label="You" total={humanTotal} lastBanked={lastBanked.human} />
      </div>

      {/* Win / Lose Overlay */}
      {gamePhase === 'gameover' && (
        <GameOverlay
          winner={winner}
          humanTotal={humanTotal}
          aiTotal={aiTotal}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
}
