/**
 * KCD2 Dice Game — Game State Hook
 *
 * Manages the full game state machine and wires in AI automation.
 *
 * Dice object shape: { id: 0-5, value: 1-6, isHeld: bool, isLocked: bool, isScoring: bool }
 *   isLocked — held from a PREVIOUS roll in this turn (score already banked into turnScore)
 *   isHeld   — selected this roll (not yet locked) OR locked from before
 *   isScoring — eligible to be held this roll (part of at least one valid take)
 */

import { useState, useEffect, useCallback } from 'react';
import { getValidTakes, isBust, scoreSubset } from '../engine/scoring';
import { getBestTake, shouldBank } from '../engine/aiPlayer';

const TARGET_SCORE = 2000;
const AI_DELAY_MS = 800;
const BUST_DELAY_MS = 1500;
const HOT_DICE_DELAY_MS = 600;

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomFace() {
  return Math.floor(Math.random() * 6) + 1;
}

function freshDice() {
  return Array.from({ length: 6 }, (_, id) => ({
    id,
    value: 1,
    isHeld: false,
    isLocked: false,
    isScoring: false,
  }));
}

/**
 * Mark non-held dice as scoring based on the valid takes from this roll.
 * A die is scoring if its value appears in at least one valid take.
 * Handles duplicates via max-frequency tracking.
 */
function markScoringDice(dice, validTakes) {
  const maxFreq = new Array(7).fill(0);
  for (const take of validTakes) {
    const freq = new Array(7).fill(0);
    for (const v of take.dice) freq[v]++;
    for (let f = 1; f <= 6; f++) maxFreq[f] = Math.max(maxFreq[f], freq[f]);
  }

  const used = new Array(7).fill(0);
  return dice.map((d) => {
    if (d.isHeld) return { ...d, isScoring: false };
    if (used[d.value] < maxFreq[d.value]) {
      used[d.value]++;
      return { ...d, isScoring: true };
    }
    return { ...d, isScoring: false };
  });
}

/**
 * Roll non-held dice, evaluate scoring, return updated state slice.
 * Sets gamePhase to 'bust' or 'selecting'.
 */
function performRoll(prev) {
  const newDice = prev.dice.map((d) =>
    d.isHeld ? d : { ...d, value: randomFace() }
  );

  const rolledValues = newDice.filter((d) => !d.isHeld).map((d) => d.value);

  if (isBust(rolledValues)) {
    return {
      ...prev,
      dice: newDice.map((d) => ({ ...d, isScoring: false })),
      gamePhase: 'bust',
    };
  }

  const validTakes = getValidTakes(rolledValues);
  return {
    ...prev,
    dice: markScoringDice(newDice, validTakes),
    gamePhase: 'selecting',
  };
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  currentTurn: 'human',
  humanTotal: 0,
  aiTotal: 0,
  turnScore: 0,
  dice: freshDice(),
  gamePhase: 'idle',
  winner: null,
  lastBanked: { human: 0, ai: 0 },
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, setState] = useState(initialState);
  // Tracks whether the AI has already selected dice in the current 'selecting' phase.
  // Allows the AI effect to split selection and decision into two separate 800ms steps.
  const [aiSelecting, setAiSelecting] = useState(false);

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Initial roll at the start of a turn. Only valid from 'idle' phase. */
  const rollDice = useCallback(() => {
    setState((prev) => {
      if (prev.gamePhase !== 'idle') return prev;
      return performRoll(prev);
    });
  }, []);

  /**
   * Toggle a die's held state.
   * Only works in 'selecting' phase.
   * Only allows holding dice that are scoring AND not locked (i.e., from this roll).
   */
  const toggleHold = useCallback((diceId) => {
    setState((prev) => {
      if (prev.gamePhase !== 'selecting') return prev;
      const die = prev.dice.find((d) => d.id === diceId);
      if (!die || !die.isScoring || die.isLocked) return prev;
      return {
        ...prev,
        dice: prev.dice.map((d) =>
          d.id === diceId ? { ...d, isHeld: !d.isHeld } : d
        ),
      };
    });
  }, []);

  /**
   * Bank the current turn score and pass to the other player.
   * Scores the newly held dice (held but not yet locked), adds to turnScore, banks the total.
   * Checks win condition.
   */
  const bankAndPass = useCallback(() => {
    setState((prev) => {
      if (prev.gamePhase !== 'selecting') return prev;

      const newlyHeld = prev.dice.filter((d) => d.isHeld && !d.isLocked);
      const selectionScore = scoreSubset(newlyHeld.map((d) => d.value));
      const totalBanked = prev.turnScore + selectionScore;

      const player = prev.currentTurn;
      const prevTotal = player === 'human' ? prev.humanTotal : prev.aiTotal;
      const newTotal = prevTotal + totalBanked;
      const won = newTotal >= TARGET_SCORE;

      return {
        ...prev,
        humanTotal: player === 'human' ? newTotal : prev.humanTotal,
        aiTotal: player === 'ai' ? newTotal : prev.aiTotal,
        lastBanked: { ...prev.lastBanked, [player]: totalBanked },
        turnScore: 0,
        dice: freshDice(),
        currentTurn: player === 'human' ? 'ai' : 'human',
        gamePhase: won ? 'gameover' : 'idle',
        winner: won ? player : null,
      };
    });
    setAiSelecting(false);
  }, []);

  /**
   * Continue rolling with remaining (non-held) dice.
   *
   * - Scores newly held dice and accumulates into turnScore.
   * - If all 6 dice are held (Hot Dice): sets gamePhase to 'hotdice' and resets dice.
   *   A separate effect then auto-rolls all 6.
   * - Otherwise: locks newly held dice and rolls the rest.
   */
  const continueRolling = useCallback(() => {
    setState((prev) => {
      if (prev.gamePhase !== 'selecting') return prev;

      const newlyHeld = prev.dice.filter((d) => d.isHeld && !d.isLocked);
      const selectionScore = scoreSubset(newlyHeld.map((d) => d.value));
      const updatedTurnScore = prev.turnScore + selectionScore;

      const allHeld = prev.dice.every((d) => d.isHeld);

      if (allHeld) {
        // Hot Dice: preserve turn score, reset all dice for a fresh roll
        return {
          ...prev,
          turnScore: updatedTurnScore,
          dice: freshDice(),
          gamePhase: 'hotdice',
        };
      }

      // Lock the newly selected dice and roll the rest
      const lockedDice = prev.dice.map((d) =>
        d.isHeld && !d.isLocked ? { ...d, isLocked: true } : d
      );

      return performRoll({ ...prev, turnScore: updatedTurnScore, dice: lockedDice });
    });
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  /** Auto-roll after a Hot Dice reset (applies to both players). */
  useEffect(() => {
    if (state.gamePhase !== 'hotdice') return;
    const t = setTimeout(() => {
      setState((prev) => {
        if (prev.gamePhase !== 'hotdice') return prev;
        return performRoll(prev);
      });
    }, HOT_DICE_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.gamePhase]);

  /** Switch turns after a bust. Resets turn score and dice. */
  useEffect(() => {
    if (state.gamePhase !== 'bust') return;
    const t = setTimeout(() => {
      setState((prev) => {
        if (prev.gamePhase !== 'bust') return prev;
        return {
          ...prev,
          turnScore: 0,
          dice: freshDice(),
          currentTurn: prev.currentTurn === 'human' ? 'ai' : 'human',
          gamePhase: 'idle',
        };
      });
      setAiSelecting(false);
    }, BUST_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.gamePhase]);

  /**
   * AI automation.
   *
   * Step 1 — idle:     wait 800ms → rollDice()
   * Step 2 — selecting (!aiSelecting): wait 800ms → select best take → setAiSelecting(true)
   * Step 3 — selecting (aiSelecting):  wait 800ms → bank or continue → setAiSelecting(false)
   *
   * Hot Dice and Bust transitions are handled by the effects above (apply to both players).
   */
  useEffect(() => {
    if (state.currentTurn !== 'ai') return;
    if (state.gamePhase === 'gameover' || state.gamePhase === 'bust') return;
    // hotdice is handled by the hotdice effect above
    if (state.gamePhase === 'hotdice') return;

    if (state.gamePhase === 'idle') {
      const t = setTimeout(rollDice, AI_DELAY_MS);
      return () => clearTimeout(t);
    }

    if (state.gamePhase === 'selecting' && !aiSelecting) {
      // Step 2: AI picks the best available take and holds those dice
      const t = setTimeout(() => {
        setState((prev) => {
          const rolledValues = prev.dice.filter((d) => !d.isHeld).map((d) => d.value);
          const takes = getValidTakes(rolledValues);
          const best = getBestTake(takes);
          if (!best) return prev;

          // Match best take's values to actual dice objects (handles duplicates correctly)
          const remaining = [...best.dice];
          const newDice = prev.dice.map((d) => {
            if (d.isHeld || !d.isScoring) return d;
            const idx = remaining.indexOf(d.value);
            if (idx !== -1) {
              remaining.splice(idx, 1);
              return { ...d, isHeld: true };
            }
            return d;
          });

          return { ...prev, dice: newDice };
        });
        setAiSelecting(true);
      }, AI_DELAY_MS);
      return () => clearTimeout(t);
    }

    if (state.gamePhase === 'selecting' && aiSelecting) {
      // Step 3: AI decides whether to bank or continue rolling
      const t = setTimeout(() => {
        const newlyHeld = state.dice.filter((d) => d.isHeld && !d.isLocked);
        const selectionScore = scoreSubset(newlyHeld.map((d) => d.value));
        const projectedTurnScore = state.turnScore + selectionScore;
        const diceRemaining = state.dice.filter((d) => !d.isHeld).length;
        const allHeld = diceRemaining === 0;

        if (
          allHeld ||
          !shouldBank({
            diceRemaining,
            turnScore: projectedTurnScore,
            aiTotal: state.aiTotal,
            humanTotal: state.humanTotal,
          })
        ) {
          continueRolling();
        } else {
          bankAndPass();
        }
        setAiSelecting(false);
      }, AI_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [
    state.currentTurn,
    state.gamePhase,
    aiSelecting,
    state.dice,
    state.turnScore,
    state.aiTotal,
    state.humanTotal,
    rollDice,
    continueRolling,
    bankAndPass,
  ]);

  const resetGame = useCallback(() => {
    setState(initialState);
    setAiSelecting(false);
  }, []);

  return {
    state,
    actions: {
      rollDice,
      toggleHold,
      bankAndPass,
      continueRolling,
      resetGame,
    },
  };
}
