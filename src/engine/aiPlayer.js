/**
 * KCD2 Dice Game — AI Opponent Logic
 * Pure functions, no side effects.
 */

/**
 * Returns the highest-scoring take from a list of valid takes.
 *
 * @param {{ dice: number[], score: number }[]} validTakes
 * @returns {{ dice: number[], score: number } | null}
 */
export function getBestTake(validTakes) {
  if (!validTakes || validTakes.length === 0) return null;
  return validTakes.reduce((best, take) =>
    take.score > best.score ? take : best
  );
}

/**
 * Decides whether the AI should bank its current turn score.
 *
 * Risk thresholds (from KCD2 spec, Conservative archetype):
 *   6-5 remaining → always continue
 *   4 remaining   → bank if turnScore >= 500
 *   3 remaining   → bank if turnScore >= 350
 *   2 remaining   → bank if turnScore >= 150
 *   1 remaining   → bank if turnScore >= 100
 *
 * Aggression override: if AI is losing by more than 1000, always continue.
 *
 * @param {{ diceRemaining: number, turnScore: number, aiTotal: number, humanTotal: number }} params
 * @returns {boolean} true = bank, false = continue rolling
 */
export function shouldBank({ diceRemaining, turnScore, aiTotal, humanTotal }) {
  // Losing by more than 1000 → ignore thresholds, keep gambling
  if (aiTotal - humanTotal < -1000) return false;

  if (diceRemaining >= 5) return false; // always continue
  if (diceRemaining === 4) return turnScore >= 500;
  if (diceRemaining === 3) return turnScore >= 350;
  if (diceRemaining === 2) return turnScore >= 150;
  if (diceRemaining === 1) return turnScore >= 100;
  return false; // 0 remaining = hot dice, handled externally
}
