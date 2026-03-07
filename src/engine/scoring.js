/**
 * KCD2 Dice Game — Scoring Engine
 * Pure logic, no UI dependencies.
 */

const THREE_OF_A_KIND_BASE = [0, 1000, 200, 300, 400, 500, 600]; // index = face value

/**
 * Score a candidate subset of dice.
 * Returns the point value of that exact selection, or 0 if it scores nothing.
 */
export function scoreSubset(dice) {
  const n = dice.length;
  const sorted = [...dice].sort((a, b) => a - b);

  // Full straight: exactly [1,2,3,4,5,6]
  if (n === 6 && sorted.join(',') === '1,2,3,4,5,6') return 1500;

  // Small straight: exactly [1,2,3,4,5]
  if (n === 5 && sorted.join(',') === '1,2,3,4,5') return 500;

  // High straight: exactly [2,3,4,5,6]
  if (n === 5 && sorted.join(',') === '2,3,4,5,6') return 750;

  // Count frequencies
  const freq = new Array(7).fill(0);
  for (const d of dice) freq[d]++;

  let total = 0;
  for (let face = 1; face <= 6; face++) {
    const count = freq[face];
    if (count >= 3) {
      const base = THREE_OF_A_KIND_BASE[face];
      total += base * Math.pow(2, count - 3);
    } else {
      if (face === 1) total += count * 100;
      if (face === 5) total += count * 50;
    }
  }
  return total;
}

/**
 * Returns true if every element of `smaller` can be matched in `larger` (multiset subset check).
 */
function isMultisetSubset(smaller, larger) {
  const remaining = [...larger];
  for (const v of smaller) {
    const idx = remaining.indexOf(v);
    if (idx === -1) return false;
    remaining.splice(idx, 1);
  }
  return true;
}

/**
 * Returns all valid scoring takes from a single dice roll.
 * Each take is { dice: number[], score: number }.
 * Includes ALL valid subsets (not just highest scoring), so players can choose
 * to break combos strategically.
 * Dominated takes are filtered out: if a proper sub-take achieves the same score,
 * the larger take is invalid (it contains free-rider dice that contribute nothing).
 *
 * @param {number[]} diceRoll - Array of integers (1-6)
 * @returns {{ dice: number[], score: number }[]}
 */
export function getValidTakes(diceRoll) {
  const n = diceRoll.length;
  const seen = new Set();
  const takes = [];

  for (let mask = 1; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(diceRoll[i]);
    }

    const score = scoreSubset(subset);
    if (score === 0) continue;

    const key = [...subset].sort((a, b) => a - b).join(',') + ':' + score;
    if (!seen.has(key)) {
      seen.add(key);
      takes.push({ dice: [...subset].sort((a, b) => a - b), score });
    }
  }

  // Remove dominated takes: any take T where a proper sub-take with the same score exists.
  // This eliminates free-rider dice — non-contributing dice alongside scoring ones.
  return takes.filter(
    (t) =>
      !takes.some(
        (other) =>
          other !== t &&
          other.score === t.score &&
          other.dice.length < t.dice.length &&
          isMultisetSubset(other.dice, t.dice)
      )
  );
}

/**
 * Returns true if the roll has no valid scoring combinations (a bust).
 *
 * @param {number[]} diceRoll
 * @returns {boolean}
 */
export function isBust(diceRoll) {
  return getValidTakes(diceRoll).length === 0;
}
