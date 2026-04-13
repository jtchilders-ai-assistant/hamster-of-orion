# FINAL_REVIEW_SPECIES.md — MOO1 Reference Comparison

**Reviewer:** Wesley (subagent)  
**Date:** 2026-04-12  
**Reference Source:** StrategyWiki Master of Orion Guide (Best Races, Average Races, Worst Races, Racial Personalities pages)  
**Design Files Reviewed:** `race-stats-complete.md` + all 10 individual species files  

> **Note on reference file:** The local `reference/strategywiki-moo1.txt` contains only a Table of Contents — no race stat data. MOO1 race data used here was fetched directly from StrategyWiki. This review supersedes the earlier `species/REVIEW_SPECIES.md` (which focused on internal consistency) and adds the MOO1 fidelity layer.

---

## MOO1 Canonical Race Data (Reference Baseline)

Extracted from StrategyWiki:

| MOO1 Race | Production | Research Bonus | Special Trait | AI Personality | AI Strategy |
|-----------|-----------|----------------|---------------|----------------|-------------|
| Psilons | — | +75% ALL fields | Multiple tech choices | Pacifistic | Technologist |
| Klackons | Pop labor ×2 | — | No unrest | Xenophobic | Industrialist |
| Humans | — | +40% Force Fields, +20% Propulsion, +20% Planetology | Trade +25%, Relaxed relations | Honorable | Diplomat |
| Silicoids | — | +20% Computers, -20% all others | Colonize any planet, no pollution, no terraforming | Xenophobic | Expansionist |
| Meklar | +2 RC levels above base | +40% Computers | No refit costs | Erratic | Industrialist |
| Sakkra | — | +40% Planetology | 2× population growth rate | Aggressive | Expansionist |
| Alkari | — | +40% Propulsion | +3 dodge/defense all ships | Honorable | Militarist |
| Darloks | — | +20% Computers | +30 flat spy bonus | Aggressive | Diplomat |
| Bulrathi | — | +20% Weapons, +20% Construction | +25 ground combat rolls | Aggressive | Ecologist |
| Mrrshan | — | — | +4 Attack Levels (hit chance only) | Ruthless | Militarist |

---

## Race-by-Race Comparison

---

### 🐹 Hamsters → MOO1 Humans

**MOO1 canonical:** Honorable Diplomat. +40% Force Fields, +20% Propulsion, +20% Planetology research. Trade curve shifted +25% (start at -5% loss instead of -30%, peak at 125%). Every race starts at "Relaxed" toward Humans. Alternate personalities: Pacifistic, Aggressive; Industrialist, Technologist.

**HoO design:**

| Attribute | MOO1 Humans | HoO Hamsters | Status |
|-----------|-------------|--------------|--------|
| Force Fields bonus | +40% | +40% | ✅ Matches |
| Propulsion bonus | +20% | +20% | ✅ Matches |
| Planetology bonus | +20% | +20% | ✅ Matches |
| Trade advantage | +25% curve shift | +25% trade bonus | ✅ Matches (Trade Hub ability) |
| Starting relations | All races "Relaxed" | All start Neutral (Universal Diplomat) | ✅ Equivalent |
| AI personality | Honorable Diplomat | `archetype: diplomat`, aggression 0.1, treaty_reliability 0.95 | ✅ Matches |
| Council votes | Not in MOO1 | +1 council vote (Council Favorite) | 🔵 New ability — intentional, thematic |
| Adaptive colonization | Not in MOO1 | -25% hostility penalty reduction | 🔵 New ability — intentional expansion |

**Intentional deviations:**
- `Council Favorite` (+1 council vote) — original addition enhancing the diplomatic theme
- `Adaptive` (colonization penalty reduction) — not a MOO1 Human trait, adds flexibility

**Issues:** None. This is the cleanest MOO1 mapping in the design.

---

### 🐜 Ants → MOO1 Klackons

**MOO1 canonical:** Xenophobic Industrialist. Production advantage = manual labor output doubled (pop contributes 1 BC instead of 0.5 BC). No research bonuses. Start with no unrest. Alternate personalities: Aggressive, Erratic; Ecologist, Expansionist.

**HoO design:**

| Attribute | MOO1 Klackons | HoO Ants | Status |
|-----------|---------------|----------|--------|
| Production bonus | Pop labor ×2 (effectively +100% manual labor) | +50% overall production | ⚠️ Discrepancy — see below |
| Research bonus | None | -10% research | ✅ Matches spirit (slightly penalized) |
| No unrest | Yes (Xenophobic unity) | Yes (Perfect Efficiency) | ✅ Matches |
| Espionage | No special trait | Fully isolated (cannot spy / immune) | 🟡 Intentional deviation — documented |
| AI personality | Xenophobic Industrialist | `aggression: 0.6`, expansionist archetype | ⚠️ Mismatch — see below |
| Espionage immunity | No | Yes (Hive Mind) | 🟡 Intentional deviation |
| Growth | Normal | +25% | 🟡 Small addition not in MOO1 |

**⚠️ Production value discrepancy:**  
MOO1 Klackons double manual labor output (pop unit produces 1.0 BC instead of 0.5 BC). This is approximately a +100% bonus to the *population labor component only*, not +50% to total production. At game start with 50 pop and 30 factories (55 total BC), Klackons produce 80 BC — a ~45% total production advantage. The HoO design uses +50% to all production (including factories), which is actually *more* generous than MOO1 Klackons for a factory-heavy economy. **This is likely an intentional simplification**, but worth documenting: Ants are potentially stronger than MOO1 Klackons in factory-heavy mid/late game.

**⚠️ AI personality mismatch:**  
MOO1 Klackons = Xenophobic Industrialist. HoO Ants `archetype: expansionist` with `aggression: 0.6`. Klackons are Xenophobic (hates everyone, but doesn't necessarily rush to attack) with Industrialist strategy (builds factories, not fleets). The HoO version is more aggressive and more expansionist than the MOO1 source. This may be intentional (pet-themed hive army feel), but it's a meaningful deviation from the Klackon strategic identity.

**Intentional deviations:**
- Two-way espionage isolation (fully documented in design as deliberate hive-mind flavor)
- Growth bonus (+25%) not present in MOO1
- Expendable Units (10% military cost reduction) not in MOO1

**Missing MOO1 mechanics:**  
- Klackons had no special food bonuses. HoO gives Ants +20% food — unexplained deviation.

---

### 🐭 Mice → MOO1 Meklar

**MOO1 canonical:** Erratic Industrialist. +2 Robotic Controls levels above whatever RC level is researched. No refit costs. +40% Computers research (expert — the only race with this). Poor at Planetology (-20%). Alternate personalities: Ruthless, Honorable; Militarist, Diplomat.

**HoO design:**

| Attribute | MOO1 Meklar | HoO Mice | Status |
|-----------|-------------|----------|--------|
| RC bonus | +2 levels above researched | +2 RC levels (Cybernetic Workers) | ✅ Matches |
| Computers research | +40% (expert) | +15% research (general) | ⚠️ Discrepancy — see below |
| No refit costs | Yes | Not implemented | 🔴 Missing MOO1 mechanic |
| Planetology penalty | -20% | Not present | ⚠️ Missing penalty |
| AI personality | Erratic Industrialist | `archetype: researcher`, treaty_reliability 0.85 | ⚠️ Mismatch |
| Food penalty | Not in MOO1 | -50% food | 🟡 Original addition |
| Growth penalty | Not in MOO1 | -25% growth | 🟡 Original addition |

**🔴 Missing: No refit costs**  
MOO1 Meklars never pay refit costs (upgrading ship components when new tech is researched). This is a significant economic advantage not present in HoO. Should be implemented as `no_refit_costs: true` or equivalent.

**⚠️ Computers research bonus understated:**  
MOO1 Meklars get +40% Computers (expert-level, same as Sakkra in Planetology, Alkari in Propulsion, etc.). HoO Mice get only +15% general research — not field-specific. Mice should have a specific `research_field_bonuses.computers: 40` to match MOO1 Meklar. The current +15% general is weaker and less distinctive than the MOO1 source.

**⚠️ AI personality mismatch:**  
MOO1 Meklar = Erratic Industrialist. HoO Mice = researcher archetype with stable treaty reliability (0.85). Erratic is a meaningful AI trait — unpredictable behavior, shifting priorities. HoO Mice are stable researchers, which is more like Psilons (Pacifistic Technologist). Consider adding erratic behavior variance to the AI parameters.

**Intentional deviations:**
- -50% food (thematic cybernetic race, doesn't farm)
- -25% growth (cybernetic beings reproduce slowly)
- +50% factory efficiency (Automated Production) — stronger than MOO1 baseline
- +25% production (vs Meklar's pure RC bonus) — additive bonus not in MOO1

**Missing MOO1 mechanics:**
1. No refit costs (not implemented) — **significant omission**
2. Computers field-specific +40% bonus (understated as generic +15%)
3. Planetology penalty (-20%) not carried over

---

### 🐀 Rats → MOO1 Psilons

**MOO1 canonical:** Pacifistic Technologist. +75% research ALL fields. Always gets more tech choices than other races (effectively sees more options per field). Alternate personalities: Honorable, Xenophobic; Industrialist, Expansionist.

**HoO design:**

| Attribute | MOO1 Psilons | HoO Rats | Status |
|-----------|-------------|----------|--------|
| Research bonus | +75% ALL fields | +75% ALL fields | ✅ Matches |
| Multiple tech choices | Yes (more options per field) | Yes (minimum 3, Academic Network) | ✅ Matches |
| AI personality | Pacifistic Technologist | aggression 0.2, research_focus 1.0 | ✅ Matches |
| Production penalty | Not specified in MOO1 | -10% production | 🟡 Minor addition |
| Ground combat penalty | Not specified | -20% ground | 🟡 Thematic addition |
| Ship combat bonus | Not specified | +10% ship combat | ⚠️ Unexplained addition |
| Espionage | No bonus | 0 espionage | ✅ Matches |

**✅ Best-matched race in the design.**  
Rats vs Psilons is the cleanest mapping. The +75% ALL fields is correct (confirmed updated from earlier incorrect +50%). The Academic Network ability correctly captures the "more tech choices" mechanic.

**🟡 Small additions worth flagging:**  
- +10% ship combat for Rats has no MOO1 basis. Psilons had no combat advantage. This is a small but unexplained deviation.
- "Eureka Moments" (5% free tech per turn) and "Quick Study" (instant reverse engineering) are original additions with no MOO1 equivalent. These are thematic embellishments, not bugs, but inflate Rats beyond already-powerful Psilons.
- "Scientific Method" (immune to Chameleon false intel) is an original cross-race interaction with no MOO1 basis.

**Intentional deviations:**
- All special abilities beyond Academic Network are original design additions
- Small combat bonuses/penalties added for flavor

---

### 🐇 Rabbits → MOO1 Sakkra

**MOO1 canonical:** Aggressive Expansionist. 2× population growth rate. +40% Planetology (expert). Alternate personalities: Erratic, Pacifistic; Ecologist, Industrialist.

**HoO design:**

| Attribute | MOO1 Sakkra | HoO Rabbits | Status |
|-----------|-------------|-------------|--------|
| Growth rate | ×2 (doubled) | +100% growth (×2 equivalent) | ✅ Matches |
| Planetology bonus | +40% (expert) | Not present | 🔴 Missing MOO1 mechanic |
| AI personality | Aggressive Expansionist | aggression 0.2, expansion 1.0 | ⚠️ Partial mismatch |

**🔴 Missing: Planetology expert bonus**  
MOO1 Sakkra are the galaxy's Planetology experts (+40%). This gives them better terraforming, soil enrichment access, and higher max population per planet. HoO Rabbits have no research field bonus. This is a significant omission — the Sakkra's Planetology expertise is how they turned population growth into technological advantage (better planets → more people → more growth). Without it, Rabbits grow fast but into smaller/worse planets.

**⚠️ AI personality mismatch:**  
MOO1 Sakkra = Aggressive Expansionist. HoO Rabbits = aggression 0.2 (very low), expansion 1.0. The expansion drive is correct, but Sakkra were notably aggressive — they would attack border disputes over newly settled lands. HoO Rabbits are nearly pacifist, which contradicts the MOO1 source. Suggest raising aggression to at least 0.5.

**Intentional deviations:**
- Rapid Colonization (50% reduced setup time) — not in MOO1
- Overflow Population (instant pop transfer) — not in MOO1
- Democratic Resilience (50% less rebellion) — not in MOO1
- Swarm Tactics (15% ship cost reduction) — not in MOO1
- Starting tech: `colony_ship` — Sakkra had no special starting ship advantage in MOO1

**Missing MOO1 mechanics:**
1. Planetology +40% research bonus — **significant omission**
2. Aggressive AI temperament not reflected in current parameters

---

### 🦀 Hermit Crabs → MOO1 Silicoids

**MOO1 canonical:** Xenophobic Expansionist. Colonize any planet without terraforming research. Zero pollution impact (no production loss). Cannot use terraforming technologies (Atmospheric Terraforming, Soil Enrichment, Advanced Soil Enrichment). Half population growth rate on all planets (treat all worlds as hostile). +20% Computers, -20% all other fields. Alternate personalities: Erratic, Honorable; Technologist, Militarist.

**HoO design:**

| Attribute | MOO1 Silicoids | HoO Hermit Crabs | Status |
|-----------|----------------|-----------------|--------|
| Universal colonization | Yes (no research needed) | Yes (Universal Adaptation) | ✅ Matches |
| No pollution impact | Yes | Not implemented | 🔴 Missing MOO1 mechanic |
| Cannot terraform | Yes (hard restriction) | Not present | 🔴 Missing MOO1 mechanic |
| Growth penalty | ×0.5 (half rate) | -50% growth | ✅ Matches |
| Computers research | +20% | Not present | ⚠️ Missing research bonus |
| Other fields | -20% each | Not present | 🟡 Missing research penalties |
| AI personality | Xenophobic Expansionist | aggression 0.0, expansion 0.7 | ⚠️ Mismatch |
| No food requirement | Not in MOO1 | Yes (No Food Requirement) | 🟡 Intentional deviation |

**🔴 Missing: No pollution cost**  
MOO1 Silicoids never spend production on ecological restoration. This is their primary economic advantage early game (other races waste 40% of production on pollution control). HoO Hermit Crabs have no equivalent mechanic. This is the *defining* Silicoid trait and its absence is a significant gap.

**🔴 Missing: Cannot terraform**  
Silicoids cannot use Atmospheric Terraforming, Soil Enrichment, or Advanced Soil Enrichment. This is the balancing Faustian bargain — they colonize everywhere but can't improve what they colonize. HoO Hermit Crabs have no such restriction, making them strictly better than MOO1 Silicoids (universal colonization *plus* can terraform).

**⚠️ Missing research modifiers:**  
Silicoids have +20% Computers and -20% all other fields. HoO Hermit Crabs have no research modifiers. This means they lack Silicoids' spying advantage and also aren't penalized in non-Computers tech.

**⚠️ AI personality mismatch:**  
MOO1 Silicoids = Xenophobic Expansionist. HoO Hermit Crabs = aggression 0.0 (never attacks), treaty_reliability 1.0. Silicoids were Xenophobic (distrustful, halved positive diplomacy effects) and Expansionist (aggressive about territory). HoO Hermit Crabs are effectively the most peaceful race in the design — completely opposite of Xenophobic.

**Intentional deviations:**
- No Food Requirement — original mechanic, not in MOO1 (Silicoids ate normally)
- Armored Shell (+50% ground defense) — not in MOO1
- Patient (immune to morale penalties) — not in MOO1
- Mineral Consumption (asteroid mining) — not in MOO1

**Missing MOO1 mechanics:**
1. No pollution production cost — **critical omission** (Silicoids' main early-game edge)
2. Cannot terraform — **critical restriction** missing (removes Silicoid's main weakness)
3. Computers +20% / all others -20% — research modifiers absent

---

### 🐹 Guinea Pigs → MOO1 Bulrathi

**MOO1 canonical:** Aggressive Ecologist. +25 ground combat rolls (flat, not percentage). Good at Weapons (+20%) and Construction (+20%). Poor at Computers (-20%). Alternate personalities: Honorable, Erratic; Militarist, Industrialist.

**HoO design:**

| Attribute | MOO1 Bulrathi | HoO Guinea Pigs | Status |
|-----------|---------------|-----------------|--------|
| Ground combat | +25 flat rolls | +50% bonus | 🟡 Different scale — see below |
| Weapons research | +20% | Not present | ⚠️ Missing research bonus |
| Construction research | +20% | Not present | ⚠️ Missing research bonus |
| Computers research | -20% (poor) | Not present (overall -20% research) | 🟡 Approximate match |
| AI personality | Aggressive Ecologist | aggression 0.9, archetype: aggressive | ✅ Matches aggression |
| AI strategy | Ecologist | production_focus 0.7, research_focus 0.2 | ⚠️ Ecologist focus missing |

**🟡 Ground combat metric translation:**  
MOO1 uses flat roll bonuses (+25 to die rolls). HoO uses percentage modifiers (+50%). These aren't directly comparable — the MOO1 "+25 rolls" means Bulrathi troops kill 4-5 enemies per own casualty. The HoO +50% is in the right ballpark as a gameplay translation. Not a bug, but the source mechanic is a flat bonus, not a multiplier.

**⚠️ Missing research modifiers:**  
Bulrathi are good at Weapons (+20%) and Construction (+20%). These are relevant for ground combat tech (better infantry equipment) and ship armor — thematically fitting. HoO Guinea Pigs have neither. The general -20% research approximates the Computers penalty but misses the targeted bonuses.

**⚠️ AI Ecologist strategy missing:**  
MOO1 Bulrathi = Ecologist (emphasize environment improvement, terraforming, planetology). HoO Guinea Pigs have research_focus 0.2 and no ecological priority. The Ecologist strategic identity is absent from the AI parameters.

**Intentional deviations:**
- Heavy Worlders (high-gravity colonization) — not in MOO1
- Fearless (battle morale immunity) — not in MOO1
- Relentless (50% faster conquest integration) — not in MOO1

**Missing MOO1 mechanics:**
1. Weapons +20% research bonus
2. Construction +20% research bonus
3. AI Ecologist strategic emphasis

---

### 🦡 Ferrets → MOO1 Mrrshan

**MOO1 canonical:** Ruthless Militarist. +4 Attack Levels (hit chance only — no damage bonus). Worst diplomatic relations in the game (blood enemies with many races, will attack almost anyone). Alternate personalities: Pacifistic, Xenophobic; Ecologist, Technologist.

**HoO design:**

| Attribute | MOO1 Mrrshan | HoO Ferrets | Status |
|-----------|-------------|-------------|--------|
| Attack bonus | +4 Attack Levels (hit chance only) | +4 Attack Levels (hit chance only) | ✅ Matches (confirmed fixed) |
| Diplomatic relations | Worst in game, blood enemies | -10% diplomacy, natural enemies: rabbits, chameleons | ⚠️ Understated — see below |
| AI personality | Ruthless Militarist | aggression 0.7, declares_war_first: true | ✅ Approximately matches |
| Research | No bonuses or penalties | +10% general research | 🟡 Small unexplained bonus |

**⚠️ Diplomatic penalty understated:**  
MOO1 Mrrshan have the absolute worst diplomatic relations in the game. They are blood enemies with enough races that war is almost guaranteed early. HoO Ferrets have only -10% diplomacy, which is the same as Mice. The StrategyWiki description makes clear this diplomatic catastrophe is Mrrshan's *defining weakness* — it's why they're the worst race despite having a good combat ability. HoO Ferrets feel like a balanced combat race, not the diplomatically isolated hot mess MOO1 Mrrshan are. Consider adding more severe diplomatic penalties or a "blood enemy" mechanic.

**✅ Attack bonus correctly implemented:**  
The earlier fix (no damage bonus, only +4 Attack Levels) is verified correct per MOO1 canonical data.

**Intentional deviations:**
- First Strike (always fires first) — not in MOO1 Mrrshan
- Hunter's Instinct (cloak detection) — not in MOO1
- Efficient Killers (10% ship cost reduction) — not in MOO1
- +10% research — unexplained bonus with no MOO1 basis

**Missing MOO1 mechanics:**
1. Severity of diplomatic isolation not captured — Mrrshan's relational penalties are much worse than -10%

---

### 🐦 Budgies → MOO1 Alkari

**MOO1 canonical:** Honorable Militarist. +3 dodge/defense bonus for all ships. Expert at Propulsion (+40%). Alternate personalities: Ruthless, Aggressive; Diplomat, Ecologist.

**HoO design:**

| Attribute | MOO1 Alkari | HoO Budgies | Status |
|-----------|-------------|-------------|--------|
| Ship defense bonus | +3 dodge all ships | +3 Defense Level + +3 Initiative + +20% evasion | ✅ Matches (and expanded) |
| Propulsion research | +40% (expert) | +1 movement range (propulsion_bonus) | ⚠️ Partial — see below |
| AI personality | Honorable Militarist | aggression 0.6, declares_war_first: true | ⚠️ Mismatch — see below |
| Treaty reliability | High (Honorable) | 0.85 | ✅ Approximately matches |

**⚠️ Propulsion research bonus not implemented:**  
MOO1 Alkari have +40% Propulsion research — they're the field expert, same as Meklar/Computers, Sakkra/Planetology, etc. HoO Budgies have a +1 movement range bonus (propulsion_bonus field) but no `research_field_bonuses.propulsion: 40`. Movement range is a nice thematic touch but misses the research speed advantage that makes Alkari reach distant planets and better engines faster than other races.

**⚠️ AI personality mismatch:**  
MOO1 Alkari = Honorable Militarist. "Honorable" means they won't attack those they're on good terms with, react strongly to unprovoked attacks and sabotage. HoO Budgies have `declares_war_first: true` and aggression 0.6, which is more Aggressive than Honorable. An Honorable race should have `declares_war_first: false` and high treaty reliability. The current parameterization puts Budgies closer to Guinea Pigs or Ferrets in behavior.

**✅ Defense bonus well-implemented:**  
The +3 Defense Level + +3 Initiative + evasion expansion is an intentional (and appropriate) enhancement of the MOO1 dodge bonus.

**Intentional deviations:**
- Superior Pilots expanded beyond pure dodge bonus
- Three-Dimensional Tactics (missile accuracy reduction) — thematic addition
- Dogfighter (small ship bonus) — original
- Flight School (veteran crew) — original

**Missing MOO1 mechanics:**
1. Propulsion +40% research field bonus (not just movement range)
2. AI should be Honorable (not aggressive) — `declares_war_first` should be false

---

### 🦎 Chameleons → MOO1 Darloks

**MOO1 canonical:** Aggressive Diplomat. +20% Computers research (good, not expert). +30 flat bonus to spying rolls. Second-worst relations in the game ("Unease" with everyone except Humans). Alternate personalities: Ruthless, Xenophobic; Ecologist, Militarist.

**HoO design:**

| Attribute | MOO1 Darloks | HoO Chameleons | Status |
|-----------|-------------|----------------|--------|
| Spy roll bonus | +30 flat | +30 flat (spy_roll_bonus: 30) | ✅ Matches |
| Computers research | +20% (good) | +20% Computers | ✅ Matches |
| Diplomatic relations | "Unease" with all (2nd worst) | -15% diplomacy + Unease note | ✅ Matches |
| AI personality | Aggressive Diplomat | aggression 0.3, treaty_reliability 0.2 | ✅ Approximately matches |
| Espionage cost/success | Not a MOO1 stat | 50% cheaper, 25% more success | 🟡 Enhancement |

**✅ Best MOO1-aligned secondary race.**  
The Chameleons implementation closely mirrors MOO1 Darloks. Key values (+30 spy bonus, +20% Computers, Unease relations, Aggressive Diplomat AI) all match. This was the most carefully cross-referenced race in the v1.1 update.

**🟡 Minor notes:**
- `treaty_reliability: 0.2` correctly captures Darlok untrustworthiness
- The 50% espionage cost reduction and Master Spies success bonus are HoO additions, not MOO1 mechanics, but are thematically coherent
- Technology Theft (+50% easier) is original — Darloks in MOO1 used the standard spy system
- False Flags, Sleeper Agents, Perfect Mimicry are all original HoO additions

**Intentional deviations:**
- Master Spies (cost reduction + success bonus) — enhancement
- Infiltrators (full intel visibility) — not in MOO1
- False Flags (frame ability) — not in MOO1
- Sleeper Agents — not in MOO1
- Starting `cloaking_device` — Darloks had no cloaking advantage in MOO1

---

## Cross-Race: Missing MOO1 "Expert" Research System

**This is the most systematic gap in the design.**

MOO1 has a clear pattern: **each race is an "expert" in exactly one research field** (+40% bonus for that field) and optionally "good" (+20%) or "poor" (-20%) in others. Only Psilons break the pattern by being expert in ALL fields.

| MOO1 Race | Expert Field (+40%) | Good Fields (+20%) | Poor Fields (-20%) |
|-----------|--------------------|--------------------|-------------------|
| Humans | Force Fields | Propulsion, Planetology | — |
| Klackons | — | — | — |
| Psilons | ALL (+75%) | — | — |
| Silicoids | Computers | — | all others |
| Meklar | Computers | — | Planetology |
| Sakkra | Planetology | — | — |
| Alkari | Propulsion | — | — |
| Darloks | — | Computers | — |
| Bulrathi | — | Weapons, Construction | Computers |
| Mrrshan | — | — | — |

**HoO implementation of research field bonuses:**

| HoO Race | Implemented Field Bonuses | MOO1 Field Bonuses | Status |
|----------|--------------------------|-------------------|--------|
| Hamsters | +40% Force Fields, +20% Propulsion, +20% Planetology | ✅ Correct | ✅ |
| Ants | None | None | ✅ |
| Mice | No field bonus (generic +15% all) | +40% Computers | 🔴 Missing |
| Rats | None explicitly (generic +75% all) | +75% all | ✅ Effectively correct |
| Rabbits | None | +40% Planetology | 🔴 Missing |
| Hermit Crabs | None | +20% Computers, -20% others | 🔴 Missing |
| Guinea Pigs | None | +20% Weapons, +20% Construction, -20% Computers | 🔴 Missing |
| Ferrets | None | None | ✅ |
| Budgies | propulsion_bonus (movement only) | +40% Propulsion | 🔴 Missing (incomplete) |
| Chameleons | +20% Computers | +20% Computers | ✅ |

**5 races are missing their MOO1 research field bonuses/penalties.**

---

## Cross-Race: AI Personality Comparison

MOO1 personality system has 6 personality types × 6 strategy types. HoO uses a numeric system. Here's the mapping accuracy:

| HoO Race | MOO1 Personality | HoO Archetype | Match Quality |
|----------|-----------------|---------------|---------------|
| Hamsters | Honorable Diplomat | diplomat, aggression 0.1 | ✅ Good |
| Ants | Xenophobic Industrialist | expansionist, aggression 0.6 | ⚠️ Off — too aggressive, wrong strategy |
| Mice | Erratic Industrialist | researcher, reliable 0.85 | ⚠️ Off — too stable, wrong strategy |
| Rats | Pacifistic Technologist | researcher, aggression 0.2 | ✅ Good |
| Rabbits | Aggressive Expansionist | expansionist, aggression 0.2 | ⚠️ Expansion right, aggression wrong |
| Hermit Crabs | Xenophobic Expansionist | defensive, aggression 0.0 | ⚠️ Off — never attacks, not Xenophobic |
| Guinea Pigs | Aggressive Ecologist | aggressive, aggression 0.9 | ✅ Aggression right, Ecologist missing |
| Ferrets | Ruthless Militarist | aggressive, aggression 0.7 | ✅ Close (could be higher) |
| Budgies | Honorable Militarist | aggressive, declares_war_first: true | ⚠️ Honorable contradicts aggressive flags |
| Chameleons | Aggressive Diplomat | sneaky, aggression 0.3 | ✅ Good |

---

## Summary: Intentional Deviations vs. Unintentional Discrepancies

### ✅ Confirmed Intentional (Pet Theme / Design Additions)

These are original HoO additions documented in the design that have no MOO1 equivalent. They're features, not bugs:

- **All races:** Pet-themed names, homeworlds, flavor text
- **Ants:** Two-way espionage isolation (hive mind theme) — deliberately deviates from MOO1 Klackons
- **Ants:** +20% food bonus (industrious foragers)
- **Ants:** Overpopulation (can support 25% more pop/planet)
- **Hamsters:** Council Favorite (+1 vote), Adaptive colonization
- **Mice:** Automated Production (50% factory efficiency), food/growth penalties
- **Rats:** Eureka Moments, Quick Study, Scientific Method
- **Rabbits:** Rapid Colonization, Overflow Population, Democratic Resilience, Swarm Tactics
- **Hermit Crabs:** No Food Requirement, Armored Shell, Patient, Mineral Consumption
- **Guinea Pigs:** Heavy Worlders, Fearless, Relentless
- **Ferrets:** First Strike, Hunter's Instinct, Efficient Killers
- **Budgies:** Three-Dimensional Tactics, Dogfighter, Flight School, +1 movement range
- **Chameleons:** Master Spies, Infiltrators, False Flags, Sleeper Agents

### 🔴 Unintentional Discrepancies — Should Fix

| # | Race | Issue | Fix |
|---|------|-------|-----|
| 1 | Mice | Missing `research_field_bonuses.computers: 40` | Add field-specific bonus to match Meklar |
| 2 | Mice | Missing `no_refit_costs: true` | Implement no-refit-cost ability |
| 3 | Mice | AI should be Erratic (not stable researcher) | Lower `treaty_reliability`, add variance |
| 4 | Mice | Missing Planetology -20% penalty | Add to research_field_bonuses |
| 5 | Rabbits | Missing `research_field_bonuses.planetology: 40` | Add field-specific Planetology bonus |
| 6 | Rabbits | AI aggression too low (0.2) for Aggressive Expansionist | Raise to ~0.5 |
| 7 | Hermit Crabs | No pollution mechanic | Implement `no_pollution_cost: true` |
| 8 | Hermit Crabs | No terraforming restriction | Implement `cannot_terraform: true` |
| 9 | Hermit Crabs | Missing Computers +20% | Add to research_field_bonuses |
| 10 | Hermit Crabs | Missing -20% other fields | Add research penalties |
| 11 | Hermit Crabs | AI is pacifist, should be Xenophobic | Raise diplomatic distrust, lower positive diplomacy scaling |
| 12 | Guinea Pigs | Missing Weapons +20% research | Add to research_field_bonuses |
| 13 | Guinea Pigs | Missing Construction +20% research | Add to research_field_bonuses |
| 14 | Ferrets | Diplomatic penalties too mild (only -10%) | Add blood enemy relationships or harsher diplomatic baseline |
| 15 | Budgies | Missing Propulsion +40% research | Add `research_field_bonuses.propulsion: 40` |
| 16 | Budgies | `declares_war_first: true` wrong for Honorable race | Change to `false`, lower aggression to ~0.3 |
| 17 | Ants | AI archetype should be Industrialist, not Expansionist | Update strategy focus to production/factory-building |

### 🟡 Deferred Design Decisions (Not Bugs, But Need Attention)

| # | Issue | Notes |
|---|-------|-------|
| 1 | Ants: +50% production vs. MOO1 Klackon ×2 pop labor | HoO design is simpler but potentially stronger late-game. Intentional simplification, but balance review needed. |
| 2 | Ferrets: +10% research has no MOO1 basis | Small unexplained bonus. Consider removing or converting to `good_at: weapons` (+20% weapons research) to better mirror Mrrshan's militarist nature. |
| 3 | Rats: +10% ship combat has no MOO1 basis | Psilons had no combat advantage. Consider removing. |
| 4 | Chameleons: Starting `cloaking_device` | Darloks had no cloaking in MOO1. Strong starting advantage for a spy race — balance question, not a bug. |
| 5 | Mice: AI personality Erratic vs current stable design | Erratic means unpredictable allies — hard to implement as pure numeric. May need a volatility flag. |

### 🔵 Missing MOO1 Global Mechanics (Not Race-Specific)

These MOO1 mechanics affect all races but aren't yet in the design:

1. **Pollution/Ecological Restoration system** — Hermit Crabs' defining advantage (no pollution) can't exist without a pollution mechanic. Currently unspecified in HoO design.
2. **Refit costs** — When tech improves, ships can be refitted. Meklar never pay this. The refit cost mechanic itself needs a design spec for Mice's `no_refit_costs` to be meaningful.
3. **Trade curve mechanics** — MOO1 trade has a specific ramp-up curve (starts at -30% loss, peaks at +100% profit over 25 turns). Hamsters shift this by +25%. HoO has a simpler +25% trade bonus. If implementing a proper trade system, the curve mechanic matters.
4. **Research field "expert" system** — The single-race expert per field system (MOO1's elegant balance mechanism) is partially implemented. Five races are missing their field bonuses/penalties.

---

## Priority Recommendations

**Implement immediately (game-breaking if missing):**
1. Hermit Crabs no-pollution mechanic (#7) — their core identity depends on it
2. Hermit Crabs cannot-terraform restriction (#8) — without it they're overpowered vs MOO1 Silicoids
3. Mice no-refit-costs (#2) — meaningful economic advantage missing entirely

**Implement before balance pass:**
4. Mice Computers +40% field bonus (#1)
5. Rabbits Planetology +40% field bonus (#5)
6. Budgies Propulsion +40% field bonus (#15)
7. Guinea Pigs Weapons +20% + Construction +20% bonuses (#12, #13)

**Fix AI parameters:**
8. Budgies `declares_war_first: false` (#16)
9. Rabbits aggression raised to ~0.5 (#6)
10. Hermit Crabs Xenophobic treatment (#11)

---

*Generated by Wesley (subagent) — 2026-04-12*  
*Reference data: StrategyWiki MOO1 guide (Best/Average/Worst/Personalities pages)*  
*Prior review (internal consistency): `design/species/REVIEW_SPECIES.md`*
