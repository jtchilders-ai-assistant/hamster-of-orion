# Diplomacy & AI Design Review

**Reviewer:** Wesley Crusher (subagent)
**Date:** 2026-04-12
**Files Reviewed:**
- `diplomacy/ai-personalities.md`
- `diplomacy/espionage.md`
- `diplomacy/trade.md`
- `diplomacy/council.md`
- `diplomacy/relationship-formulas.md`
- `diplomacy/treaties.md`
- `species/*.md` (all 10 races + template + race-stats-complete.md)

---

## Summary

The diplomacy system is impressively detailed overall. `espionage.md` and `council.md` are near implementation-ready. The main gaps are: **internal number inconsistencies**, **undefined AI decision trees**, **missing trade formula variables**, **treaty effect gaps**, and **species-vs-diplomacy conflicts**. Issues are organized by severity.

---

## 🔴 CRITICAL — Breaks Implementation

### C1: Hamsters Trade Bonus Is Inconsistent Across Documents

**STATUS: RESOLVED (2026-04-12)**

All documents now use **+25%** (multiplier 1.25), matching MOO1 Human trade curve shift.

| Document | Old Value | Fixed Value |
|----------|-----------|-------------|
| `trade.md` | +50% | **+25%** |
| `treaties.md` | +50% | **+25%** |
| `relationship-formulas.md` | +25% (was correct) | +25% |
| `race-stats-complete.md` (`trade_hub`) | +20% | **+25%** |

Source of truth: MOO1 StrategyWiki — Humans have a +25% trade curve shift.

---

### C2: Hamsters Diplomacy Modifier Is Inconsistent

**STATUS: RESOLVED (2026-04-12)**

The two modifiers are distinct and both apply:
- **Base modifier**: +30% (multiplier 1.30) — applied to ALL relationship changes
- **Universal Diplomat**: ×2.0 on positive actions only — applied on top of base
- **Combined for positive actions**: 1.30 × 2.0 = **2.60**

The old example used 1.60 (incorrect). All examples updated to use 2.60.
Constants table updated with `HAMSTER_DIPLOMACY_BASE`, `HAMSTER_POSITIVE_MULTIPLIER`, and `HAMSTER_POSITIVE_COMBINED` entries.

---

### C3: Ants Espionage Bonus Listed as -100 (Impossible to Infiltrate Others) vs. Immunity

**STATUS: RESOLVED (2026-04-12)**

Removed the -100 numeric modifier entirely. `espionage.md` Section 2.1 now lists Ants as `N/A` with `can_conduct_espionage: false`. The algorithm (Section 11) short-circuits before any formula runs when the flag is false. Section 13.2 JSON uses `"offensive_bonus": null` and `"can_conduct_espionage": false`. No numeric modifier — just the flag. The design note in Section 13.2 explicitly documents why.

---

### C4: Ants Defensive Bonus Is Undefined in Two Places

**STATUS: RESOLVED (2026-04-12)**

"Immune" is implemented as a pre-roll hard block via `immune_to_espionage: true`. The algorithm (Section 11) short-circuits before detection is even rolled — all missions auto-fail silently. No numeric `defensive_bonus` is used for Ants; Section 13.2 JSON uses `"defensive_bonus": null` and `"immune_to_espionage": true`. Section 14.1 Edge Cases documents the exact outcome: no success, no detection, no death, no BC refund, no diplomatic penalty.

---

### C5: Ferret `SpyEffectiveness` Worked Example Has Extra Undefined Term

**STATUS: RESOLVED (2026-04-12)**

Fixed `espionage.md` Section 5.3 Example 3. The `RacialDefenseBonus` does NOT belong in `SpyEffectiveness` — it belongs in `DetectionChance` (Section 4.2), which already correctly includes `RacialDefenseBonus` as a term. The example was wrong to subtract it from `SpyEffectiveness`.

Corrected example:
```
SpyEffectiveness = 30 + 10 + 6 - 10 = 36
  (base + Ferret racial + tech − security; no defense term here)
DetectionChance = 10 + (1×10) + (-5) + 0 = 15%
  (Rabbits’ -5 RacialDefenseBonus applies here, reducing detection)
```

The formula in Section 1.2 (which already included `SpyRollBonus` from the v1.1 update) is correct and consistent with the example. `TargetRacialDefenseBonus` is captured exclusively in `DetectionChance` — no double-counting.

---

### C6: Rats' Espionage Bonus Inconsistency

**STATUS: RESOLVED (2026-04-12)**

All documents now use **+0** for Rats' offensive espionage bonus. Psilons (the MOO1 analog) have no espionage bonus — they win through research speed, not spying. The old +5/+15 values were errors.

| Document | Old Value | Fixed Value |
|----------|-----------|-------------|
| `espionage.md` Section 2.1 | +5 | **+0** |
| `espionage.md` Section 13.2 JSON | `5` | **`0`** |
| `race-stats-complete.md` JSON | `15` | **`0`** |
| `species/rats.md` | `15` | **`0`** |

The moo1_note in espionage.md Section 13.2 documents the rationale.

---

## 🟠 HIGH — Functional Gaps

### H1: Trade Formula Has Undefined Variables

`trade.md` gives the income formula as:
```
Base = (Your Production + Their Production) / 20
Modified by: trade routes, distance penalty, pirates
```

**Undefined:**
- What counts as "production" (gross output? Net income? BC/turn?)
- Distance penalty: "-10% per 20 parsecs" — but from where to where? (homeworlds? nearest colonies? trade route endpoints?)
- "Trade routes (hyperspace lanes)" — what is the base income without them? Are routes required to trade at all, or do they just provide a bonus?
- The example gives `(1000 + 800) / 20 = 90 BC/turn each` — but trade agreements are stated elsewhere as `+5-20 BC/turn`. 90 BC/turn is far outside that range. One of these values is wrong.
- Pirate penalty applies to "trade routes" but no mechanism defines when pirates appear or how income is reduced (flat -20% or -20 BC?).

---

### H2: Council `HAMSTER_COUNCIL_BONUS` Not Applied in `DetermineVote` Consistently

In `council.md` Section 4.7, the pseudocode applies `HAMSTER_COUNCIL_BONUS` **after** the war-state check:
```pseudocode
if voter.at_war_with(candidate1) and not voter.at_war_with(candidate2):
    return candidate2  // Never vote for active enemy
```
But the Hamster bonus is applied before this check in the vote score, which won't matter since the war check short-circuits before scores are compared. This is fine logically, but the bonus is added outside `CalculateVoteScore()` rather than inside it, meaning it doesn't appear in the score for `CalculateVoteScore` calls from other systems (e.g., bribery effectiveness checks). Should be folded into the score function.

---

### H3: Council Bribery Formula Has a Unit Inconsistency

`council.md` Section 4.4:
```
Bribery_Factor = (Bribe_Value / Voter_Economy) × BRIBERY_WEIGHT × Racial_Bribe_Modifier
```

Example: `(1800 / 400) × 100 × 1.0 = 450 → capped to +50`

The `Voter_Economy` is per-turn income (400 BC/turn). The `Bribe_Value` is a one-time payment (BC). This ratio is not dimensionless — it measures "turns of their income" not a true ratio. This is likely intentional (1 turn of income = 100 score points) but it needs to be stated explicitly. Otherwise a race with 40 BC/turn income gets 10× the bribery score for the same bribe, which seems like it could be exploited with small, poor races.

---

### H4: Missing AI Decision Trees for War, Expansion, Tech Priority

`ai-personalities.md` describes personality archetypes and lists behaviors, but **no AI decision trees, priority weights, or turn-by-turn algorithms are defined** for:
- When to declare war (threshold logic, other than what's in `relationship-formulas.md` Section 8.3)
- How to allocate production (military vs. colony vs. research)
- When to expand (next-colony selection logic)
- When to accept vs. reject a peace offer
- How to choose spy targets
- When to propose treaties (vs. wait for player to propose)

`relationship-formulas.md` Section 8 provides `WarChance` and `AcceptanceChance` formulas, but the per-race production allocation logic, expansion strategy, and tech tree priority selection are entirely absent.

**What's missing:** Production split weights per archetype, colony selection scoring, tech-tree priority tables by race.

---

### H5: AI Personalities Reference Undefined "Government Type" Diplomacy Modifier

`treaties.md` Relations Modifiers lists:
- `Similar government: +10`
- `Different government: -5`

No document defines what "government type" each race has, how similarity is assessed, or where these modifiers are implemented. The relationship-formulas.md has no corresponding entry. The species files mention government types in flavor text but no coded `government_type` field exists in the JSON data.

---

### H6: Frame Job Detection — Two Different Base Rates

`espionage.md` Section 6.6:
```
FrameDetection = 30 + (PreviousFramesDetected × 10)
```
`relationship-formulas.md` Section 10.5:
```
If frame is detected (30% chance)...
Detection chance increases +10% per previous frame job detected.
```

These are the same formula, which is consistent. **However**, the `FrameSuccess` formula is:
```
FrameSuccess = 50 + SpyEffectiveness - TargetIntelligence
```
While the frame *detection* roll is separate from the frame *success* roll. The document does not clarify whether detection is rolled only on failure, only on success, or independently of success. This creates an implementation ambiguity: can a frame job succeed AND be detected simultaneously?

---

### H7: Assassination "Leader Protection" Formula Has Missing Base Value

`espionage.md` Section 6.7:
```
AssassinationSuccess = 10 + SpyEffectiveness - LeaderProtection
```
```
LeaderProtection:
  Base: 20
  Per Security Level: +5
  Capital Planet: +10
  At War: +15
```

But in Section 11 (Algorithm), `LeaderProtection` is not referenced at all — it's subsumed into generic `GetMissionModifiers()`. Since `AssassinationSuccess` subtracts `LeaderProtection` from the result (not from `SpyEffectiveness`), this mission is structurally different from all others. The worked example in Section 16 (Example 2) applies it correctly but the resolution algorithm doesn't reflect this.

---

### H8: Double Agent Loyalty Formula Has No Floor/Ceiling

`espionage.md` Section 8.3:
```
DoubleAgentLoyalty = 50 + BribeAmount / 100 - (TurnsActive × 2)
```

- No floor defined (loyalty goes negative — what happens?)
- No ceiling defined (unlimited bribery?)
- At turn 25 with no bribe, loyalty = 0 — triggers defection/death roll. But the table says "If loyalty drops below 20" triggers the outcomes. Below 0 is never handled.
- If you bribe 10,000 BC: loyalty = 50 + 100 = 150. No ceiling means a double agent can become "immortally loyal" with enough gold.

---

## 🟡 MEDIUM — Inconsistencies and Gaps

### M1: Treaty Break Penalties Are Different Across Documents

**Break Alliance penalty:**
| Document | Target Penalty | All-Races Penalty |
|----------|---------------|-------------------|
| `relationship-formulas.md` Section 3.2 | -100 | -50 |
| `relationship-formulas.md` JSON (12.3) | -100 | -50 |
| `treaties.md` "Breaking Peace" section | -50 all races (for breaking *peace*, not alliance — different action, consistent) |
| `treaties.md` "Break Treaty" section | -50 to -100 all races (vague) |

**Break NAP penalty:**
| Document | All-Races Penalty |
|----------|-------------------|
| `relationship-formulas.md` Section 3.2 | -15 all |
| `relationship-formulas.md` JSON (12.3) | -15 all |
| `treaties.md` | -30 all races |

The NAP break all-races penalty is -15 in relationship-formulas.md but -30 in treaties.md.

---

### M2: Hamster `Council Favorite` Ability Is Ambiguous

`species/hamsters.md` and `race-stats-complete.md` both say:
> **Council Favorite**: +1 vote in High Council elections

But `council.md` bases voting entirely on population percentage — there is no "+1 vote" mechanism. The Hamster diplomatic bonus in Council is implemented as `HAMSTER_COUNCIL_BONUS = +5` added to voter scores when evaluating Hamsters as candidates, not as an actual extra vote. These are different mechanics. The species file implies a raw vote count bonus; the council doc implements a favorability bonus.

---

### M3: Budgies Ground Combat Penalty Conflicts with AI Alliance Behavior

- `species/budgies.md`: Ground Combat = **-20%** ("terrible at ground warfare")
- `race-stats-complete.md` JSON: `"ground_combat": -20` ✓
- `ai-personalities.md`: "Poor at planetary invasion. Prefers to bomb planets from orbit" ✓

Consistent so far — but `council.md` Racial Affinity Matrix lists Budgies as preferring Ferrets (`+15`) and Guinea Pigs (via the "warrior respect" note in the worked example `+10`). If Budgies AI relies on Guinea Pig ground troops to hold conquered planets, this dependency is never formalized. The alliance behavior assumes complementary military but there's no rule specifying this coordination.

---

### M4: Chameleons Treaty Reliability Conflict

| Document | Reliability |
|----------|-------------|
| `ai-personalities.md` | "Keep treaties only if losing" |
| `espionage.md` (Section 13.2 JSON) | `"spy_cost_modifier": 0.50` (50% cost reduction, separate from text) |
| `council.md` Section 7.6 | `CHAMELEON_LOYALTY = 0.50` (50% alliance vote loyalty) |
| `relationship-formulas.md` JSON | `"treaty_reliability": 0.5` |
| `race-stats-complete.md` | `"treaty_reliability": 0.5` (confirmed) |
| `treaties.md` | "Rarely honor alliances" |
| `ai-personalities.md` | "Backstab allies" |

The 0.5 treaty reliability is internally consistent, but the narrative description across documents is inconsistent — some say "keep treaties only if losing" (implies high reliability when losing, unreliable when winning), others say "rarely honor alliances" (implies generic low reliability). These imply different AI implementations.

**Resolution needed:** Specify whether Chameleon treaty-breaking is situational (strength-based) or random (50% each turn).

---

### M5: Rabbits "Never Betray" Conflicts with Treaty Reliability Value

`species/rabbits.md`:
> **When betraying player (never):** [This scenario does not occur - Rabbits never betray]

`race-stats-complete.md` JSON: `"treaty_reliability": 0.85`

0.85 is not 1.0 — Rabbits do have a 15% chance of breaking treaties. The flavor text says "never betray" but the numbers say otherwise. Either the reliability should be 1.0, or the flavor text needs correction.

---

### M6: Guinea Pigs Treaty Reliability Conflict

| Document | Value |
|----------|-------|
| `ai-personalities.md` | "Keep treaties only if losing" + "They keep warrior's honor (won't break peace treaty)" |
| `race-stats-complete.md` | `"treaty_reliability": 0.5` |
| `treaties.md` | "Medium - will break treaties if they sense weakness" |

"Won't break peace treaty" (ai-personalities) directly contradicts `treaty_reliability: 0.5` and "will break treaties." The "warrior's honor" concept implies near-100% peace treaty reliability, but the number says 50%. This needs resolution — is the honor code applied as a special exception (peace treaties always held; other treaties at 50%), or is the flavor text wrong?

---

### M7: Hermit Crab Food Mechanic Not Reflected in Relationship/Trade Formulas

`species/hermit-crabs.md` states:
> **No Food Requirement**: Don't need agriculture

`race-stats-complete.md` lists `"food": 0` (neutral food bonus), and the unique gameplay note says "Hermit Crabs don't experience food as a resource. Instead, their 'food' slider adjusts mineral absorption efficiency."

But `trade.md` includes food as a tradeable resource:
> **Food Surplus**: Can export to starving colonies → +BC income

Hermit Crabs can't export food (they don't produce it), can't receive food aid (they don't need it), but the trade system assumes food is a universal trade resource. No rule specifies how Hermit Crabs interact with food-based trade or what happens when an AI tries to offer them food in a trade deal.

---

### M8: Ants Diplomatic Penalty Inconsistency

| Document | Value |
|----------|-------|
| `species/ants.md` | Diplomacy: **-30%** |
| `race-stats-complete.md` JSON | `"diplomacy": -30` |
| `relationship-formulas.md` Section 5.1 | Ants: **+0%** (neutral) |
| `relationship-formulas.md` JSON | `"diplomacy_modifier": 1.0` |

Ants have a -30% diplomatic penalty in the species file but are listed as neutral (1.0) in `relationship-formulas.md`. These must be reconciled. The AI description in `ai-personalities.md` describes Ants as "logical calculations only" / "alien mindset disturbs others" which supports a penalty.

---

### M9: Espionage Hostility Decay Floor Not Enforced in Worked Example

`espionage.md` Section 16 (Example 3):
> Turns 2-4: -2/turn = -6 → 5 - 6 = 0 **(minimum 0)**

This correctly applies the floor. But in Section 9.2:
> `HostilityDecay = 2 per turn (when no new espionage)`

No explicit floor of 0 is stated in the constants or formula section. It's implied by Example 3 but not specified. Should be `max(0, CumulativeHostility - 2)` or the floor should appear in Section 12 constants.

---

### M10: Research Pact Duration Inconsistency

| Document | Duration |
|----------|----------|
| `treaties.md` | 20 turns minimum |
| `relationship-formulas.md` JSON (12.3) | `"duration_min": 20` ✓ |
| `treaties.md` description | "+10% research both sides" |
| `relationship-formulas.md` Section 3.1 table | Research Pact: no research bonus listed — only +15 maintenance relation |

The +10% research bonus described in `treaties.md` is not implemented in `relationship-formulas.md` at all. The treaty effects table in `relationship-formulas.md` only tracks relationship bonuses, not the functional research bonus. This needs to appear in the treaty definitions JSON (12.3) as an `effects` field.

---

### M11: Defensive Pact "30 Turns Minimum" Not in JSON

`treaties.md`: Defensive Pact has "30 turns minimum" duration.
`relationship-formulas.md` JSON (12.3): Defensive Pact `"duration_min": 30` ✓ — this is consistent.

But `treaties.md` description says "Only triggers if attacked / Don't join offensive wars." This conditional triggering mechanic is not described anywhere in `relationship-formulas.md` or `council.md`. The distinction between Defensive Pact and Military Alliance triggers is stated in narrative but has no formula or algorithm.

---

### M12: Mice "Cybernetic Workers" Ability Is Ambiguous

`race-stats-complete.md` Mice special ability:
```json
"description": "Start with Robotic Controls III (+2 levels from base), population operates at enhanced efficiency",
"effect": {
    "type": "starting_robotic_controls_bonus",
    "value": 2,
    "production_per_pop_bonus": 2
}
```

`species/mice.md` says:
> **Automated Production**: Factories operate at 150% normal efficiency

The `race-stats-complete.md` describes this as "Robotic Controls III start bonus" (+2 production per worker) which is a different mechanic than "factories at 150%." These should produce similar results but via different mechanisms — one is a technology bonus, the other is a flat percentage. An implementation would have to choose one.

---

## 🟢 MINOR — Clarifications Needed

### m1: `council.md` — No Quorum Rule Undefined for Small Galaxies

`council.md` Section 3.2: `MIN_EFFECTIVE_VOTES = 50.0%`

In a 2-race galaxy where both are candidates, if one abstains (impossible by rule — candidates always vote for themselves), quorum can't fail. But in Section 7.1 ("Two-Race Galaxy"), the document says "if neither reaches 67%, no decision." With only 2 candidates and no third parties to abstain, the math guarantees one candidate gets exactly 50% and the other 50%, which is below 67% — resulting in perpetual no-decisions. This edge case effectively makes diplomatic victory impossible in a 2-race galaxy.

---

### m2: `espionage.md` — "Frame Another Race" Requires Undefined Tech

Section 6.6: Requirement is `"chameleon_or_advanced_espionage_tech"`. There is no "Advanced Espionage" technology defined anywhere in the documents reviewed. It's referenced but undefined.

---

### m3: `espionage.md` — Tech Level Table Doesn't Reach Level 15

Section 3.1 "Computer Tech Level" table goes from Tech Tier 1-14 → Level 1-55. But worked examples reference tech level 15 (Section 1.2 example: "Chameleon tech level 15, Hamster 12"). Tech level 15 falls between the tier 13-14 row (levels 48-55) which means level 15 should be tier 1-2 (levels 1-8). The mapping seems inverted or the example uses a different numbering system. This is confusing.

---

### m4: `ai-personalities.md` — "AI Difficulty Modifiers" Are Incomplete

The difficulty section (Easy/Normal/Hard/Impossible) describes qualitative behaviors but provides no numbers for:
- Production/research bonus for "Impossible" AI ("cheats")
- Forgiveness rate for "Easy" AI
- How "Hard" exploitation differs mechanically from "Normal"

`relationship-formulas.md` has `DifficultyMod` (0.75-1.25) for relationship calculations, but AI behavior modifiers on production/research are undefined.

---

### m5: `trade.md` — "Similar Government" Modifier Has No Defined Values

`treaties.md` mentions `Similar government: +10` and `Different government: -5` as relation modifiers. `trade.md` does not mention government types at all, and no document defines what government type each race has as a coded value. This modifier can't be implemented without a `government_type` field in race stats.

---

### m6: `relationship-formulas.md` — "Warmonger" Reputation Effect Missing From Formulas

`treaties.md` Reputation System says:
> **Warmonger**: -30 relations peaceful races, +10 with aggressive races

But `relationship-formulas.md` Section 7 defines only four reputation tracks (Honor, Peace, Fairness, Mercy) and their composite effect via `ReputationModifier`. The "Warmonger" label being applied differently to peaceful vs. aggressive races (a split effect) is not captured in the scalar `(Honor + Peace + Fairness + Mercy) / 400` formula. The directional relationship effect based on the *target's* personality is not implemented.

---

### m7: `espionage.md` — Spy Hunt Doesn't Specify Which Empire's Spy Is Found

Section 8.2:
> On success, one enemy spy is identified and can be executed/expelled/turned

If multiple empires have active spies, which empire's spy is caught? Is it random, or the most recent spy, or the one with the lowest concealment? No selection algorithm is provided.

---

### m8: `council.md` — "Refused Mandate" Penalty Duration Conflict

Section 6.5: "Cannot win Council for next 50 turns"
Section 9 constants: `"MANDATE_COOLDOWN": 50` ✓
Section 10.3 (reputation penalties JSON):
```json
{
    "id": "refused_mandate",
    "penalty": -15,
    "duration_turns": 50,
    "special": "Cannot win council"
}
```
The penalty is listed as -15 in the JSON but the text in Section 6.5 says the only consequence is the 50-turn cooldown. No -15 penalty is mentioned in the narrative. Either the JSON has an extra field not described in the design, or the narrative is missing it.

---

### m9: Species Files — Chameleons List `"spy_cost_modifier": 0.50` But Text Says "50% Less"

`espionage.md` Section 13.2 JSON: `"spy_cost_modifier": 0.50`

This is ambiguous — does 0.50 mean "costs 50% of normal" (correct, half price) or "modifier of 0.50 applied as reduction" (also half price)? The text says "50% less," which means 0.50× the cost, so the JSON value is correct — but the field name `spy_cost_modifier` should be documented as a multiplier (not an additive reduction) to avoid implementation error.

---

### m10: `ai-personalities.md` — Hermit Crabs AI Says "Can ignore them safely" but Council Behavior Makes Them a Wildcard

`ai-personalities.md`: "Player Strategy vs Hermit Crabs: Can ignore them safely"

`council.md`: Hermit Crabs have a 25% random abstention chance and `abstain_tendency: "high"`. With a high vote weight (they colonize everywhere), their abstention swings Council outcomes significantly. A player who ignores Hermit Crabs loses a potentially decisive vote bloc. The player strategy advice in `ai-personalities.md` contradicts the Council mechanics in `council.md`.

---

## Appendix: Cross-Reference Checklist

| Check | Status |
|-------|--------|
| AI behaviors referenced but not defined | ⚠️ Production allocation, expansion logic, spy target selection missing (H4) |
| Relationship modifiers that don't add up | ⚠️ Ants diplomacy (M8), NAP break penalty (M1) — Hamster trade bonus (C1) ✅ resolved |
| Species traits conflicting with diplomacy rules | ⚠️ Guinea Pig honor vs reliability (M6), Rabbit "never betray" vs 0.85 (M5), Hermit Crabs food (M7) |
| Espionage mechanics without success/failure rates | ✅ Mostly complete — gaps in frame detection timing (H6), Spy Hunt target selection (m7) |
| Council voting rules incomplete | ⚠️ 2-race no-decision loop (m1), Refused Mandate penalty value (m8) |
| Trade formulas with undefined variables | ⚠️ Production definition, distance measurement, trade route requirement (H1) |
| Treaty effects not fully specified | ⚠️ Research bonus missing from formula doc (M10), Defensive Pact trigger (M11), government type (H5/m5) |
| Missing AI decision trees or priorities | ⚠️ Production/expansion/tech priorities undefined (H4), difficulty modifiers incomplete (m4) |

---

*Report generated: 2026-04-12*
*Last updated: 2026-04-12 (v2)*
*Issue counts: 6 Critical (✅ all resolved), 8 High, 12 Medium, 10 Minor — 36 total (6 resolved)*
