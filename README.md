# KCD2 Dice Game

A web-based recreation of the **Dice** minigame from *Kingdom Come: Deliverance 2* — a push-your-luck Farkle variant where you roll six dice, hold scoring combinations, and decide whether to bank your points or risk it all for a bigger score.

Built with React + Vite, styled with a dark medieval tavern aesthetic, and fully playable against an AI opponent.

---

## Gameplay

### Objective
First player to reach **2000 points** wins.

### Turn Flow
1. **Roll** all six dice at the start of your turn
2. **Select** at least one scoring die or combination to hold
3. Choose to **Score & Pass** (bank your points and end your turn) or **Roll Again** (keep your held dice and roll the rest)
4. If your roll produces **no scoring dice** — you **BUST**, lose all unbanked points from that turn, and it passes to your opponent
5. If you hold **all 6 dice**, you trigger **Hot Dice** — all dice reset and you roll again with your turn score preserved

### Scoring Rules

| Combination | Points |
|---|---|
| Single 1 | 100 |
| Single 5 | 50 |
| Small Straight (1-2-3-4-5) | 500 |
| High Straight (2-3-4-5-6) | 750 |
| Full Straight (1-2-3-4-5-6) | 1,500 |
| Three 1s | 1,000 |
| Three 2s | 200 |
| Three 3s | 300 |
| Three 4s | 400 |
| Three 5s | 500 |
| Three 6s | 600 |
| Four-of-a-kind | Triple score × 2 |
| Five-of-a-kind | Triple score × 4 |
| Six-of-a-kind | Triple score × 8 |

> **Single-roll integrity**: Combinations must be formed within a single throw. Dice held from previous rolls in the same turn cannot combine with newly rolled dice to form sets or straights.

### AI Opponent
The AI plays automatically with 800ms delays so you can follow its decisions. It uses a risk table based on how many dice remain:

| Dice Remaining | AI Banks When... |
|---|---|
| 6 or 5 | Never (always continues) |
| 4 | Turn score ≥ 500 |
| 3 | Turn score ≥ 350 |
| 2 | Turn score ≥ 150 |
| 1 | Turn score ≥ 100 |

**Aggression override**: If the AI is losing by more than 1,000 points, it ignores the thresholds and keeps rolling regardless of dice count.

---

## Screenshots

> *Dark medieval tavern interface with Cinzel serif font, ivory SVG pip dice, and gold accent highlights.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS v3 + custom CSS animations |
| Font | Google Fonts — Cinzel |
| Tests | Vitest |
| Language | JavaScript (ES Modules) |

---

## Project Structure

```
kcd2-dice-game-Claude-Code/
├── src/
│   ├── engine/
│   │   ├── scoring.js       # Pure scoring logic — getValidTakes, isBust, scoreSubset
│   │   └── aiPlayer.js      # AI decision functions — getBestTake, shouldBank
│   ├── hooks/
│   │   └── useGameState.js  # Full game state machine + AI automation
│   ├── components/
│   │   ├── Die.jsx          # SVG pip dice with roll/bust/hot-dice animations
│   │   └── GameOverlay.jsx  # Victory / Defeat end screen
│   ├── App.jsx              # Main layout — score panels, dice tray, action buttons
│   └── index.css            # Tavern styles, keyframe animations
├── tests/
│   └── scoring.test.js      # 13 unit tests for the scoring engine
├── Dice-research.md         # Full game spec and research notes
└── CLAUDE.md                # AI coding instructions for this project
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Other Commands

```bash
npm test          # Run scoring engine unit tests (Vitest)
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
```

---

## Architecture Notes

### Scoring Engine (`src/engine/scoring.js`)
The engine enumerates all 63 non-empty subsets of a 6-die roll using bitmask iteration, scores each subset, and returns every valid take — not just the highest-scoring one. This is intentional: players are allowed to break combos strategically (e.g. take a single 1 instead of a triplet to leave more dice in play).

### Game State Machine (`src/hooks/useGameState.js`)
The hook manages a strict phase graph:

```
idle → selecting ↔ bust (→ idle, next player)
              ↓
           hotdice → selecting (fresh roll, same player)
              ↓
           gameover
```

Dice carry an `isLocked` flag to distinguish dice held from previous rolls (already scored into `turnScore`) from newly selected dice (pending scoring). This enforces the single-roll integrity rule at the engine level.

### AI Automation
The AI runs as a three-step `useEffect` chain gated by an `aiSelecting` flag:
1. **Idle** → roll after 800ms
2. **Selecting (step 1)** → pick best take, hold those dice, after 800ms
3. **Selecting (step 2)** → decide bank or continue, after 800ms

---

## Known Limitations / Out of Scope for MVP

- No minimum score required to open (some KCD2 variants require 350+ pts before your first bank)
- Target score fixed at 2000 — no wager or stake selection
- No badge system (Reroll, Undo, Offensive badges from the full game)
- No loaded/weighted dice variants
- No Devil's Head joker die
- Three Pairs and Two Triplets combos not implemented
- No game history or turn log

---

## Running Tests

```bash
npm test
```

```
✓ tests/scoring.test.js (13 tests)
  ✓ clean bust roll → isBust true
  ✓ single 1 → includes take worth 100
  ✓ single 5 → includes take worth 50
  ✓ three 1s → includes take worth 1000
  ✓ three 1s breakout → also allows single 1 (100 pts)
  ✓ three 6s → includes take worth 600
  ✓ four 2s → includes take worth 400
  ✓ five 3s → includes take worth 1200
  ✓ six 4s → includes take worth 3200
  ✓ small straight [1-5] → includes take worth 500
  ✓ high straight [2-6] → includes take worth 750
  ✓ full straight [1-6] → includes take worth 1500
  ✓ mixed roll → returns multiple valid takes
```

---

## License

MIT
