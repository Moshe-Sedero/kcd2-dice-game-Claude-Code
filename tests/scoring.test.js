import { describe, it, expect } from 'vitest';
import { getValidTakes, isBust } from '../src/engine/scoring.js';

const hasTake = (takes, score) => takes.some((t) => t.score === score);

// Returns true if every element of `smaller` appears in `larger` (multiset)
const isMultisetSubset = (smaller, larger) => {
  const rem = [...larger];
  for (const v of smaller) {
    const i = rem.indexOf(v);
    if (i === -1) return false;
    rem.splice(i, 1);
  }
  return true;
};

// A take is "tight" if no other take with the same score is a proper subset of it
const allTakesTight = (takes) =>
  takes.every(
    (t) =>
      !takes.some(
        (other) =>
          other !== t &&
          other.score === t.score &&
          other.dice.length < t.dice.length &&
          isMultisetSubset(other.dice, t.dice)
      )
  );

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

describe('no free-rider dice (dominated-take filter)', () => {
  it('14. singleton roll [1,3,4,6,6,2] → only take is [1]=100, no free riders', () => {
    const takes = getValidTakes([1, 3, 4, 6, 6, 2]);
    expect(takes).toHaveLength(1);
    expect(takes[0].dice).toEqual([1]);
    expect(takes[0].score).toBe(100);
  });

  it('15. two singletons [1,5,2,2,6,6] → exactly [1]=100, [5]=50, [1,5]=150', () => {
    // Roll has no triples and no straights — only 1 and 5 can score
    const takes = getValidTakes([1, 5, 2, 2, 6, 6]);
    expect(takes).toHaveLength(3);
    expect(hasTake(takes, 100)).toBe(true);
    expect(hasTake(takes, 50)).toBe(true);
    expect(hasTake(takes, 150)).toBe(true);
    expect(allTakesTight(takes)).toBe(true);
  });

  it('16. three-of-a-kind [6,6,6,2,3,4] → only take is [6,6,6]=600, no [6,6,6,2] etc.', () => {
    const takes = getValidTakes([6, 6, 6, 2, 3, 4]);
    expect(takes).toHaveLength(1);
    expect(takes[0].dice).toEqual([6, 6, 6]);
    expect(takes[0].score).toBe(600);
  });

  it('17. all takes are tight for mixed roll [1,1,5,2,3,4]', () => {
    const takes = getValidTakes([1, 1, 5, 2, 3, 4]);
    expect(allTakesTight(takes)).toBe(true);
    // 6 tight takes: [1]=100, [5]=50, [1,1]=200, [1,5]=150, [1,1,5]=250,
    // plus small straight [1,2,3,4,5]=500 (uses one of the two 1s)
    expect(takes).toHaveLength(6);
  });

  it('18. three-of-a-kind breakout [1,1,1,2,3,4] → tight takes only ([1],[1,1],[1,1,1])', () => {
    const takes = getValidTakes([1, 1, 1, 2, 3, 4]);
    expect(allTakesTight(takes)).toBe(true);
    expect(hasTake(takes, 100)).toBe(true);   // [1]
    expect(hasTake(takes, 200)).toBe(true);   // [1,1]
    expect(hasTake(takes, 1000)).toBe(true);  // [1,1,1]
    // No free-rider combos like [1,3]=100 or [1,1,4]=200
    const hasFreerider = takes.some((t) => t.dice.some((v) => v === 2 || v === 3 || v === 4));
    expect(hasFreerider).toBe(false);
  });
});
