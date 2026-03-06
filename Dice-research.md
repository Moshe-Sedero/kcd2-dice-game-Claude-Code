# Research prompt:

I want to recreate the mini game of "DICE" which can be found within the video game "kingdom come deliverance 2". I need a complete breakdown and descriptions of this mini game, all the rules, all the mechanics, everything that is needed to recreate the game to be as close to the original mini game. 

# Research results:

## Perplexity:

You can recreate KCD2’s “Dice” as a push-your-luck Farkle variant: roll up to six dice, set aside scoring dice to build \*turn points\*, and decide whether to bank them or risk losing them by rolling again.\[1\]\[2\]

\#\# Match setup  
A match is played between two players, and the first to reach the match’s target score wins.\[3\]\[1\]  
Before starting you typically choose whether the match allows badges, then you agree to a wager (the Groschen amount at stake).\[3\]  
Target score requirements can scale with the wager (higher-stakes matches often require a higher target score), while some matches are commonly around 2000 points.\[1\]\[3\]

\#\# Turn flow (core loop)  
1\) Start your turn by rolling six dice.\[1\]\[3\]  
2\) From the result, you may select scoring dice/combinations and set them aside; their value becomes your unbanked points for this turn.\[3\]\[1\]  
3\) Choose \*\*Score and Pass\*\* to bank your accumulated turn points (they’re added to your match total), or \*\*Score and Continue\*\* to roll the remaining dice and try to add more.\[3\]  
4\) If you roll and there are no scoring dice/combinations available, you “bust” (your turn ends and you lose the unbanked points from that turn).\[1\]\[3\]  
5\) If you use up all six dice as scoring dice and choose to continue, you refresh and roll all six again (effectively extending your turn).\[3\]

Constraint to implement: scoring combinations are taken from a single roll; you can’t “reserve” non-scoring dice (e.g., keep a pair of 4s now hoping to complete a triple later).\[3\]

\#\# Scoring rules (base game)  
These are the standard scoring formations KCD2 uses:\[3\]

\- Single 1 \= 100 points.\[3\]  
\- Single 5 \= 50 points.\[3\]  
\- Straight 1–5 \= 500 points.\[3\]  
\- Straight 2–6 \= 750 points.\[3\]  
\- Straight 1–6 \= 1,500 points.\[3\]  
\- Three-of-a-kind: 1s \= 1,000; 2s \= 200; 3s \= 300; 4s \= 400; 5s \= 500; 6s \= 600.\[3\]  
\- Four+ of a kind: each extra die beyond the triple doubles the set’s score (e.g., triple 2s=200, four 2s=400, five 2s=800, six 2s=1600).\[3\]

Implementation note (important for accuracy): because the player chooses what to set aside, your scoring evaluator should generate \*all legal takes\* from a roll (not just the max-score take), including alternatives like “take only the 1” vs “take 1 and 5,” etc.\[3\]

\#\# Special dice (unique/loaded \+ Devil’s Head)  
KCD2 includes special/unique dice you select before a match, and their behavior is described on the item (some can have extreme effects like always landing on a specific value).\[1\]  
One special die type is the Devil’s Head die: it replaces the 1-face with a devil head, and that face acts as a joker/wild that can stand in for a needed value in a scoring combination, but it doesn’t score by itself.\[4\]\[5\]

To mimic the original feel in code, model each die as its own probability distribution (or deterministic mapping) rather than assuming all dice are fair d6.\[1\]

\#\# Badges (game modifiers)  
Matches may be played “with badges,” and during such matches you can activate badges mid-game for effects like doubling points or rerolling dice.\[3\]  
Badges come in tiers (e.g., Tin/Silver/Gold) and many effects are “limited uses per game” (e.g., Tin Doppelganger doubles your last throw once per game; higher tiers increase uses).\[6\]  
Some badges add entirely new scoring formations (e.g., Carpenter’s “Cut” from 3+5, Executioner’s “Gallows” from 4+5+6, Priest’s “Eye” from 1+3+5).\[6\]

I can’t safely give the \*exact point values\* for those badge-added formations from the sources I could access (they’re described as “new formations,” but the actual scoring numbers aren’t consistently published), so for a 1:1 recreation you’ll want to copy the values straight from the in-game tooltips/strings for each badge.\[6\]

\#\# Minimal spec checklist (what to implement)  
\- Match config: wager amount, target score, badges enabled/disabled.\[3\]  
\- Player loadout: 6 dice slots (each slot \= a specific die item/effect), badge inventory \+ per-badge remaining uses.\[6\]\[1\]  
\- Turn state: remaining dice count, current roll results, turn\_points (unbanked), banked match total.\[1\]\[3\]  
\- Rules engine: generate legal “takes” from a roll using the scoring table above; apply “single-roll only” constraint; apply bust rule; apply hot-dice refresh when all dice are used and player continues.\[3\]  
\- Special cases: Devil’s Head wildcard substitution in combination validation.\[5\]\[4\]

## GEMINI:

Recreating the dice mini-game from Kingdom Come: Deliverance 2 (KCD2) is a fantastic project\! The game is actually a medieval adaptation of the classic real-world dice game Farkle, but KCD2 spices it up with RPG mechanics like rigged dice and special badges.  
Here is the complete, comprehensive breakdown of the rules, scoring, mechanics, and edge cases you will need to program or physically recreate the game exactly as it plays in KCD2.  
1\. Objective and Setup  
 \* Players: 1v1 turn-based game.  
 \* Equipment: 6 six-sided dice per player (can be standard or "loaded").  
 \* Winning Condition: The goal is to be the first player to reach a predetermined target score (usually 2,000 points in KCD2, though lower/higher wagers might set the target to 1,500 or 4,000).  
2\. Core Turn Mechanics  
During a player's turn, they roll their dice to accumulate a "Turn Score." They can keep pushing their luck to increase this score, but if they roll and score nothing, they lose all points accumulated during that turn.  
Step-by-Step Flow:  
 \* The Initial Roll: The player rolls all 6 dice.  
 \* Evaluating the Roll: The game checks for scoring dice (1s, 5s, or specific combinations).  
   \* Bust: If zero scoring dice appear, the player "Busts." They lose all unbanked points for that current turn, and their turn immediately ends.  
   \* Score: If there are scoring dice, the player must select at least one scoring die (or valid combination) to set aside ("Hold").  
 \* The Choice (Score & Pass vs. Score & Continue): After setting aside scoring dice, the player's Turn Score increases. They now face a choice:  
   \* Score & Pass: The player banks their Turn Score, adding it to their permanent Total Score. Their turn ends, and the opponent plays.  
   \* Score & Continue: The player leaves the scoring dice set aside and rolls the remaining dice. For example, if they kept two 1s, they roll the remaining 4 dice.  
 \* The "Hot Dice" Rule (Full Clear): If a player successfully scores and sets aside all 6 dice (either in a single roll or cumulatively across multiple rolls in the same turn without busting), they unlock a free continuation. If they choose to "Score & Continue," they pick up all 6 dice and roll them again, continuing to build on their massive Turn Score.  
3\. The Scoring System  
Points are only awarded for 1s, 5s, and specific sets rolled in a single throw. (You cannot hold a "2" from one roll and combine it with two "2s" from the next roll to make a triple).  
| Dice Combination | Points Awarded |  
|---|---|  
| Single 1 | 100 |  
| Single 5 | 50 |  
| Three 1s | 1,000 |  
| Three 2s | 200 |  
| Three 3s | 300 |  
| Three 4s | 400 |  
| Three 5s | 500 |  
| Three 6s | 600 |  
| Small Straight (1, 2, 3, 4, 5\) | 500 |  
| High Straight (2, 3, 4, 5, 6\) | 750 |  
| Full Straight (1, 2, 3, 4, 5, 6\) | 1,500 |  
The Multiplier Rule (4, 5, or 6 of a kind):  
If you roll more than three of a kind in a single throw, the score doubles for every additional die.  
 \* Example with 2s: Three 2s \= 200\. Four 2s \= 400\. Five 2s \= 800\. Six 2s \= 1,600.  
 \* Example with 1s: Three 1s \= 1,000. Four 1s \= 2,000. Five 1s \= 4,000. Six 1s \= 8,000.  
4\. KCD2 Unique RPG Mechanics  
If you want the true KCD2 experience, you need to implement the meta-game mechanics: Unique Dice and Badges. Players select these in a pre-match lobby.  
A. Unique / Loaded Dice  
Players don't have to use 6 fair dice. They can swap out any number of their dice for loaded ones they've found in the world. To program this, you alter the probability array for specific dice.  
 \* Standard Die: 16.7% chance for sides 1-6.  
 \* Even Die: Heavily weighted to roll 2, 4, or 6 (approx 26.7% each), and rarely 1, 3, or 5 (approx 6.7% each).  
 \* Odd Die: Heavily weighted to roll 1, 3, or 5\.  
 \* Holy Trinity Die: Heavily weighted to roll a 3\.  
 \* The Devil's Head Die (Wildcard): One side has a Devil's Head instead of a number. This acts as a Joker/Wildcard and can automatically substitute for whatever number is needed to make the highest possible scoring combination in that roll.  
B. Badges (New to KCD2)  
Matches can be played "With Badges" or "Without Badges." Badges give the player an active ability they can trigger via a UI button during their turn. They come in Tiers (Tin, Silver, Gold).  
 \* Gold Wedding Badge: Once per match, allows the player to completely reroll up to 3 dice of their choosing to save a bad throw.  
 \* Gold Emperor's Badge: Passive effect; you gain triple the points from three-of-a-kind "1" combinations (making three 1s worth an instant 3,000 points).  
5\. Crucial Logic/Programming Edge Cases to Watch Out For  
If you are coding this, these are the logic traps that catch people off guard:  
 \* Scoring is NOT automatic for combos: If a player rolls 1, 1, 1, 2, 3, 4, the AI/Game should recognize the combo (Three 1s \= 1,000 points). However, the player is allowed to only select one "1" for 100 points if they want to keep 5 dice for the next roll. You must allow players to break combos if they prefer.  
 \* Busting is mandatory: If a player rolls 2, 2, 3, 4, 6, 6, they have 0 points. The game must automatically detect the bust, wipe the turn's unbanked points, and switch turns.  
 \* Single non-scoring numbers do nothing: Rolling a single 2, 3, 4, or 6 is entirely useless. If a player holds a "5" and rolls the remaining 5 dice and gets 2, 2, 3, 4, 6, they bust. The two 2s do nothing unless there's a third.

Continue gemini:

That’s a great approach. If you’re building a recreation, nailing down the game design document first is essential before writing a single line of code.  
The dice game in Kingdom Come: Deliverance 2 (KCD2) is fundamentally based on the real-world historical game Farkle, but it adds heavy RPG elements via loaded dice and a brand-new "Badge" system.  
Here is the complete game design and mechanics breakdown for the KCD2 version of the game.  
1\. The Core Loop & Turn Structure  
 \* The Goal: Be the first player to reach the target score (usually 2,000, 4,000, or up to 8,000 depending on the tavern's wager limits).  
 \* The Setup: Each player brings 6 six-sided dice to the table. They can be standard dice or custom "loaded" dice. They also select one "Badge" to equip (optional).  
 \* The Turn Flow:  
   \* Roll: The player rolls all available dice (starting with 6).  
   \* Evaluate: The game checks for scoring dice (1s, 5s, or specific combos).  
   \* The Bust: If no dice score, the player "Busts." They lose all points accumulated during that specific turn, and their turn immediately ends.  
   \* Hold & Score: If scoring dice are present, the player must hold at least one scoring die (or valid combination) to set aside. They can hold multiple if they wish.  
   \* The Choice: The player now chooses to either:  
     \* Bank (Score & Pass): Add the accumulated turn points to their permanent total. Their turn ends.  
     \* Risk (Score & Continue): Leave the scored dice on the table and roll the remaining dice to build the combo.  
   \* "Hot Dice" (The Full Clear): If a player successfully scores with all 6 dice in a single turn, they unlock a free continuation. They pick up all 6 dice and roll again, adding to their massive running total for that turn.  
2\. The Base Scoring System  
Points are only awarded for 1s, 5s, and specific sets rolled in a single throw. You cannot combine a "2" from your first roll with two "2s" from your second roll to make a triple.  
Single Dice:  
 \* Single 1: 100 points  
 \* Single 5: 50 points  
   (Note: Single 2s, 3s, 4s, and 6s are worth nothing on their own).  
Three of a Kind:  
 \* Three 1s: 1,000 points  
 \* Three 2s: 200 points  
 \* Three 3s: 300 points  
 \* Three 4s: 400 points  
 \* Three 5s: 500 points  
 \* Three 6s: 600 points  
The Multiplier Rule (4, 5, or 6 of a kind):  
For every additional matching die beyond three in a single throw, the score doubles.  
 \* Example: Three 2s \= 200\. Four 2s \= 400\. Five 2s \= 800\. Six 2s \= 1,600.  
 \* Example: Three 1s \= 1,000. Four 1s \= 2,000. Five 1s \= 4,000. Six 1s \= 8,000.  
Straights:  
 \* Small Straight (1, 2, 3, 4, 5): 500 points  
 \* High Straight (2, 3, 4, 5, 6): 750 points  
 \* Full Straight (1, 2, 3, 4, 5, 6): 1,500 points  
3\. KCD2 Mechanic: Loaded Dice  
Instead of 6 standard fair dice, players can build their own set of 6 using loaded dice found, bought, or stolen in the world.  
 \* Standard Die: 16.6% chance for every side.  
 \* Weighted Dice: Dice like the Odd Die, Even Die, Lu Die, or the infamous Saint Antiochus' Die simply alter the probability tables. For example, an Odd Die might have a 25% chance to roll 1s, 3s, and 5s, and only an 8% chance to roll 2s, 4s, and 6s.  
 \* The Devil’s Head (Wildcard): Some dice feature a Joker face. This face automatically substitutes for whatever number yields the highest possible scoring combination in that specific roll.  
4\. KCD2 Mechanic: Badges (The Big New Feature)  
This is what separates KCD2 from the first game. Before a match, players wager a Badge. If you lose the game, you lose your wagered money AND the badge. Badges come in three rarities (Tin, Silver, Gold) and grant powerful abilities.  
Here are the categories of badges you will need to recreate:  
 \* Extra Dice / Rerolls: \* Bird King’s / Might Badges: Allows you to roll 7 dice instead of 6 a certain number of times per game.  
   \* Fortune Badges: Allows you to select and reroll 2 or 3 dice after a bad throw.  
   \* Resurrection Badges: Automatically allows you to completely undo a "Bust" and throw again.  
 \* Score Multipliers:  
   \* Doppelganger Badges: Instantly doubles the score of your last throw.  
   \* Gold Emperor's Badge: Passive effect. Triple points for every (1, 1, 1\) combination you roll.  
 \* New Combinations:  
   \* Carpenter's Advantage: Allows you to score a "3 and a 5" together as a unique combo called "The Cut".  
   \* Executioner's Advantage: Allows you to score a "4, 5, and 6" together as a combo called "The Gallows".  
 \* Sabotage / Defense:  
   \* Defence Badges: Cancels out the opponent's badge if it matches the same tier (e.g., Gold Defence cancels a Gold Doppelganger).  
5\. Nuances to Keep in Mind  
 \* Breaking Combos: A player is never forced to take a full combo. If they roll 1, 1, 1, 4, 6, 6, they can take the 1,000 points for the three 1s. However, they are legally allowed to just take one "1" for 100 points, so they can roll 5 dice on their next throw instead of 3\. (This is a common high-level strategy to hunt for straights).  
 \* UI Integration for Badges: Badges in KCD2 aren't just passive; many are active. This means your UI will need a "Use Badge" button that appears during the player's turn, tracking how many charges they have left per game.  
Would you like to dive deeper into how to mathematically structure the probability tables for the loaded dice, or would you prefer to flesh out the logic for how the AI opponent should make its risk/reward decisions?

Gemini continue:   
Designing the AI for a game like this is where it goes from a math simulation to a fun, believable medieval tavern experience. If the AI plays strictly by perfect mathematical expected value, it becomes robotic and predictable. You want it to feel like a human who gets greedy, feels the pressure when losing, and occasionally makes a dramatic, risky play.  
Here is a breakdown of the logic framework and decision matrix to build a compelling AI opponent for the KCD2 dice game.  
1\. The Core Variables (What the AI Evaluates)  
Before making a choice to Score & Pass or Score & Continue, the AI needs to check the current game state. These are the variables it should weigh:  
 \* Dice\_Remaining: How many dice will I be rolling? (This dictates the strict probability of busting).  
 \* Unbanked\_Score: How many points are currently at risk this turn?  
 \* Target\_Proximity: How close am I (and the player) to the winning score?  
 \* Score\_Delta: Am I winning or losing, and by how much?  
 \* Loaded\_Advantage: Do I have loaded dice in my remaining pool that skew the odds in my favor?  
2\. The AI Risk Archetypes (Personalities)  
To make the game interesting, the AI shouldn't have just one brain. You should assign opponents different "Archetypes" to reflect their in-game character (e.g., a beggar vs. a wealthy noble sharper).  
 \* The Conservative (Low Risk): Banks as soon as they have 300+ points. Almost never rolls with 1 or 2 dice remaining. Prioritizes slow, steady wins.  
 \* The Gambler (High Risk): Obsessed with getting "Hot Dice" (clearing all 6 to get a free turn). Will routinely risk high unbanked scores on 2 dice just to clear the board.  
 \* The Adaptive (Dynamic): Plays conservatively when they have a lead, but becomes a Gambler when they fall significantly behind the player.  
3\. The Decision Matrix: To Roll or To Pass?  
This is the heart of the AI. After setting aside scoring dice, the AI checks how many dice are left and references its logic table.  
(Note: Standard fair dice probabilities are roughly: 6 dice \= 2.3% bust chance, 5 \= 7.7%, 4 \= 15.7%, 3 \= 27.8%, 2 \= 44.4%, 1 \= 66.7%)  
6 Dice Remaining (Hot Dice Unlocked)  
 \* Action: Always Roll. \* Exception: If the Unbanked\_Score pushes their total score past the winning threshold, they immediately pass to win the game.  
4 or 5 Dice Remaining  
 \* Action: Almost Always Roll. The odds of busting are very low.  
 \* Exception: If Unbanked\_Score is massive (e.g., 1,500+ from a lucky first roll) and the AI is playing Conservatively.  
3 Dice Remaining (The Tipping Point)  
 \* Action: Calculate Risk vs. Reward.  
 \* Logic:  
   \* If Unbanked\_Score \< 300: Roll. It’s worth risking a low score to build a better one.  
   \* If Unbanked\_Score \>= 300: Pass. Bank the points unless the AI is a Gambler archetype or desperately losing.  
1 or 2 Dice Remaining (The Danger Zone)  
 \* Action: Highly likely to Pass.  
 \* Logic:  
   \* With 1 die, there is a 66% chance to bust (assuming standard dice). With 2 dice, it's 44%.  
   \* The "Worthless Risk" Rule: If Unbanked\_Score is very low (e.g., 50 or 100 points), the AI will roll. Losing 50 points doesn't matter, but hitting a 1 or 5 to unlock a 6-dice refresh ("Hot Dice") is a massive reward.  
   \* The Bank Rule: If Unbanked\_Score \> 150, almost all AI archetypes should Pass and bank the points.  
4\. Dice Holding Logic (The Micro-Decisions)  
The AI doesn't just decide whether to roll; it has to decide which dice to keep from a valid throw.  
Rule 1: Always take high-value combos.  
If the AI rolls three 4s, it always takes them.  
Rule 2: The "Drop the 5" Strategy (Advanced AI)  
If the AI rolls 1, 5, 2, 3, 4, 6\.  
 \* Basic AI will hold both the 1 and the 5 (150 points) and roll 4 dice.  
 \* Smart AI will hold the 1 (100 points) and leave the 5 on the table. Why? Because rolling 5 dice instead of 4 significantly increases the chance of rolling triples or a straight on the next throw. The AI sacrifices 50 guaranteed points for better statistical potential.  
Rule 3: Protecting the Board Clear  
If the AI rolls 1, 1, 5, 5, 2, 3 (4 scoring dice). A Smart AI might only take the two 1s, leaving the 5s. If you leave 4 dice, you are more likely to bust than if you leave 2 dice. By taking fewer scoring dice now, it protects itself from busting on the next roll.  
5\. Badge & Loaded Dice Awareness (KCD2 Specific)  
The AI needs to know if it is "cheating."  
 \* Loaded Dice Override: If the AI has 2 dice left, but knows those specific physical dice are "Odd Dice" (heavily weighted to roll 1, 3, 5), it will completely ignore the standard "Danger Zone" logic. It will confidently roll 2 dice because its internal bust probability is much lower than 44%.  
 \* Badge Timing: \* Reroll/Undo Badges: The AI should never use this if they bust with an Unbanked\_Score of 100\. It should explicitly save this badge for a turn where they bust with a massive score (e.g., 800+ points on the line).  
   \* Offensive Badges: If an AI has a badge that steals points or forces the player to reroll, it should trigger it when the player reaches \~80% of the target score to stall their victory.

## GROK:

Here is a clean, flat, plain-text version of the Dice minigame rules from Kingdom Come: Deliverance 2\. No headings, no bold, no tables, just simple readable paragraphs and lists that an LLM can easily parse.

The dice minigame in Kingdom Come: Deliverance 2 is a 1-versus-1 turn-based push-your-luck game similar to Farkle but with custom scoring, loaded dice, wild jokers called Devil’s Heads, and optional badges that give special abilities. Players compete at dice tables in taverns, camps, and villages against NPCs. The goal is to be the first to reach or exceed a target score. The target changes depending on the bet, usually between 1000 and 5000+ points for higher stakes. Both players wager groschen; the winner takes the entire pot. There are two modes: with badges and without badges. Higher bets unlock better badge tiers (Tin, Silver, Gold) and higher target scores.

Each player chooses up to 6 dice from their inventory. If no dice are selected, ordinary dice are used by default. If the mode allows badges, each player can equip one badge. A turn begins by shaking a cup and rolling the 6 active dice.

After rolling, the player looks at the dice and selects one or more disjoint valid scoring combinations. The game shows possible combinations and the potential score for the current turn. The player can hold those dice. If at least one valid combination is held, the player has two choices: bank the points and pass the turn, or continue by setting the held dice aside and rerolling the remaining dice. If no dice remain, the player gets a fresh set of 6 dice. If no valid combination can be made after a roll, the player busts, loses all points earned during the current turn, and the turn ends.

The first player to reach or exceed the target score wins the pot and, if badges were bet, takes the opponent’s badge. The game is different from standard Farkle in these ways: you can bank points mid-turn instead of risking everything every roll, Devil’s Heads act as wildcards that complete any combination, dice can be biased/loaded, badges add special rules, pairs do not score, only single 1s and 5s score outside of sets and straights, and sets of four or more double the base triple score for each extra matching die.

Scoring works like this. Single 1 gives 100 points. Single 5 gives 50 points. Straight 1-2-3-4-5 gives 500 points. Straight 2-3-4-5-6 gives 750 points. Straight 1-2-3-4-5-6 gives 1500 points. Three 1s give 1000 points. Three 2s give 200 points. Three 3s give 300 points. Three 4s give 400 points. Three 5s give 500 points. Three 6s give 600 points. Four of any number doubles the three-of-a-kind value. Five of any number doubles it again. Six of any number doubles it again. So five 2s are 800 points, six 2s are 1600 points, five 1s are 4000 points, six 1s are 8000 points, and so on. You can score multiple combinations in one turn as long as they do not overlap. Devil’s Heads can stand in for any number needed to complete a combination. No other combinations like pairs or full houses score.

Some badges unlock special low-value formations that can be scored when the badge is active. These include Cut which is 3 and 5, Gallows which is 4-5-6, and Eye which is 1-3-5. Exact point values for these are usually low, around 100-200 points.

There are more than 44 different dice types that can be collected. Each has its own probability distribution instead of being fair. The player can choose any combination of up to 6 dice, including duplicates. The Devil’s Head die has a roughly 16.7 percent chance to roll a joker instead of a 1\. Other dice favor certain numbers heavily. Examples include Favourable Die which rolls 1, 5, or 6 very often, Lucky Die which favors 1 and 6, Monk’s Die which mostly rolls 1 or 2, Painted Die and Lousy Gambler’s Die which favor 5, and many others that push toward 1s, 6s, straights, or specific sets.

Badges come in Tin, Silver, and Gold tiers. Only one badge can be equipped per player. Some badges can be used multiple times per game, others only once. Effects include doubling the last roll, starting with bonus points, canceling the opponent’s badge, rerolling dice, adding extra dice to a roll, changing a die face to a specific number, enabling the special formations listed earlier, multiplying the entire turn score, allowing a reroll after busting, or other powerful one-time effects. Higher-tier badges usually beat or cancel lower-tier ones.

NotebookLM:

To successfully architect and ship a 1:1 digital recreation of the dice minigame from *Kingdom Come: Deliverance 2*, your engineering and design teams will need a comprehensive technical specification. The minigame is a highly sophisticated adaptation of the traditional dice game "Farkle," elevated by an RPG meta-layer consisting of weighted probabilities, active-use items (badges), and advanced AI risk-assessment heuristics.

Here is the complete product breakdown, defining the core game loop, the mathematical scoring engine, the meta-layer systems, and the behavioral logic required to replicate the experience.

### **1\. Core Game Loop & State Machine**

The game operates as a turn-based race between two actors (the Player and the NPC) aiming to hit a configurable victory threshold, typically set between 2,000 and 5,000 points depending on the stakes.

The state machine for a single turn follows this sequential logic:

* **The Roll (Initialization):** The active player's turn begins by throwing a full set of six 6-sided dice into the tray.  
* **The Selection Phase:** The system evaluates the resulting face values. If valid scoring dice are present, the player enters the selection state and must manually set aside ("hold") a minimum of one scoring die or valid combination.  
* **The Tactical Decision (Binary Choice):** After holding at least one die, the UI must prompt the player with two actions:  
  * *Bank (Score and Pass):* The player commits the accumulated points from the current unbroken turn to their permanent total. The turn state safely terminates, and the dice pass to the opponent.  
  * *Continue (Score and Continue):* The player retains the held dice and throws the *remaining* unheld dice to accumulate additional points in the same turn.  
* **The Failure State (Bust/Farkle):** If a player rolls the remaining dice and zero valid scoring combinations appear, a "Bust" is triggered. The systemic consequence is the immediate forfeiture of *all* unbanked points accumulated during that current turn, and the state forcibly transitions to the opponent.  
* **The Reset State (Hot Dice / Lucky Rush):** If a player successfully scores and holds all six dice across their rolls without busting, the system clears the board. The player is granted a full reset, allowing them to pick up all six dice and roll again, continually adding to their current turn's unbroken score.

### **2\. The Combinatorial Scoring Engine**

Your scoring logic must strictly adhere to a hierarchical matrix. A critical constraint you must enforce in the backend is the **Rule of Single-Roll Integrity**: all multi-die combinations (sets and straights) must be produced within a *single, isolated throw*. A player cannot hold two 4s from roll one, roll a third 4 on roll two, and combine them to score 400 points; the third 4 is worth zero and will cause a bust if it is the only die rolled.

**Base Singletons:**

* Face value 1 \= 100 points.  
* Face value 5 \= 50 points. *(Note: 2, 3, 4, and 6 carry zero point value as singletons and will trigger a bust if rolled alone).*

**Multi-Die Sets (Three-of-a-kind and Multipliers):** Triplets form the baseline for sets. The point value is the die's face value multiplied by 100, with the exception of 1s, which trigger a tier-jump.

* Three 2s \= 200 | Three 3s \= 300 | Three 4s \= 400 | Three 5s \= 500 | Three 6s \= 600 | Three 1s \= 1,000.

For every additional matching die rolled in that same throw, the game applies a strict doubling multiplier to the base triplet score:

* **4-of-a-kind (Base x 2):** E.g., Four 4s \= 800; Four 1s \= 2,000.  
* **5-of-a-kind (Base x 4):** E.g., Five 4s \= 1,600; Five 1s \= 4,000.  
* **6-of-a-kind (Base x 8):** E.g., Six 4s \= 3,200; Six 1s \= 8,000 (The highest possible score in the game).

**Sequence Scoring (Straights & Unique Sets):**

* Small Straight (1 to 5\) \= 500 points.  
* Small Straight (2 to 6\) \= 750 points.  
* Full Straight (1 to 6\) \= 1,500 points.  
* Three Pairs (e.g., 2,2, 3,3, 4,4) \= 1,500 points.  
* Two Triplets (e.g., 3,3,3 and 6,6,6) \= 2,500 points.

### **3\. The RPG Meta-Layer (Data Structures & Modifiers)**

To match the original game, you must implement systems that deliberately skew the math in favor of the player or high-level NPCs.

**Weighted RNG (Loaded Dice):** Standard dice use a uniform distribution (16.67% for all faces). Loaded dice use custom weighting tables. Your backend should manage these as weight integers that normalize into percentage probabilities.

* *Example 1 \- The Weighted Die:* Extremely biased toward 1s. (Face 1: 66.7%, Faces 2-6: 6.7% each).  
* *Example 2 \- The Pie Die:* Biased to low numbers and physically incapable of rolling highs. (Face 1: 46.2%, Face 2: 7.7%, Faces 3 & 4: 23.1%, Faces 5 & 6: 0%).  
* *Example 3 \- Holy Trinity Die:* Heavily biased to rolling 3s to capitalize on triplet combos. (Face 3: 36.8%, Face 2: 26.3%, Face 1: 21.1%, Faces 4-6: 5.3%).

**The Devil's Head (Joker Die) Logic:** Certain dice replace the "1" face with a Devil's Head, which acts as a wild card. Your codebase requires a dynamic value assignment function for this die. During the evaluation phase of a roll, the Devil's Head must recursively check the other five dice and automatically adopt the face value that yields the highest possible scoring combination. Note: It holds no value on its own, and a roll consisting entirely of Devil's Heads is an automatic bust.

**The Badge System (Active & Passive Modifiers):** Players equip one Badge (Tin, Silver, or Gold tier) per match. You will need an effects manager to handle these triggers:

* *Resource Modifiers:* Adds a 7th die to the tray (Badge of Might).  
* *Score Multipliers:* Doubles the score of the entire turn (Gold Warlord Badge) or doubles the score of a specific throw (Doppelganger Badge).  
* *State Savers:* Grants a free reroll immediately following a bust (Resurrection Badge).  
* *Counter-Play:* "Defense" badges that passively nullify the opponent's badge if it matches the same rarity tier.

### **4\. AI Behavioral Heuristics**

A random-number-generator opponent will feel broken. Your NPC agent needs a probability-based decision tree that evaluates the risk of busting against the current game state.

* **Statistical Thresholds:** With fair dice, rolling 1 die yields a \~66.7% bust rate; 2 dice yield a \~44.4% bust rate; 3 dice yield a \~27.8% bust rate.  
* **Logic Matrix:** Program the AI to *always* "Score and Pass" when left with 1 or 2 dice. When holding 3 dice, the AI should pass if it has accumulated \>= 350 points, but continue if holding \<= 300 points. It should *always* "Score and Continue" with 4, 5, or 6 dice.  
* **Contextual Aggression:** Introduce delta-state overrides. If the AI is trailing by a massive margin, it should override the safety matrix and push its luck on 1 or 2 dice. If it holds a massive lead, it should bank smaller scores early to protect its advantage.

### **5\. UX/UI & Audio-Visual Specifications**

To achieve the exact game feel, ensure your frontend implements these sensory cues:

* **Input Validation:** The "Score and Pass" and "Score and Continue" UI buttons must remain disabled until a valid scoring subset is selected by the user.  
* **Visual Shaders:** Implement a dark, smoky gray particle/shader effect over the dice when a player busts, providing immediate negative sensory feedback. Conversely, apply a golden, glowing light effect when a player triggers a "Lucky Rush" (clearing the board) to emphasize momentum.  
* **Audio Assets:** Integrate variable sound effects (distinct collision "clinks") based on the physical material of the dice being thrown, such as wood, bone, or metal.

NotebookLM Reports:

Report 1:

**Technical Specification: Reconstruction of the Bohemian Farkle System (KCD2)**

## **1\. Core Gameplay Loop and State Machine Architecture**

The Bohemian Farkle system is a turn-based race to a victory threshold, typically configured between 2,000 and 5,000 points. The system logic operates as a finite state machine alternating between the Player Actor and the NPC Actor.

### **1.1 State Transition Logic**

1. **\[INIT\_TURN\]:** System resets `Turn_Score` to 0 and `Active_Dice` to 6\.  
2. **\[ROLL\_STATE\]:** System executes weighted RNG for all `Active_Dice`.  
3. **\[EVAL\_SCORING\]:** System checks for valid combinations.  
   * If no scoring dice exist: Transition to **\[BUST\_STATE\]**.  
   * If scoring dice exist: Transition to **\[SELECTION\_PHASE\]**.  
4. **\[SELECTION\_PHASE\]:** Actor selects a subset of scoring dice (S \\ge 1).  
5. **\[DECISION\_BRANCH\]:** Actor chooses between:  
   * **Bank:** `Total_Score += Turn_Score`. Transition to **\[TURN\_END\]**.  
   * **Continue:** `Active_Dice -= Count(S)`. If `Active_Dice == 0`, trigger **\[LUCKY\_RUSH\]**. Transition back to **\[ROLL\_STATE\]**.

### **1.2 Failure and Success States**

* **The Bust (Failure):** Occurs when a roll yields zero scoring dice. Unbanked `Turn_Score` is nullified. The UI triggers a "dark, smoky gray" shader on the dice.  
  * **Bust Probability Constants (Fair Dice):** R(3) \\approx 27.8\\%, R(2) \\approx 44.4\\%, R(1) \\approx 66.7\\%.  
* **Lucky Rush / Hot Dice (Success):** Triggered when all six dice are utilized in scoring combinations. This grants a reset of `Active_Dice` to 6 while preserving `Turn_Score`. The UI triggers a "golden light" glow effect.

\--------------------------------------------------------------------------------

## **2\. Combinatorial Scoring Engine and Mathematical Hierarchy**

Scoring is calculated based on single rolls. Combinations cannot be formed incrementally across multiple throws within a single turn.

### **2.1 Individual Dice Valuation**

Only faces '1' and '5' possess value as singletons.

| Single Die Face | Point Value |
| :---- | :---- |
| Die face '1' | 100 points |
| Die face '5' | 50 points |

### **2.2 Multi-Die Combinations and Multiplicative Logic**

Sets of three or more identical values trigger the base-doubling mechanic (Base x2, x4, x8).

| Face Value | 3-of-a-Kind (Base) | 4-of-a-Kind (x2) | 5-of-a-Kind (x4) | 6-of-a-Kind (x8) |
| :---- | :---- | :---- | :---- | :---- |
| **Ones** | 1,000 | 2,000 | 4,000 | **8,000** |
| **Twos** | 200 | 400 | 800 | 1,600 |
| **Threes** | 300 | 600 | 1,200 | 2,400 |
| **Fours** | 400 | 800 | 1,600 | 3,200 |
| **Fives** | 500 | 1,000 | 2,000 | 4,000 |
| **Sixes** | 600 | 1,200 | 2,400 | 4,800 |

### **2.3 Sequence and Special Scoring**

* **Small Straight (1-5):** 500 points.  
* **Small Straight (2-6):** 750 points.  
* **Full Straight (1-6):** 1,500 points.  
* **Three Pairs:** 1,500 points (includes 4-of-a-kind \+ 1 pair).  
* **Two Triplets:** 2,500 points.

\--------------------------------------------------------------------------------

## **3\. Weighted RNG and the Special Dice Ecosystem**

The system determines roll values using a weighted random selection formula: P(x) \= W\_x / \\sum W\_i, where W represents the integer weight of face x.

### **3.1 Master Weight Table (Post-Patch 1.4)**

The following weights are extracted from internal data structures to facilitate probability normalization.

| Dice Name | W1 | W2 | W3 | W4 | W5 | W6 | Total (W\_i) | Strategic Utility |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Ordinary** | 1 | 1 | 1 | 1 | 1 | 1 | 6 | Uniform distribution. |
| **Weighted** | 10 | 1 | 1 | 1 | 1 | 1 | 15 | Maximizes singleton 1s. |
| **Odd** | 8 | 2 | 8 | 2 | 8 | 2 | 30 | Favors faces 1, 3, 5\. |
| **Even** | 2 | 8 | 2 | 8 | 2 | 8 | 30 | Favors faces 2, 4, 6\. |
| **Pie** | 6 | 1 | 3 | 3 | 0 | 0 | 13 | 0% weight for high faces. |
| **Heavenly Kingdom** | 7 | 2 | 2 | 2 | 2 | 4 | 19 | High-tier bias for 1s. |
| **Holy Trinity** | 4 | 5 | 7 | 1 | 1 | 1 | 19 | Commemorates the number 3\. |
| **Lucky** | 6 | 1 | 2 | 3 | 4 | 6 | 22 | Bias for scoring ends (1/6). |
| **Lu** | 3 | 3 | 3 | 3 | 3 | 6 | 21 | Bias for face 6\. |
| **Ci** | 3 | 3 | 3 | 3 | 3 | 6 | 21 | Bias for face 6\. |
| **Fer** | 3 | 3 | 3 | 3 | 3 | 6 | 21 | Bias for face 6\. |
| **Grimy** | 1 | 5 | 1 | 1 | 7 | 1 | 16 | Heavy skew toward 2 and 5\. |
| **Shrinking** | 2 | 1 | 1 | 1 | 1 | 3 | 9 | Skew toward faces 1 and 6\. |
| **St. Antiochus** | 3 | 1 | 6 | 1 | 1 | 3 | 15 | Adjusted from 100% face 3\. |

### **3.2 The "Devil’s Head" (Joker) Logic**

The Devil’s Head (Joker) replaces face 1\. Upon rolling, the system executes a recursive evaluation: the Joker is assigned the face value that yields the highest-scoring combination for the current roll. If no combinations are possible, it defaults to a value of 1 (100 points).

\--------------------------------------------------------------------------------

## **4\. Strategic Active Modifiers: The Badge System**

Badges grant unique active abilities and scale betting limits.

| Tier | Badge Name | Effect Description | Charges/Game |
| :---- | :---- | :---- | :---- |
| **Tin** | **Headstart** | Grants a small fixed point lead at initialization. | Passive |
| **Tin** | **Fortune** | Allows the actor to reroll one selected die. | 1 |
| **Silver** | **Transmutation** | Forces a selected die to become face 5\. | 1 |
| **Silver** | **Doppelgänger** | Doubles the score of the most recent roll. | 2 |
| **Gold** | **Transmutation** | Forces a selected die to become face 1\. | 1 |
| **Gold** | **Resurrection** | Allows a reroll of all dice immediately after a Bust. | 3 |
| **Gold** | **Warlord** | Doubles the cumulative Turn Score. | 1 |

### **4.1 The Defense Mechanic**

A "Defense" badge (e.g., Gold Badge of Defense) provides a passive nullification of the opponent's equipped badge of the same tier. This requires the Player Actor to strategically match the tier of the NPC's known badge.

\--------------------------------------------------------------------------------

## **5\. AI Behavioral Architecture and Risk Heuristics**

NPC Actors utilize a probability-based decision tree influenced by the gambling skill value (1–30).

### **5.1 Risk Management Heuristics**

* **Probability Threshold:** The standard NPC will Bank if `Active_Dice` \\le 3 and `Turn_Score` \\ge 350, as the fair-dice bust rate exceeds 27.8%.  
* **Conservative Lead:** If `NPC_Total - Player_Total > 500`, the NPC will bank any score \\ge 300 regardless of `Active_Dice` count to minimize momentum shifts.  
* **Aggressive Deficit:** If `Player_Total - NPC_Total > 1000`, the NPC ignores bust rates, continuing to roll even with 1 or 2 dice to force a Lucky Rush.

### **5.2 Skill-Based Scaling**

High skill values (25+) grant the NPC access to optimized sets (e.g., 6 Lucky Dice) and ensure the AI always holds the maximum possible scoring combinations before choosing to continue.

\--------------------------------------------------------------------------------

## **6\. RPG Systems Integration**

Player stats and world buffs modify the underlying RNG weight tables.

* **Agility Stat:** Each level of Agility adds a fractional weight to the faces 1 and 5 on all dice in the Player Actor’s tray.  
* **Perfect Throw (Agility Perk):** Increases the weight (W) of faces 1 and 5 by \+2 across all equipped dice.  
* **Creative Soul (Vitality Perk):** Restores Henry's energy levels while the mini-game is active.  
* **Pribyslavitz Boar:** Consumption of this ale applies a temporary luck buff, effectively shifting the weighted distribution of "Weighted" and "Lucky" dice toward their primary targets.

\--------------------------------------------------------------------------------

## **7\. Technical Data Structures**

Implementation requires the following formal representations:

enum BadgeTier { TIN, SILVER, GOLD };

struct DieObject {

    int current\_face;

    bool is\_held;

    int weights\[6\]; // \[W1, W2, W3, W4, W5, W6\]

};

struct Badge {

    BadgeTier tier;

    int effect\_id;

    int charges\_remaining;

    bool is\_defense;

};

struct GameState {

    int scores\[2\]; // \[Henry, NPC\]

    int turn\_score;

    int active\_dice\_count;

    bool is\_lucky\_rush;

    Badge equipped\_badges\[2\];

};

### **7.1 Input Validation**

The UI must intercept selection inputs. The "Bank" and "Continue" actions are disabled until at least one valid scoring combination (Singleton 1/5, Triplet+, or Straight) is selected and moved to the "Held" tray.

\--------------------------------------------------------------------------------

## **8\. World Events and Tournament Scenario Variants**

Tournament scenarios utilize maximum difficulty presets and unique reward pools.

* **Wedding Crashers Tournament:** Opponents utilize the **Badge of Might** (Opponent-only, high points per roll). The Player Actor must utilize the Defense mechanic to counter. Reward: **Gold Wedding Badge**.  
* **Game of Throws (Bandit Camp):** Features four consecutive opponents at Skill 30\. NPCs use fully optimized sets of loaded dice. Completion grants **Sir Hans Capon's Necklace**.

Report 2:  
**Technical Specification for the Reconstruction of the Bohemian Farkle System (Kingdom Come: Deliverance 2\)**

### **1\. Architectural Overview and Strategic Context**

The Bohemian Farkle System is a high-fidelity digital reconstruction of a traditional European folk game, engineered as a sophisticated three-pillar framework comprising **Procedural Rules**, a **Probabilistic Meta-Layer**, and **AI Behavioral Heuristics**. Within the economic ecosystem of 15th-century Bohemia, this system serves as a primary vehicle for capital progression, social tier interaction, and risk-management training. Its design successfully balances historical immersion with a deep mathematical complexity that rewards both statistical intuition and tactical preparation, utilizing weighted items to disrupt baseline randomness. The following sections detail the logical requirements to reconstruct this system, moving from the foundational state machine to the advanced technical modifiers that define high-stakes play.

### **2\. The Core Procedural State Machine**

The turn-based game loop is structured as a race to a victory threshold—typically 2,000 to 5,000 points in standard play, or 10,000 points in regional tournaments. The mechanical heart of the turn is the recursive decision loop, governed by the strategic tension between banking accumulated capital and the high-risk "push-your-luck" state.

#### **Phase Transition Logic**

Each turn must strictly adhere to the following sequential flow:

1. **Turn Initialization:** The active actor (Player or NPC) rolls a full set of six dice into the tray.  
2. **Evaluation Phase:** The system performs a recursive check for valid scoring combinations. If zero scoring dice appear, the actor transitions immediately to the "Bust" state.  
3. **Selection Phase:** The actor must select and "hold" at least one scoring die or combination to proceed.  
4. **Decision Branch:** The actor chooses to either **Bank** (committing points to their permanent total and ending the turn) or **Continue** (rolling the remaining unheld dice to increment the turn total).

#### **The "Bust" (Failure State)**

A "Bust" occurs when a throw results in zero scoring outcomes. This trigger results in the immediate forfeiture of all unbanked points accumulated during the current turn and forces a transition to the opponent. To provide clear sensory feedback, the system utilizes a **dark smoky gray** shader on the dice in the tray, communicating the loss of momentum.

#### **The "Hot Dice" (Lucky Rush) Mechanic**

A "Hot Dice" state (or "Lucky Rush") is triggered when an actor utilizes all six dice in scoring combinations during a single turn. This grants a full tray reset, allowing the actor to roll all six dice again while retaining the current turn score. This creates the potential for exponential scoring streaks. Visually, this transition is signaled by a **golden light** UI shader. The integrity of this state machine relies on the scoring logic applied to each individual throw, which forms the basis for the broader combinatorial hierarchy.

### **3\. Comprehensive Combinatorial Scoring Hierarchy**

The scoring schema forces players to evaluate the trade-off between common, low-reward outcomes and rare, high-value sets. A critical architectural constraint is the **Rule of Single-Roll Integrity**: all combinations must be achieved in a single throw. Dice held from previous rolls cannot be combined with new rolls to form sets.

#### **Individual Die Valuation**

Only the "1" and "5" faces provide points as singletons.

| Single Die Face | Point Value |
| :---- | :---- |
| Die Face '1' | 100 Points |
| Die Face '5' | 50 Points |

#### **The Triplet Base & Multiplicative Scaling**

Triplets (three-of-a-kind) serve as the base for set scoring. The system applies a doubling mechanic for sets larger than three dice rolled in a single throw.

| Combination | Base (3x) | 4-of-a-kind | 5-of-a-kind | 6-of-a-kind |
| :---- | :---- | :---- | :---- | :---- |
| **Ones** | 1,000 | 2,000 | 4,000 | **8,000** |
| **Twos** | 200 | 400 | 800 | 1,600 |
| **Threes** | 300 | 600 | 1,200 | 2,400 |
| **Fours** | 400 | 800 | 1,600 | 3,200 |
| **Fives** | 500 | 1,000 | 2,000 | 4,000 |
| **Sixes** | 600 | 1,200 | 2,400 | 4,800 |

#### **Sequence and Special Combinations**

Straights and unique pairings offer high fixed-point rewards.

* **Small Straight (1-5):** 500 Points  
* **Small Straight (2-6):** 750 Points  
* **Full Straight (1-6):** 1,500 Points  
* **Three Pairs:** 1,500 Points  
* **Two Triplets:** 2,500 Points (DLC/High-Stakes)

While these rules provide the framework, the game's meta-layer disrupts uniform probabilities through the introduction of weighted dice.

### **4\. The Probabilistic Meta-Layer: Weighted Dice Ecosystem**

Specialized "loaded" items allow for strategic probability manipulation, altering the game’s probability density function to favor specific outcomes.

#### **Normalization Formula**

Weights are managed as integers and normalized into percentages: P(x) \= \\frac{W\_x}{\\sum\_{i=1}^{6} W\_i} *Where W\_x is the weight of face x.*

#### **Weighted Dice Reference Table**

| Dice Name | Raw Weights (1-6) | Primary Bias % | Strategic Utility |
| :---- | :---- | :---- | :---- |
| **Ordinary** | 1, 1, 1, 1, 1, 1 | 16.7% (All) | Baseline uniform distribution. |
| **Weighted** | 10, 1, 1, 1, 1, 1 | 1: 66.7% | Maximizes singleton 1s. |
| **Odd Die** | 8, 2, 8, 2, 8, 2 | 1/3/5: 26.7% | Streaks with 1, 3, 5\. |
| **Even Die** | 2, 8, 2, 8, 2, 8 | 2/4/6: 26.7% | Streaks with 2, 4, 6\. |
| **Pie Die** | 6, 1, 3, 3, 0, 0 | 1: 46.2% | Guarantees low faces (0% for 5/6). |
| **Aranka's** | 6, 1, 6, 1, 6, 1 | 1/3/5: 28.6% | High 1/3/5 consistency. |
| **Favourable** | 6, 0, 1, 1, 6, 4 | 1/5: 33.3% | Optimal scoring for 1s and 5s. |
| **Kingdom** | 7, 2, 2, 2, 2, 4 | 1: 36.8% | High-tier 1 bias. |
| **Holy Trinity** | 4, 5, 7, 1, 1, 1 | 3: 36.8% | Triplet fishing for 3s. |
| **Lucky Die** | 6, 1, 2, 3, 4, 6 | 1/6: 27.3% | High value bias for extremes. |
| **Lu/Ci/Fer** | 3, 3, 3, 3, 3, 6 | 6: 28.6% | Demonic set favoring 6s. |
| **Grimy Die** | 1, 5, 1, 1, 7, 1 | 2: 31.3%, 5: 43.8% | Heavy skew for 5s and 2s. |
| **Shrinking** | 2, 1, 1, 1, 1, 3 | 6: 33.3% | Lightly loaded; high 6 potential. |
| **St. Antiochus** | 3, 1, 6, 1, 1, 3 | 3: 40.0% | Post-Patch 1.4: Skewed toward 3s and 6s. |

#### **The "Devil's Head" (Joker) Logic**

The "Devil's Head" acts as a Joker (replacing the '1' face). It utilizes a recursive value-assignment algorithm to maximize the throw score. This check must occur **before** the Selection Phase validation to ensure the UI accurately reflects potential points. If a roll is 6-6-Joker, the Joker adopts '6' for a triplet; if 1-2-3-4-Joker, it adopts '5' for a straight. Physical dice modifiers are further augmented by active tactical abilities.

### **5\. Active Tactical Modifiers: The Badge System**

Badges represent a tactical layer of limited-use active abilities that dictate the stakes and betting limits of a match.

#### **Tiered Ability Matrix**

| Tier | Ability Name | Usage / Effect |
| :---- | :---- | :---- |
| **Tin** | Headstart | Passive: Henry begins match with small point lead. |
| **Tin** | Fortune | Active (1x): Reroll a single die. |
| **Silver** | Transmutation | Active (1x): Force a die to become a 5\. |
| **Silver** | Doppelganger | Active (2x): Double the points of the last throw. |
| **Gold** | Transmutation | Active (1x): Force a die to become a 1\. |
| **Gold** | Resurrection | Active (3x): Allows a reroll immediately after a Bust. |
| **Gold** | Warlord | Active (1x): Double the total turn score upon banking. |
| **Gold** | Defense | Passive: Disables opponent's badge of the same tier. |

The Defense Badge is a critical balancing tool, preventing AI-driven momentum swings in high-stakes environments. These variables interact directly with the NPC’s risk-assessment heuristics.

### **6\. AI Behavioral Heuristics and Difficulty Modeling**

The AI simulates human risk-assessment rather than simple randomization, adjusting strategies based on statistical bust rates and score proximity.

#### **Risk Management Thresholds**

The AI evaluates the probability of failure based on the unheld dice count:

* **3 Dice:** \~27.8% Bust rate.  
* **2 Dice:** \~44.4% Bust rate.  
* **1 Die:** \~66.7% Bust rate.

AI heuristics dictate "Score and Pass" when the current unbanked score exceeds 350 points with 3 dice remaining, or when any dice count falls below 3\.

#### **Dynamic Aggression and Skill Scaling**

NPCs possess a **Gambling Skill (1-30)** stat. Higher skill correlates with optimized choices and equipment:

* **Low Skill (1-10):** Random logic; uses Ordinary Dice; Tin badges.  
* **High Skill (20-30):** Full sets of Lucky Dice; Gold badges; high aggression when in a deficit.  
* **Aggressive Deficit Strategy:** If losing significantly, the AI will risk rolls with only 1 or 2 dice to trigger a "Hot Dice" reset.

Player progression tilts these odds via stats and perks.

### **7\. Character Progression and World Integration**

Player-character statistics and world-state variables modify the core RNG and socio-economic stakes.

#### **Passive Buffs and Perks**

* **Agility Stat:** Provides a subtle bias toward scoring faces to avoid busts.  
* **Perfect Throw Perk:** Increases frequency of 1s, 5s, and high-value sets.  
* **Creative Soul Perk:** Henry regains energy while playing, bypassing fatigue.  
* **Pribyslavitz Boar:** This specific ale provides a temporary luck buff to roll outcomes.

#### **Socioeconomic Stakes**

Betting limits and equipment scale by social tier:

* **Peasants:** 5-20 Groschen; standard dice.  
* **Townsmen:** 50-100 Groschen; 1-2 special dice.  
* **Nobles:** 150+ Groschen; full loaded sets and Gold badges.

Special contexts include the **Wedding Crashers** tournament (winning unique Wedding Badges) and the **Game of Throws** DLC, an endgame challenge against masters with optimized sets.

### **8\. Technical Implementation Specifications**

#### **Core Data Structures**

* **Die Object:** `current_value`, `is_held`, `weight_table[6]`.  
* **Badge Object:** `tier`, `effect_id`, `charges`.  
* **Game State:** `banked_scores`, `current_turn_score`, `active_dice_count`, `is_lucky_rush`.

#### **ItemID Database Schema**

| ItemID | Name | ItemID | Name |
| :---- | :---- | :---- | :---- |
| `6a479d81-e642-40b3-92ad-0e43793f8c66` | Aranka's Die | `9a9d9c0d-2c94-475d-ab72-75b8ced9ac05` | Devil's Head |
| `1bd8d5d2-f57e-48c8-8f82-df7ae1ea90d3` | Lucky Die | `329d2697-b6d2-452d-9ba9-09649a607740` | St. Antiochus |
| `f8e3162a-dff1-4099-a60f-05be4e40f7ca` | Weighted Die | `65ccc0cd-de18-4305-9d64-42bb3c6d8d30` | Ordinary Die |

#### **Procedural Generation and Validation**

1. **Weighted Roll:** Execute weighted random selection using P(x) \= W\_x / \\sum W\_i for all active dice.  
2. **Joker Processing:** Calculate the optimal value for Devil's Head dice *before* input is enabled.  
3. **Single-Roll Validation:** The validator must fail any attempt to combine dice from the current roll with dice held from previous throws (e.g., holding two '4's from Roll A and a '4' from Roll B does not equal a triplet).  
4. **Shader Triggers:** Mandate the **Golden Glow** for Lucky Rush and **Smoky Gray** for Bust failure states.

The Bohemian Farkle experience is defined by this interplay of randomness, biased inventory, and risk management. Success requires the strategic synthesis of these interconnected pillars.

