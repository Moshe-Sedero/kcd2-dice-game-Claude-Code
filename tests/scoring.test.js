import { describe, it, expect } from 'vitest';
import { getValidTakes, isBust } from '../src/engine/scoring.js';

const hasTake = (takes, score) => takes.some((t) => t.score === score);

describe('isBust', () => {
  it('1. clean bust roll [2,3,4,6,2,3] → bust', () => {
    expect(isBust([2, 3, 4, 6, 2, 3])).toBe(true);
  });
});

describe('getValidTakes', () => {
  it('2. single 1: [1,2,3,4,6,6] → includes take worth 100', () => {
    expect(hasTake(getValidTakes([1, 2, 3, 4, 6, 6]), 100)).toBe(true);
  });

  it('3. single 5: [5,2,3,4,6,2] → includes take worth 50', () => {
    expect(hasTake(getValidTakes([5, 2, 3, 4, 6, 2]), 50)).toBe(true);
  });

  it('4. three 1s: [1,1,1,2,3,4] → includes take worth 1000', () => {
    expect(hasTake(getValidTakes([1, 1, 1, 2, 3, 4]), 1000)).toBe(true);
  });

  it('5. three 1s breakout: [1,1,1,2,3,4] → also allows single 1 (100 pts)', () => {
    expect(hasTake(getValidTakes([1, 1, 1, 2, 3, 4]), 100)).toBe(true);
  });

  it('6. three 6s: [6,6,6,2,3,4] → includes take worth 600', () => {
    expect(hasTake(getValidTakes([6, 6, 6, 2, 3, 4]), 600)).toBe(true);
  });

  it('7. four 2s: [2,2,2,2,3,4] → includes take worth 400', () => {
    expect(hasTake(getValidTakes([2, 2, 2, 2, 3, 4]), 400)).toBe(true);
  });

  it('8. five 3s: [3,3,3,3,3,2] → includes take worth 1200', () => {
    expect(hasTake(getValidTakes([3, 3, 3, 3, 3, 2]), 1200)).toBe(true);
  });

  it('9. six 4s: [4,4,4,4,4,4] → includes take worth 3200', () => {
    expect(hasTake(getValidTakes([4, 4, 4, 4, 4, 4]), 3200)).toBe(true);
  });

  it('10. small straight [1,2,3,4,5,6] → includes take worth 500', () => {
    expect(hasTake(getValidTakes([1, 2, 3, 4, 5, 6]), 500)).toBe(true);
  });

  it('11. high straight [2,3,4,5,6,3] → includes take worth 750', () => {
    expect(hasTake(getValidTakes([2, 3, 4, 5, 6, 3]), 750)).toBe(true);
  });

  it('12. full straight [1,2,3,4,5,6] → includes take worth 1500', () => {
    expect(hasTake(getValidTakes([1, 2, 3, 4, 5, 6]), 1500)).toBe(true);
  });

  it('13. mixed roll [1,1,5,2,3,4] → returns multiple valid takes', () => {
    const takes = getValidTakes([1, 1, 5, 2, 3, 4]);
    expect(takes.length).toBeGreaterThanOrEqual(3);
  });
});
