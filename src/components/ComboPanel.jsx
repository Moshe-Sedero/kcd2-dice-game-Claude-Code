import { getValidTakes } from '../engine/scoring';

/**
 * Returns a human-readable name for a dice combination.
 */
function nameTake(dice) {
  const sorted = [...dice].sort((a, b) => a - b);
  const n = dice.length;

  if (n === 6 && sorted.join(',') === '1,2,3,4,5,6') return 'Full Straight';
  if (n === 5 && sorted.join(',') === '1,2,3,4,5') return 'Small Straight';
  if (n === 5 && sorted.join(',') === '2,3,4,5,6') return 'High Straight';

  if (n >= 3 && sorted.every((v) => v === sorted[0])) {
    const countWord = { 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six' }[n];
    return `${countWord} ${sorted[0]}s`;
  }

  const ones = dice.filter((d) => d === 1).length;
  const fives = dice.filter((d) => d === 5).length;
  if (ones + fives === n) {
    const parts = [];
    if (ones === 1) parts.push('Lucky One');
    else if (ones > 1) parts.push(`Lucky Ones ×${ones}`);
    if (fives === 1) parts.push('Lucky Five');
    else if (fives > 1) parts.push(`Lucky Fives ×${fives}`);
    return parts.join(' + ');
  }

  return 'Combo';
}

/**
 * Displays all valid scoring takes from the current roll as clickable cards.
 * Clicking a card selects exactly those dice (via selectCombo) and highlights the card.
 */
export default function ComboPanel({ dice, onSelectCombo, activeComboKey }) {
  // Only consider dice rolled this round (not locked from previous rolls)
  const rolledValues = dice.filter((d) => !d.isLocked).map((d) => d.value);
  const takes = getValidTakes(rolledValues);

  if (takes.length === 0) return null;

  // Sort by score descending
  const sorted = [...takes].sort((a, b) => b.score - a.score);

  return (
    <div
      style={{
        margin: '0.5rem 1rem 0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
      }}
    >
      {sorted.map((take) => {
        const key = take.dice.join(',') + ':' + take.score;
        const isActive = key === activeComboKey;

        return (
          <button
            key={key}
            onClick={() => onSelectCombo(take.dice, key)}
            className="font-cinzel"
            style={{
              background: isActive
                ? 'linear-gradient(160deg, #5c3c0a 0%, #3d2506 100%)'
                : 'linear-gradient(160deg, #1e0f03 0%, #130a02 100%)',
              border: isActive
                ? '1px solid rgba(201,168,76,0.85)'
                : '1px solid rgba(201,168,76,0.25)',
              borderRadius: 6,
              color: isActive ? '#e8c96a' : '#8a6a30',
              cursor: 'pointer',
              padding: '0.3rem 0.6rem',
              fontSize: '0.68rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              boxShadow: isActive ? '0 0 10px rgba(201,168,76,0.3)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              minWidth: 68,
            }}
          >
            <span style={{ fontWeight: 700 }}>{nameTake(take.dice)}</span>
            <span style={{ opacity: 0.7, fontSize: '0.62rem' }}>
              {take.dice.join(' · ')}
            </span>
            <span style={{ color: isActive ? '#6ee7b7' : '#4a7a5a', fontSize: '0.72rem', fontWeight: 600 }}>
              +{take.score}
            </span>
          </button>
        );
      })}
    </div>
  );
}
