import { describe, it, expect } from 'vitest';
import { getBestTake, shouldBank } from '../src/engine/aiPlayer.js';

describe('getBestTake', () => {
  it('19. empty input → null', () => {
    expect(getBestTake([])).toBeNull();
  });

  it('20. single take → returns it', () => {
    const take = { dice: [1], score: 100 };
    expect(getBestTake([take])).toBe(take);
  });

  it('21. multiple takes → returns highest scoring take', () => {
    const takes = [
      { dice: [1], score: 100 },
      { dice: [1, 1, 1], score: 1000 },
      { dice: [5], score: 50 },
    ];
    expect(getBestTake(takes)).toEqual({ dice: [1, 1, 1], score: 1000 });
  });
});

describe('shouldBank (risk table)', () => {
  // Base params — AI and human roughly even
  const base = { aiTotal: 500, humanTotal: 500 };

  it('22. 6 dice remaining → always continue (false)', () => {
    expect(shouldBank({ ...base, diceRemaining: 6, turnScore: 9999 })).toBe(false);
  });

  it('23. 5 dice remaining → always continue (false)', () => {
    expect(shouldBank({ ...base, diceRemaining: 5, turnScore: 9999 })).toBe(false);
  });

  it('24. 4 dice, score below threshold (400) → continue', () => {
    expect(shouldBank({ ...base, diceRemaining: 4, turnScore: 400 })).toBe(false);
  });

  it('25. 4 dice, score at threshold (500) → bank', () => {
    expect(shouldBank({ ...base, diceRemaining: 4, turnScore: 500 })).toBe(true);
  });

  it('26. 3 dice, score at threshold (350) → bank', () => {
    expect(shouldBank({ ...base, diceRemaining: 3, turnScore: 350 })).toBe(true);
  });

  it('27. 2 dice, score at threshold (150) → bank', () => {
    expect(shouldBank({ ...base, diceRemaining: 2, turnScore: 150 })).toBe(true);
  });

  it('28. 1 die, score at threshold (100) → bank', () => {
    expect(shouldBank({ ...base, diceRemaining: 1, turnScore: 100 })).toBe(true);
  });

  it('29. aggression override: losing by >1000 → always continue regardless of threshold', () => {
    // Would normally bank (3 dice, 350+ pts), but losing by 1100 triggers override
    expect(shouldBank({ aiTotal: 0, humanTotal: 1100, diceRemaining: 3, turnScore: 350 })).toBe(false);
  });

  it('30. winning player: AI ahead, threshold met → banks normally', () => {
    // aiTotal > humanTotal, no override, should bank at 3-dice threshold
    expect(shouldBank({ aiTotal: 1200, humanTotal: 500, diceRemaining: 3, turnScore: 350 })).toBe(true);
  });
});
