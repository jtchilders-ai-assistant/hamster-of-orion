# Final Review: Diplomacy & Espionage vs. MOO1 Reference

**Reviewer:** Wesley Crusher (subagent)
**Date:** 2026-04-13
**Method:** Design files compared against StrategyWiki MOO1 Diplomacy page
(https://strategywiki.org/wiki/Master_of_Orion/Diplomacy) and
StrategyWiki MOO1 Spying page
(https://strategywiki.org/wiki/Master_of_Orion/Spying)

**Prior Review:** `diplomacy/REVIEW_DIPLOMACY.md` (2026-04-12) — all 6 Critical issues resolved.
This document focuses on fidelity to MOO1 source mechanics.

---

## Source Material Notes

The reference file (`strategywiki-moo1.txt`) contains only the Table of Contents — no actual
diplomacy or spy content. Full content was fetched directly from StrategyWiki during this review.

**MOO1 Diplomacy page** provided:
- Relationship indicator names and numeric ranges
- Basic inclinations (racial attitude matrix)
- AI behavior philosophy
- Trade treaty mechanics
- Alliance / betrayal patterns

**MOO1 Spying page** provided:
- The actual spy roll formula
- The spy result chart (Roll → Discover/Success/Access outcomes)
- The second roll chart (mission success/failure/frame outcomes)
- Spy spending mechanics (percentage of galactic resources, 0-10% per race, 0-20% defense)
- Cost/effectiveness philosophy

---

## 1. Relationship Indicators — DISCREPANCY FOUND

### MOO1 Reference (StrategyWiki)

MOO1 uses **17 named relationship states** with specific numeric ranges:

| Range | Name |
|-------|------|
| +91 to +100 | Harmony |
| +79 to +90 | Unity |
| +67 to +78 | Friendly |
| +55 to +66 | Peaceful |
| +43 to +54 | Affable |
| +31 to +42 | Calm |
| +19 to +30 | Amiable |
| +7 to +18 | Relaxed |
| +6 to -6 | Neutral |
| -7 to -18 | Unease |
| -19 to -30 | Wary |
| -31 to -42 | Restless |
| -43 to -54 | Tense |
| -55 to -66 | Troubled |
| -67 to -78 | Discord |
| -79 to -90 | Hate |
| -91 to -100 | Feud |

Note: "War" is a separate state, not a relationship score band.

### Design Files

`treaties.md` and `relationship-formulas.md` use only **5 coarse states**:

| Range | Name |
|-------|------|
| -100 to -50 | War (Hostile) |
| -49 to -1 | Unfriendly (Cold) |
| 0 to +49 | Neutral (Cautious) |
| +50 to +79 | Friendly (Warm) |
| +80 to +100 | Allied (United) |

### Assessment

**Major deviation from MOO1.** The design collapses 17 named states into 5. This is a deliberate
simplification — not inherently wrong for a new game — but it means the full emotional texture of
MOO1's diplomacy (Harmony, Feud, Discord, Tense etc.) is lost.

**Recommendation:** Either adopt the 17-state model for flavor (UI only, same underlying math), or
explicitly document this as an intentional simplification. The current design is missing the
MOO1-accurate terminology that players familiar with MOO1 would expect.

---

## 2. Basic Inclinations (Racial Attitude Matrix) — PARTIAL MATCH

### MOO1 Reference

The StrategyWiki page provides a complete 10×10 matrix of starting inclinations between all
10 original MOO1 races:

| Relationship | Starting Inclination |
|---|---|
| All races vs. Humans | Relaxed (best starting state) |
| Darloks vs. All | Unease (everyone distrusts them) |
| Mrrshan vs. Sakkra | Wary |
| Mrrshan vs. Alkari | Restless |
| Most pairs | Neutral or Unease |

Key facts:
- Humans are universally at "Relaxed" (the best) — everyone starts friendly to them
- Darloks start at "Unease" with everyone (they are mistrusted)
- Silicoids are mostly at "Neutral" (alien but not threatening)
- There are no "Friendly" starting pairs in MOO1 — the highest starting state is Relaxed

### Design Files

`relationship-formulas.md` Section 5.3 provides a partial attitude matrix for the custom races:

| Pair | Modifier |
|------|----------|
| Guinea Pigs → Hamsters | -30 |
| Guinea Pigs → Chameleons | -20 |
| Ferrets → Rabbits | -25 |
| Ferrets → Chameleons | -15 |
| Chameleons → Everyone | -10 |
| Budgies → Guinea Pigs | +10 |
| Budgies → Ferrets | +10 |
| Rats → Mice | +15 |
| Hamsters → Everyone | +10 |

### Assessment

**Structural match, content is custom.** The design correctly adapts the MOO1 Human universal-relaxed
mechanic to Hamsters (everyone starts slightly positive toward them). The Chameleon/Darlok distrust
(-10 from everyone toward them) is correctly modeled as Chameleons having a negative universal modifier.

**One discrepancy:** In MOO1, the Darloks receive "Unease" from everyone (roughly -7 to -18 in the
new numbering). The design applies -10 to Chameleons' starting relation with everyone, which is
consistent. However, the design does NOT model the _incoming_ penalty (that all other races start
with unease _toward_ Chameleons) — it only models the Chameleon outgoing modifier. The incoming
penalty should be added to the racial_attitudes JSON as: `{"from": "*", "to": "chameleons", "modifier": -10}`.

---

## 3. Spy Roll Formula — SIGNIFICANT DISCREPANCY

### MOO1 Reference (StrategyWiki Spying page)

The actual MOO1 spy roll formula is:

```
Roll = Random(1 to 100) - YourComputerTechLevel + TheirComputerTechLevel
```

**Goal:** Get the roll as LOW as possible (preferably ≤ 0).

**Result Chart:**

| Roll | Discovered | Success | Access Removed |
|------|-----------|---------|----------------|
| ≤ 0 | No | Yes + Possible Frame | No |
| 1–30 | No | Yes | No |
| 31–50 | Yes | Yes | No |
| 51–70 | No | No | No |
| 71–99 | Yes | No | Yes |
| 100+ | Yes | No | All Spies Fail |

If Success = Yes, a second roll determines outcome:

```
Second Roll = Random(1 to 100) + YourComputerTechLevel
```

| Second Roll | Outcome |
|-------------|---------|
| 0–84 | Partial success (tracks covered) |
| 85–99 | Full success (tech stolen or sabotage completed) |
| 100+ | Full success + Frame job (third party blamed) |

**Key mechanic:** The first roll is OPPOSED (enemy tech hurts you). The second roll is UNILATERAL
(your tech only helps you). This means success becomes more reliable as game progresses regardless
of opponent's tech.

**Spy spending:** Percentage of galactic resources per race (0–10%). Defense bar: 0–20%, where
spending 10% adds +20 to defensive spy rolls.

### Design Files (`espionage.md`)

The design uses a completely different formula:

```
SpyEffectiveness = BaseEffectiveness + RacialBonus + SpyRollBonus + TechBonus - TargetSecurity
SuccessChance = BaseMissionSuccess + SpyEffectiveness
```

Where TechBonus = (AttackerCompTech - DefenderCompTech) × 2, capped ±20.

The design also has:
- Security Levels 0–10 (spending-based), affecting detection chance
- Detailed mission types (recon, theft, sabotage, rebellion, frame, assassination)
- Racial espionage bonuses per race

### Assessment

**Fundamental structural difference.** MOO1's spy system is:
- A single roll with a result chart (not a success% formula)
- Two-phase (access roll, then mission roll)
- Resource-allocation based (percentage of galactic output)
- No named "missions" chosen per-turn — spies do Hide/Sabotage/Espionage categories

The design has replaced this with a detailed % success formula with many mission types. This is a
**deliberate and substantial expansion** beyond MOO1, not a faithful reproduction.

**Specific MOO1 mechanic NOT in design:**
1. The two-phase roll system (access roll + mission roll)
2. The "frame" being a critical-success result of the SAME roll (not a separate mission)
3. "All Spies Fail" result (roll 100+) — a catastrophic failure mode where ALL infiltrated spies
   lose a turn if one spy rolls 100+
4. The defense bar spending mechanism (+2 defensive roll per 1% spent)
5. Spy spending as % of galactic resources (not a per-spy flat cost)

**Chameleon/Darlok bonus in MOO1:** The StrategyWiki page confirms Darloks get "+30 flat bonus
added directly to spying rolls." The design correctly implements this as `SpyRollBonus = +30` for
Chameleons. ✅

**What the design adds beyond MOO1:**
- Named mission types (rebellion, assassination, frame as standalone missions)
- Security level system (0–10)
- Racial defense bonuses
- Counter-intelligence operations
- Sleeper agents
- Double agents
- Tech Sabotage

These expansions are all reasonable game design choices — but they go significantly beyond MOO1.

---

## 4. Treaty Types — MATCH WITH ADDITIONS

### MOO1 Reference

MOO1's StrategyWiki page describes:
- **Trade Treaty:** Primary economic treaty. +BC per turn, takes ~30 turns to ramp to full value.
  Re-negotiating resets progress (partial retention). Key: "free money with no strings attached."
- **Alliance:** Mentioned as forming "mega-alliances." AI prefers to be in at least one alliance.
  Breaking alliance = betrayal, context-dependent.
- **Non-Aggression Pact:** Implied but not detailed in the page text.
- **No separate "Research Pact"** — MOO1 doesn't appear to have a Research Agreement treaty type.
- **No "Defensive Pact"** as a distinct treaty — MOO1 has Alliance and Trade, largely.

### Design Files

`treaties.md` defines:
1. Peace Treaty
2. Non-Aggression Pact (NAP)
3. Trade Agreement
4. Research Agreement ← Not in MOO1
5. Military Alliance
6. Defensive Pact ← Not in MOO1 (only implied by Alliance)

### Assessment

**Research Agreement and Defensive Pact are design additions, not MOO1 mechanics.**

The Trade Agreement ramp-up mechanic is correctly captured in `trade.md` (30 turns to maximum
value, losing progress on re-negotiation). ✅

The StrategyWiki page emphasizes the trade treaty mechanic heavily: "usually takes about 30 turns
to start getting the maximum value." The design's trade formula (`Base = (Production_A + Production_B) / 20`)
needs verification — MOO1 uses a curve-based ramp, not a static formula. The design notes the
`+25% trade income` Hamster bonus, which matches the StrategyWiki statement that Humans have a
"+25% trade curve shift." ✅

**One design gap:** The design does not model the trade ramp-up (turns-to-maturity). A trade
agreement at turn 1 should yield less than a trade agreement at turn 30+. This mechanic from MOO1
is missing from the design.

---

## 5. Relation Modifiers — PARTIAL MATCH

### MOO1 Reference

The StrategyWiki diplomacy page discusses modifiers qualitatively:
- **Having too much population** → all races unite against you (biggest negative)
- **Repeated expansion warnings** → precede coalition war
- **Alliance betrayal** → AI drops treaties and attacks when they're clearly #1
- **Spying failures** → can end alliances, cost trade treaties
- **Council war state** → AI will vote against you even to its own detriment

Specific numeric modifiers are not listed on the StrategyWiki page.

### Design Files

`relationship-formulas.md` provides detailed numeric modifiers for all actions. These are
**design-original values** — the MOO1 reference page does not provide the underlying numbers.

### Assessment

**Design modifiers are original (not from MOO1 source code), but directionally correct.**

Notable gaps vs. MOO1:
1. **Population dominance penalty** — MOO1 applies a coalition-forming penalty when one race
   controls a large portion of the galaxy's population. This mechanic is NOT explicitly modeled
   in the design. It appears nowhere in `relationship-formulas.md`. MOO1's StrategyWiki warns
   this is "one of the few times you'll consistently find the entire galaxy allied against you."
   The design has no `DOMINANCE_PENALTY` or population-threshold trigger for coalition behavior.

2. **AI self-interest override** — MOO1's AI prioritizes self-interest over "team play." The design
   captures this philosophically in `ai-personalities.md` but no algorithm models when an AI drops
   an ally because the AI has become the strongest race. The StrategyWiki explicitly notes: "if it
   knows it is the #1 race in the galaxy... it will drop you like a bad habit."

3. **Council spite voting** — MOO1 notes that AIs at war with you will vote for ANY other candidate
   in the Council to prevent your victory, even if that costs them the game. The design's council
   voting algorithm handles war-state (cannot vote for enemy), but the "vote for anyone except you
   as spite" mechanic when specifically at war with the player is not explicitly specified.

---

## 6. Council Voting — MOSTLY CORRECT

### MOO1 Reference

StrategyWiki notes:
- Council forms when galaxy is sufficiently colonized
- Two-candidate system (top two by vote weight)
- Requires 2/3 majority
- AIs at war with you prefer to give votes to another candidate over you
- Election outcome depends on population

### Design Files

`council.md` correctly implements:
- Population-based vote weights ✅
- Two-candidate system ✅
- 2/3 victory threshold (≥67%) ✅
- War-state abstention / enemy vote ✅
- Bribery system ✅
- Relation-based voting ✅
- Fear factor (military intimidation) ✅

### Assessment

**Council design is the strongest area — well-matched to MOO1 intent.**

The main addition beyond MOO1: The design's detailed `Vote_Score` formula with Fear, Bribery,
Racial, and Reputation factors is original game design, not documented MOO1 mechanics. MOO1's
exact AI vote decision algorithm is not publicly documented; the design makes reasonable assumptions.

**One confirmed MOO1 behavior correctly captured:** The "spite voting" when at war — design
Section 4.7 correctly returns `candidate2` when voter is at war with `candidate1`. ✅

---

## 7. AI Personality Behavior — MOSTLY CORRECT

### MOO1 Reference

Key behavioral notes from StrategyWiki:
- AIs are "self-serving" not "player-harming" — they don't auto-gang up on the player
- AIs prefer to be in at least one alliance
- AIs tend toward 2 mega-alliances or complete chaos (rarely 3 balanced alliances)
- AIs will betray when they calculate they can win: "Do unto others BEFORE they do unto you"
- AIs with "Erratic" personality declare war randomly
- AI races: Alkari, Bulrathi, Darlok, Human, Klackon, Meklar, Mrrshan, Psilon, Sakkra, Silicoid

### Design Files

`ai-personalities.md` captures the behavioral archetypes well. The "self-serving not player-harming"
principle is captured in the design's philosophy. Alliance formation and betrayal patterns are
covered.

**Notable gap:** MOO1 explicitly has an **"Erratic" personality** that causes random war
declarations. The design does not include an "erratic" personality type — every race has a defined
archetype and war-tendency value. Chameleons serve as the "unpredictable" race but they're
predictably opportunistic, not truly erratic.

---

## 8. Summary of Discrepancies

### 🔴 Significant — MOO1 Mechanics Missing or Mismatched

| # | Issue | File | MOO1 Source |
|---|-------|------|-------------|
| S1 | Spy roll formula is fundamentally different | `espionage.md` | StrategyWiki/Spying |
| S2 | Two-phase spy roll system not implemented | `espionage.md` | StrategyWiki/Spying |
| S3 | "All Spies Fail" catastrophic result not modeled | `espionage.md` | StrategyWiki/Spying |
| S4 | Defense spending as % of galactic resources not modeled | `espionage.md` | StrategyWiki/Spying |
| S5 | Frame job is a critical success roll, not a separate mission | `espionage.md` | StrategyWiki/Spying |
| S6 | Trade ramp-up mechanic (30 turns to full value) not in design | `trade.md` | StrategyWiki/Diplomacy |
| S7 | Population dominance coalition trigger not modeled | `relationship-formulas.md` | StrategyWiki/Diplomacy |
| S8 | 17-state relationship indicator names not used | `treaties.md`, `relationship-formulas.md` | StrategyWiki/Diplomacy |

### 🟠 Additions Beyond MOO1 (Design Expansions — Not Errors)

These features don't exist in MOO1 and are **original additions** to this game:

| Feature | Files |
|---------|-------|
| Research Agreement treaty | `treaties.md` |
| Defensive Pact treaty | `treaties.md` |
| Named mission types (Rebellion, Assassination, Frame as standalone) | `espionage.md` |
| Security level spending system (0–10) | `espionage.md` |
| Racial defensive espionage bonuses | `espionage.md` |
| Counter-intelligence / Spy Hunt / Double Agents / Sleeper Agents | `espionage.md` |
| Tech Sabotage mission | `espionage.md` |
| War Weariness system | `relationship-formulas.md` |
| 4-track Reputation system (Honor/Peace/Fairness/Mercy) | `relationship-formulas.md` |
| AI war/alliance/production decision formulas | `relationship-formulas.md` |
| Bribery Factor in council voting | `council.md` |
| Fear Factor in council voting | `council.md` |
| Pre-vote Lobbying Phase | `council.md` |

### ✅ Correctly Matched to MOO1

| Feature | Files |
|---------|-------|
| Hamster (Human) relaxed starting relations with all | `ai-personalities.md`, `relationship-formulas.md` |
| Hamster +25% trade curve shift | `trade.md`, `treaties.md` |
| Chameleon (Darlok) +30 flat spy roll bonus | `espionage.md` |
| Ants (Klackon) cannot conduct espionage flag | `espionage.md` |
| Two-candidate Council system | `council.md` |
| ≥2/3 vote threshold for Council victory | `council.md` |
| Population-based vote weights | `council.md` |
| AI self-serving (not player-harming) behavior | `ai-personalities.md` |
| Alliance mega-formation tendency | `ai-personalities.md`, `relationship-formulas.md` |
| AI betrayal when dominant | `ai-personalities.md` |
| Chameleon (Darlok) universal distrust | `relationship-formulas.md` |
| Rats (Psilon) have zero offensive espionage bonus | `espionage.md` |

---

## 9. Actionable Recommendations

### Priority 1 — Decide on Spy System Architecture

The MOO1 spy system (two-phase roll chart) is fundamentally different from what's designed.
The current design is richer but not MOO1-faithful. This is a **design decision**, not a bug.

**Options:**
- **A) Keep current design** — Document explicitly as "inspired by MOO1, substantially expanded."
  Add the "All Spies Fail" catastrophic result (roll 100+ equivalent) as a design touch.
- **B) Hybrid** — Keep the mission-type framework but replace the success% formula with a
  MOO1-style roll chart for the base success determination, then apply racial/tech modifiers.
- **C) Full MOO1 fidelity** — Re-implement using the two-phase chart. Lose the rich mission types.

**Recommendation:** Option A. The current design is better than MOO1's spy system. Just document it clearly.

### Priority 2 — Add Population Dominance Coalition Trigger

This is a documented MOO1 mechanic with no equivalent in the design. Add to `relationship-formulas.md`:

```
DOMINANCE_THRESHOLD = 0.40  // fraction of total galactic pop
DOMINANCE_PENALTY = -30     // applied to all relations when you exceed this
DOMINANCE_WARNING_THRESHOLD = 0.33  // AI starts sending warnings here
```

When a single empire controls ≥40% of total galactic population, all other empires receive a
flat -30 relation penalty toward that empire each turn, regardless of treaties.

### Priority 3 — Add Trade Ramp-Up Mechanic

MOO1's trade treaties ramp up over ~30 turns. Add to `trade.md`:

```
TradeTurnProgress = min(TurnsActive, 30)
TradeIncome = BaseTradeIncome × (TradeTurnProgress / 30)
```

Re-negotiating a treaty resets `TurnsActive` to `floor(prior_turns × 0.5)` (partial retention).

### Priority 4 — Add Relationship Indicator Names (UI Layer)

Add a mapping table to `relationship-formulas.md` that maps the -100 to +100 scale to
MOO1-accurate flavor names (or custom equivalents). This doesn't change any math — it's purely
for UI display. Even custom names would give the game the texture MOO1 had.

### Priority 5 — Fix Incoming Chameleon Distrust

In `relationship-formulas.md` Section 12.2, add:
```json
{"from": "*", "to": "chameleons", "modifier": -10}
```

Currently only the outgoing attitude (`chameleons → *`) is modeled. MOO1's Darloks received
universal distrust FROM all races, not just distrust directed toward others.

### Priority 6 — Document the Intentional Expansions

Add a section to `espionage.md` and `treaties.md` noting which features are MOO1 adaptations
vs. original additions. This helps future reviewers and developers understand design intent.

---

## 10. Verdict

The diplomacy system is **well-designed and internally consistent**, with the prior Critical
issues all resolved (per `REVIEW_DIPLOMACY.md`). The main deviations from MOO1 are:

1. **Spy system**: Substantially expanded beyond MOO1 (acceptable, arguably better)
2. **Relationship states**: Collapsed from 17 to 5 (lose MOO1 flavor, fine mechanically)
3. **Trade ramp-up**: Missing key MOO1 mechanic (should be added)
4. **Population dominance**: Missing key MOO1 coalition trigger (should be added)
5. **Treaty additions**: Research Pact and Defensive Pact don't exist in MOO1 (acceptable additions)

The **council.md** and **relationship-formulas.md** are the strongest files — detailed, consistent,
and well-matched to MOO1 intent. The **espionage.md** is comprehensive but is substantially its
own design system rather than a MOO1 port.

The prior `REVIEW_DIPLOMACY.md` identified 30 remaining open issues (H1-H8, M1-M12, m1-m10).
Those all remain valid — this review adds 8 new MOO1-specific findings (S1-S8) that were outside
the scope of the prior internal consistency review.

---

*Generated: 2026-04-13*
*Reference: StrategyWiki MOO1 Diplomacy + Spying pages (fetched live)*
*Design files reviewed: espionage.md, treaties.md, relationship-formulas.md, council.md, ai-personalities.md, trade.md*
