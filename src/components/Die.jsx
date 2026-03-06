import { useState, useEffect, useRef } from 'react';

// Pip (x,y) positions in a 0–100 coordinate space
const PIPS = {
  1: [[50, 50]],
  2: [[70, 30], [30, 70]],
  3: [[70, 30], [50, 50], [30, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 22], [70, 22], [30, 50], [70, 50], [30, 78], [70, 78]],
};

export default function Die({ die, isBust, isHotDice, onClick }) {
  const { value, isHeld, isLocked, isScoring } = die;

  // Self-managed roll animation: fires when value changes while not held
  const [rolling, setRolling] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (isHeld) {
      prevValue.current = value;
      return;
    }
    if (value !== prevValue.current) {
      setRolling(true);
      const t = setTimeout(() => setRolling(false), 460);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
  }, [value, isHeld]);

  // ── Visual state resolution ──────────────────────────────────
  const isClickable = !!onClick && isScoring && !isLocked && !isBust && !isHotDice;

  // Background
  let bgColor = '#f5f0e0'; // default ivory
  if (isHeld || isLocked) bgColor = '#c9a84c'; // gold when held/locked
  if (isBust) bgColor = '#888'; // grey on bust

  // Pip color
  const pipColor = isHeld || isLocked ? '#2a1000' : '#3d1c00';

  // Border / glow style
  let extraClass = '';
  if (rolling) extraClass = 'die-rolling';
  else if (isBust) extraClass = 'die-busting';
  else if (isHotDice) extraClass = 'die-hot';

  let borderStyle = '2px solid rgba(0,0,0,0.15)';
  if (isScoring && !isHeld && !isBust && !isHotDice) {
    borderStyle = '2px solid #c9a84c';
  }
  if (isHeld || isLocked) {
    borderStyle = '2px solid #e8c96a';
  }

  return (
    <div
      className={`relative select-none ${extraClass}`}
      style={{
        width: 72,
        height: 72,
        borderRadius: 12,
        background: bgColor,
        border: borderStyle,
        boxShadow: isScoring && !isHeld && !isBust && !isHotDice
          ? '0 0 10px rgba(201,168,76,0.4)'
          : '0 2px 6px rgba(0,0,0,0.5)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'background 0.2s, box-shadow 0.2s',
        flexShrink: 0,
      }}
      onClick={isClickable ? onClick : undefined}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {(PIPS[value] || []).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={10} fill={pipColor} />
        ))}
      </svg>

      {/* Held indicator tick */}
      {(isHeld || isLocked) && (
        <div
          style={{
            position: 'absolute',
            bottom: 3,
            right: 5,
            fontSize: 11,
            color: '#2a1000',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}
