# Final Review: Technology Design vs MOO1 Reference

**Date:** 2026-04-13  
**Reviewer:** Wesley Crusher (subagent)  
**Reference Source:** StrategyWiki MOO1 tech pages (Weapons, Computers, Construction, Force Fields, Propulsion, Planetology)  
**Design Files Reviewed:** `design/technology/*.md`, `design/ships/weapons-complete.md`, `design/ships/components-complete.md`

---

## Executive Summary

The Hamster of Orion technology design is a deliberate adaptation of MOO1, not a direct port. The design generally mirrors MOO1's structure well but contains numerous **tech level mismatches**, several **missing MOO1 technologies**, and some **intentional divergences** that are not always clearly flagged. The most critical discrepancies are in Weapons (multiple level shifts), Propulsion (major engine level mismatches, missing techs), Force Fields (shield level assignments wrong in places), and Computers (minor level shifts). Planetology is a significant original expansion with little direct MOO1 mapping.

---

## Field-by-Field Analysis

---

### 1. WEAPONS

#### MOO1 Reference (StrategyWiki levels)

| MOO1 Level | Tech Name |
|------------|-----------|
| 1 | Lasers, Heavy Lasers, Nuclear Missile, Nuclear Bomb |
| 2 | Hand Lasers |
| 4 | Hyper-V Rockets |
| 5 | Gatling Lasers |
| 6 | Anti-Missile Rockets |
| 7 | Neutron Pellet Gun |
| 8 | Hyper-X Rockets |
| 9 | Fusion Bomb |
| 10 | Ion Cannon, Heavy Ion Cannon |
| 11 | Scatter Pack V |
| 12 | Ion Rifle |
| 13 | Mass Driver |
| 14 | Merculite Missiles |
| 15 | Neutron Blaster (Regular + Heavy) |
| 16 | Anti-Matter Bomb |
| 17 | Graviton Beam |
| 18 | Stinger Missiles |
| 19 | Hard Beam |
| 20 | Fusion Beam (+ Heavy Fusion Beam) |
| 21 | Ion Stream Projector |
| 22 | Omega Bomb |
| 23 | Anti-Matter Torpedoes |
| 24 | Fusion Rifle |
| 25 | Megabolt Cannon |
| 26 | Phasor (+ Heavy Phasor) |
| 27 | Scatter Pack VII |
| 28 | Auto Blaster |
| 29 | Pulson Missiles |
| 30 | Tachyon Beam |
| 31 | Hand Phasor |
| 32 | Gauss Autocannon |
| 33 | Particle Beam |
| 34 | Hercular Missiles |
| 35 | Plasma Cannon |
| 37 | Disruptor |
| 38 | Pulse Phasor |
| 39 | Neutronium Bomb |
| 40 | Hellfire Torpedoes |
| 41 | Zeon Missiles |
| 42 | Plasma Rifle |
| 43 | Proton Torpedoes |
| 44 | Scatter Pack X |
| 45 | Tri-Focus Plasma Cannon |
| 46 | Stellar Converter |
| 47 | Neutron Stream Projector |
| 48 | Mauler Device |
| 50 | Plasma Torpedoes |
| Guardian | Death Ray |

#### Design File vs MOO1: Tech Level Mismatches

| Tech | MOO1 Level | Design Level | Notes |
|------|------------|--------------|-------|
| Heavy Lasers | 1 | ❌ MISSING | Not in design at all |
| Hand Lasers | 2 | 5 | Off by 3 |
| Hyper-V Rockets | 4 | 4 | ✅ Match |
| Anti-Missile Rockets | 6 | ❌ MISSING | Not in weapons.md |
| Neutron Pellet Gun | 7 | 5 | Off by 2 |
| Hyper-X Rockets | 8 | 7 | Off by 1 |
| Fusion Bomb | 9 | 10 | Off by 1 |
| Scatter Pack V | 11 | 10 | Off by 1 |
| Ion Rifle / Gatling Laser Rifle | 12 | 12 | ✅ Match (renamed) |
| Mass Driver | 13 | 8 | Off by 5 — major mismatch |
| Merculite Missiles | 14 | 12 | Off by 2 |
| Neutron Blaster | 15 | 13 | Off by 2 |
| Anti-Matter Bomb | 16 | 20 | Off by 4 — significant |
| Graviton Beam | 17 | 15 | Off by 2 |
| Stinger Missiles | 18 | 15 | Off by 3 |
| Hard Beam | 19 | 18 | Off by 1 |
| Fusion Beam | 20 | 20 | ✅ Match |
| Ion Stream Projector | 21 | ❌ MISSING | Not in design |
| Omega Bomb | 22 | 30 ("Omega-V Bomb") | Off by 8 — very significant |
| Anti-Matter Torpedoes | 23 | 25 | Off by 2 |
| Fusion Rifle | 24 | 18 | Off by 6 |
| Megabolt Cannon | 25 | 25 | ✅ Match |
| Phasor | 26 | 27 | Off by 1 |
| Heavy Phasor | 26 (bundled) | 30 | Design splits into separate tier |
| Scatter Pack VII | 27 | 18 | Off by 9 — huge mismatch |
| Auto Blaster | 28 | 32 | Off by 4 |
| Pulson Missiles | 29 | 21 | Off by 8 |
| Tachyon Beam | 30 | 35 | Off by 5 |
| Hand Phasor | 31 | 27 | Off by 4 |
| Gauss Autocannon | 32 | 37 | Off by 5 |
| Particle Beam | 33 | 40 | Off by 7 |
| Hercular Missiles | 34 | 24 | Off by 10 |
| Plasma Cannon | 35 | 42 | Off by 7 |
| Disruptor | 37 | 47 | Off by 10 |
| Pulse Phasor | 38 | ❌ MISSING | Not in design (replaced by Auto-Blaster at 32?) |
| Neutronium Bomb | 39 | 43 | Off by 4 |
| Hellfire Torpedoes | 40 | 35 | Off by 5; design splits from MOO1 |
| Zeon Missiles | 41 | 30 | Off by 11 |
| Plasma Rifle | 42 | 38 | Off by 4 |
| Proton Torpedoes | 43 | 42 | Off by 1 |
| Scatter Pack X | 44 | 33 | Off by 11 |
| Tri-Focus Plasma Cannon | 45 | ❌ MISSING | Design has no equivalent |
| Stellar Converter | 46 | 55 | Off by 9; design moved to ultimate tier |
| Neutron Stream Projector | 47 | ❌ MISSING | Not in design |
| Mauler Device | 48 | 50 | Off by 2 |
| Plasma Torpedoes | 50 | 48 | Off by 2 |
| Death Ray | Guardian | 45 | **Design makes it researchable** — major intentional change (MOO1: Guardian-only) |

#### Missing MOO1 Weapons (Not In Design At All)

1. **Heavy Lasers** (MOO1 L1) — Heavy variant of laser with range 2, 1-7 damage
2. **Anti-Missile Rockets** (MOO1 L6) — Defensive missile interceptor (destroys 40% of incoming missiles); design covers this through ECM only
3. **Ion Stream Projector** (MOO1 L21) — HP-percent-based damage weapon; unique mechanic entirely absent
4. **Pulse Phasor** (MOO1 L38) — Fires Phasor 3× per turn; design has Auto-Blaster at L32 but no Pulse Phasor equivalent
5. **Tri-Focus Plasma Cannon** (MOO1 L45) — Heavy plasma variant; design's Plasma Cannon is at L42 but no Tri-Focus variant
6. **Neutron Stream Projector** (MOO1 L47) — Like Ion Stream but 40% HP damage; unique mechanic absent

#### Design Weapons Not In MOO1

1. **Hellfire Torpedo** (design L35) — MOO1's Hellfire Torpedoes at L40 deal 4×25 damage. Design's version at L35 deals 25+10 vs shields. Different mechanic and level.
2. **Heavy Fusion Beam** — MOO1 bundles this with Fusion Beam at L20. Design gives it its own tier 8 slot at L22.
3. **Oracle Interface** — Design places this in Computers; MOO1 has it in Computers at L46. ✅ Correct field but noted.
4. **Quantum Computer** — Design addition, not in MOO1.
5. **Technology Nullifier** — Design has it at L49; MOO1 has it at L49. ✅ Match.

#### Damage Value Discrepancies

| Weapon | MOO1 Damage | Design Damage | Match? |
|--------|-------------|---------------|--------|
| Laser | 1-4 | 1-4 | ✅ |
| Nuclear Missile | 4 | 4 | ✅ |
| Nuclear Bomb | 3-12 | 3-12 | ✅ |
| Hyper-V Rockets | 6 | 6 | ✅ |
| Gatling Lasers | 1-4 ×4 | 1-4 ×4 | ✅ |
| Neutron Pellet Gun | 2-5 | 2-5 | ✅ |
| Hyper-X Rockets | 8 | 8 | ✅ |
| Fusion Bomb | 5-20 | 5-20 | ✅ |
| Ion Cannon | 3-8 | 3-8 | ✅ |
| Scatter Pack V | 6×5 = 30 total | 5×5 | ❌ Design uses 5 damage/missile vs MOO1's 6 |
| Mass Driver | 5-8, halves shields | 5-8, ignores 50% shields | ~✅ (different wording, same effect) |
| Merculite Missiles | 10 | 10 | ✅ |
| Neutron Blaster | 3-12 (R) / 3-24 (H) | 3-12 | Design omits Heavy variant |
| Anti-Matter Bomb | 10-40 | 10-40 | ✅ |
| Graviton Beam | 1-15 | 1-15 | ✅ |
| Stinger Missiles | 15 | 15 | ✅ |
| Hard Beam | 8-12 | 8-12 | ✅ |
| Fusion Beam | 4-16 | 4-16 | ✅ |
| Heavy Fusion Beam | 4-30 (MOO1) | 8-24 (design) | ❌ MOO1: 4-30, Design: 8-24 |
| Omega/Omega-V Bomb | 20-50 (MOO1) | 15-60 (design) | ❌ Different range entirely |
| Anti-Matter Torpedoes | 30 | 30 | ✅ |
| Megabolt Cannon | 2-20 | 2-20 | ✅ |
| Phasor | 5-20 (R) / 5-40 (H) | 5-20 | Design omits Heavy variant separately |
| Heavy Phasor | — (bundled) | 10-40 | Design splits out; damage differs from MOO1 Heavy (5-40) |
| Scatter Pack VII | 10×7 = 70 total | 7×5 | ❌ Design uses 5 MIRV, MOO1 uses 7; damage/missile also differs |
| Auto Blaster | 4-16 ×3 | 4-16 ×3 | ✅ |
| Pulson Missiles | 20 | 20 | ✅ |
| Tachyon Beam | 1-25 | 1-25 | ✅ |
| Gauss Autocannon | 7-10 ×4 | 7-10 ×4 | ✅ |
| Particle Beam | 10-20 | 10-20 | ✅ |
| Hercular Missiles | 25 | 25 | ✅ |
| Plasma Cannon | 6-30 | 6-30, ×2 shield | Design adds ×2 shield damage — intentional divergence |
| Disruptor | 10-40 | 10-40 | ✅ |
| Neutronium Bomb | 40-70 (MOO1) | 30-125 (design) | ❌ Very different range |
| Hellfire Torpedoes | 25×4 per hit (MOO1) | 25+10 vs shields (design) | ❌ Completely different mechanic |
| Zeon Missiles | 30 | 30 | ✅ |
| Proton Torpedoes | 75 | 40 | ❌ Design: 40, MOO1: 75 |
| Scatter Pack X | 15×10 (MOO1) | 10×5 (design) | ❌ Both damage/missile and count differ |
| Stellar Converter | 10-35 ×4 (MOO1) | 10-35 ×20 (design) | ❌ Design: ×20 attacks vs MOO1: ×4 |
| Mauler Device | 20-100 | 20-100 | ✅ |
| Plasma Torpedoes | 150 (MOO1) | 75 (design) | ❌ Design is half MOO1 value |
| Death Ray | 200-1000 | 200-1000 | ✅ (but placement differs) |

---

### 2. COMPUTERS

#### MOO1 Reference vs Design

| MOO1 Level | Tech | Design Level | Match? |
|------------|------|--------------|--------|
| 1 | Robotic Controls 2, BC Mark I, Battle Scanner | 1 | ✅ |
| 2 | ECM Mark I | 3 | ❌ Off by 1 |
| 4 | Deep Space Scanner | 4 | ✅ |
| 5 | BC Mark II | 6 | ❌ Off by 1 |
| 7 | ECM Mark II | 8 | ❌ Off by 1 |
| 8 | Robotic Controls III | 8 | ✅ |
| 10 | BC Mark III | 11 | ❌ Off by 1 |
| 12 | ECM Mark III | 13 | ❌ Off by 1 |
| 13 | Improved Space Scanner | 14 | ❌ Off by 1 |
| 15 | BC Mark IV | 16 | ❌ Off by 1 |
| 17 | ECM Mark IV | 18 | ❌ Off by 1 |
| 18 | Robotic Controls IV | 18 | ✅ |
| 20 | BC Mark V | 21 | ❌ Off by 1 |
| 22 | ECM Mark V | 23 | ❌ Off by 1 |
| 23 | Advanced Space Scanner | 24 | ❌ Off by 1 |
| 25 | BC Mark VI | 26 | ❌ Off by 1 |
| 27 | ECM Mark VI | 28 | ❌ Off by 1 |
| 28 | Robotic Controls V | 28 | ✅ |
| 30 | BC Mark VII | 31 | ❌ Off by 1 |
| 32 | ECM Mark VII | 33 | ❌ Off by 1 |
| 34 | Hyperspace Communications | 34 | ✅ |
| 35 | BC Mark VIII | 36 | ❌ Off by 1 |
| 37 | ECM Mark VIII | 38 | ❌ Off by 1 |
| 38 | Robotic Controls VI | 38 | ✅ |
| 40 | BC Mark IX | 41 | ❌ Off by 1 |
| 42 | ECM Mark IX | 43 | ❌ Off by 1 |
| 45 | BC Mark X | 46 | ❌ Off by 1 |
| 46 | Oracle Interface | 46 | ✅ |
| 47 | ECM Mark X | 48 | ❌ Off by 1 |
| 48 | Robotic Controls VII | 48 | ✅ |
| 49 | Technology Nullifier | 49 | ✅ |
| 50 | BC Mark XI | 50 | ✅ |

**Pattern:** Battle Computers and ECM Jammers are consistently offset by **+1 to +2 levels** in the design vs MOO1. Robotic Controls and scanners are mostly correct. This is a systematic shift, likely intentional to spread them out, but not flagged as such in the docs.

#### Missing MOO1 Computer Techs

None — all MOO1 Computers techs are accounted for in the design.

#### Design Computers Not In MOO1

1. **Quantum Computer** (design L55) — +3 attack, +3 initiative. Not in MOO1. Design addition.
2. **Subspace Scanner** (design L35) — MOO1 doesn't appear to have this specific level, but the scanner progression is generally present; this may be an invented intermediate.

---

### 3. CONSTRUCTION

#### MOO1 Reference vs Design

| MOO1 Level | Tech | Design Level | Match? |
|------------|------|--------------|--------|
| 1 | Titanium Armor (Small 3HP, Med 18HP, Large 100HP, Assault 600HP) | 1 | ✅ |
| 3 | Industrial Tech 9 | 3 | ✅ |
| 5 | Reduced Industrial Waste 80% | 5 | ✅ |
| 8 | Industrial Tech 8 | 8 | ✅ |
| 10 | Duralloy Armor (+50% HP) | 10 | ✅ |
| 11 | Battle Suits (+10 ground) | 11 | ✅ |
| 13 | Industrial Tech 7 | 13 | ✅ |
| 14 | Automated Repair Unit (15% HP/turn) | 14 | ✅ |
| 15 | Reduced Industrial Waste 60% | 15 | ✅ |
| 17 | Zortium Armor (+100% HP) | 17 | ✅ |
| 18 | Industrial Tech 6 | 18 | ✅ |
| 23 | Industrial Tech 5 | 23 | ✅ |
| 24 | Armored Exoskeleton (+20 ground) | 24 | ✅ |
| 25 | Reduced Industrial Waste 40% | 25 | ✅ |
| 26 | Andrium Armor (+150% HP) | 26 | ✅ |
| 28 | Industrial Tech 4 | 28 | ✅ |
| 33 | Industrial Tech 3 | 33 | ✅ |
| 34 | Tritanium Armor (+200% HP) | 34 | ✅ |
| 35 | Reduced Industrial Waste 20% | 35 | ✅ |
| 36 | Advanced Damage Control Unit (30% HP/turn) | 36 | ✅ |
| 38 | Industrial Tech 2 | 38 | ✅ |
| 40 | Powered Armor (+30 ground) | 40 | ❌ Design has no "Powered Armor" |
| 42 | Adamantium Armor (+250% HP) | 42 | ✅ |
| 45 | Industrial Waste Elimination | 45 | ✅ |
| 50 | Neutronium Armor (+300% HP) | 50 | ✅ |

#### Construction HP Multiplier Discrepancy

| Armor | MOO1 HP Bonus | Design HP Multiplier | Equivalent | Match? |
|-------|---------------|----------------------|------------|--------|
| Titanium | Base | 1.0× | Base | ✅ |
| Duralloy | +50% | 1.5× | +50% | ✅ |
| Zortrium | +100% | 2.0× | +100% | ✅ |
| Andrium | +150% | 2.5× | +150% | ✅ |
| Tritanium | +200% | 3.0× | +200% | ✅ |
| Adamantium | +250% | 3.5× | +250% | ✅ |
| Neutronium | +300% | 4.0× | +300% | ✅ |

All armor HP values match MOO1. The design uses "×multiplier" notation vs MOO1's "+% of original" notation but the math is equivalent.

#### Missing MOO1 Construction Tech

1. **Powered Armor** (MOO1 L40) — Adds 30 to ground combat rolls; replaces Battle Suits and Armored Exoskeleton. The design has no equivalent between Armored Exoskeleton (L24) and Adamantium Armor (L42). The design skips L40 ground gear entirely.

Note: The design has "Hull Space" improvements (Improved/Advanced/Superior/Maximum at L15/20/30/40) — these are NOT in MOO1 as separate technologies. In MOO1, hull space is inherent to the hull class and doesn't require research upgrades. **This is a significant intentional design addition.** Also, "Molecular Bonding" (design L52) and "Bio-Terminator Suit" (design L55) are design inventions not in MOO1.

---

### 4. FORCE FIELDS

#### MOO1 Reference vs Design

**Critical Finding:** MOO1 uses a different level ordering for shields than the design.

| MOO1 Level | Tech | Design Level | Match? |
|------------|------|--------------|--------|
| 1 | Class I Deflector | 1 | ✅ |
| 4 | Class II Deflector | 5 | ❌ Off by 1 |
| 8 | Personal Deflector Shield (+10) | 8 | ✅ |
| 10 | Class III Deflector | 10 | ✅ |
| 12 | Class V Planetary Shield | 12 | ✅ |
| 14 | Class IV Deflector | 12 | ❌ Design has IV at 12, MOO1 has IV at 14 |
| 16 | Repulsor Beam | 16 | ✅ |
| 20 | Class V Deflector | 18 | ❌ Design has VI at 18, MOO1 has V at 20 |
| 21 | Personal Absorption Shield (+20) | 21 | ✅ |
| 22 | Class X Planetary Shield | 22 | ✅ |
| 24 | Class VI Deflector | 20 | ❌ Design has VII at 20, MOO1 has VI at 24 |
| 27 | Cloaking Device | 27 | ✅ |
| 30 | Class VII Deflector | — | ❌ Design has VII at 20, off by 10 |
| 31 | Zyro Shield (75% missile destroy) | 31 | ✅ |
| 32 | Class XV Planetary Shield | 32 | ✅ |
| 34 | Class IX Deflector | 28 | ❌ Design has IX at 28, MOO1 at 34 |
| 37 | Stasis Field | 37 | ✅ |
| 38 | Personal Barrier Shield (+30) | 38 | ✅ |
| 40 | Class XI Deflector | 36 | ❌ Off by 4 |
| 42 | Class XX Planetary Shield | 42 | ✅ |
| 43 | Black Hole Generator | 43 | ✅ |
| 44 | Class XIII Deflector | 44 | ✅ |
| 46 | Lightning Shield | 25 | ❌ **Major** — Design has Lightning Shield at L25; MOO1 at L46 |
| 50 | Class XV Deflector | 50 | ✅ |

**Class VIII, X, XII, XIV Deflectors:** MOO1 doesn't explicitly list levels for VIII, X, XII, XIV on the StrategyWiki page — they appear in the design but their MOO1 levels are extrapolated. The design's level assignments for these are consistent but may not match actual MOO1 data precisely.

#### Lightning Shield Discrepancy — Significant

- **MOO1:** Lightning Shield at **Level 46**, destroys missiles with 100% chance (minus 1% per missile tech level)
- **Design:** Lightning Shield at **Level 25**, reflects 50% damage back to attacker

Not only is the level off by 21, the *mechanic* is completely different. MOO1's Lightning Shield is a missile destroyer (like Zyro but higher chance). The design's version is a damage reflector. **This appears to be both an unintentional level error and an intentional mechanic redesign, but it's not flagged.**

#### Zyro Shield Mechanic Discrepancy

- **MOO1:** "75% chance per missile minus 1% per technology level of the missile"
- **Design:** "75% chance to destroy each incoming missile" (no missile-tech penalty)

The design omits the missile tech level penalty. Minor but relevant for balance.

#### Force Fields Missing from Design

1. **Lightning Shield as missile destroyer** — Design replaced its function entirely
2. **Class VIII, X, XII, XIV shields** — Levels assigned by design but not directly confirmed from MOO1 source

---

### 5. PROPULSION

#### MOO1 Reference vs Design

| MOO1 Level | Tech | Design Level | Match? |
|------------|------|--------------|--------|
| 1 | Retro Engines (speed 1, combat 1) | 1 | ✅ |
| 2 | Hydrogen Fuel Cells (range 4) | — | ❌ Design calls this "Standard Fuel Cells" at L1 |
| 5 | Deuterium Fuel Cells (range 5) | 8 | ❌ Design "Deuterium" is range 6 at L8 |
| 6 | Nuclear Engines (speed 2, combat 2) | 5 | ❌ Off by 1 |
| 9 | Iridium Fuel Cells (range 6) | — | ❌ Design doesn't have this at L9 |
| 10 | Inertial Stabilizer (+2 maneuver, +1 combat) | 3 | ❌ Off by 7; design has it much earlier |
| 12 | Sub-Light Drives (speed 3, combat 2) | 8 | ❌ Off by 4; design combat=3 (MOO1: 2) |
| 14 | Dotomite Crystals (range 7) | 13 | ❌ Off by 1 |
| 16 | Energy Pulsar (5 + 1/2 ships to adjacent) | 12 | ❌ Off by 4; damage formula also differs |
| 18 | Fusion Drives (speed 4, combat 3) | 12 | ❌ **Major** — MOO1 speed=4/combat=3; Design: speed=3/combat=3 |
| 19 | Uridium Fuel Cells (range 8) | 18 | ❌ Off by 1 |
| 20 | Warp Dissipator (-0 to -1 maneuver/turn) | 24 | ❌ Off by 4; mechanic also different |
| 23 | Reajax II Fuel Cells (range 9) | 24 | ❌ Off by 1; design calls it "Reajax" |
| 24 | Impulse Drives (speed 5, combat 3) | 16 | ❌ **Major** — Off by 8; speeds differ |
| 27 | Intergalactic Star Gates | ❌ MISSING | Not in design |
| 29 | Trilithium Crystals (range 10) | 30 | ❌ Off by 1 |
| 30 | Ion Drives (speed 6, combat 4) | 20 | ❌ **Major** — Off by 10; speed differs |
| 34 | High Energy Focus (+3 attack range to beams) | 48 | ❌ **Major** — Off by 14; MOO1: beam range +3; Design: +1 attack |
| 36 | Anti-Matter Drives (speed 7, combat 4) | 26 | ❌ **Major** — Off by 10 |
| 38 | Sub-Space Teleporter (moves first, teleport) | 28 | ❌ Off by 10 |
| 40 | Ionic Pulsar | ❌ MISSING | Design has no Ionic Pulsar |
| 41 | Thorium Cells (infinite range) | 45 | ❌ Off by 4 |
| 42 | Inter-Phased Drives (speed 8, combat 5) | 34 | ❌ **Major** — Off by 8 |
| 43 | Sub-Space Interdictor | ❌ MISSING | Not in design |
| 45 | Combat Transporters | 30 | ❌ Off by 15 |
| 46 | Inertial Nullifier (+4 maneuver, +2 combat) | 20 | ❌ **Major** — Off by 26 |
| 48 | Hyper Drives (speed 9, combat 5) | 42 | ❌ Off by 6 |
| 50 | Displacement Device (33% dodge) | 43 | ❌ Off by 7 |

#### Engine Speed Discrepancies (Critical)

| Engine | MOO1 Speed | Design Speed | MOO1 Combat | Design Combat |
|--------|-----------|--------------|-------------|---------------|
| Retro | 1 | 1 | 1 | 1 |
| Nuclear | 2 | 2 | 2 | 2 |
| Sub-Light | 3 | 2 | 2 | 3 |
| Fusion | 4 | 3 | 3 | 3 |
| Impulse | 5 | 3 | 3 | 4 |
| Ion | 6 | 4 | 4 | 4 |
| Antimatter | 7 | 5 | 4 | 5 |
| Interphased | 8 | 6 | 5 | 6 |
| Hyper | 9 | 7 | 5 | 7 |
| Hyper-X | — (design only) | 8 | — | 8 |
| Temporal | — (design only) | 9 | — | 9 |

**Pattern:** The design's engine speeds are consistently **1-2 lower** than MOO1 at every tier. MOO1 tops out at speed 9 (Hyper Drives at L48), while the design extends to speed 9 through Temporal Drive at L55. This appears **intentional** — the design stretches the speed curve to accommodate more tiers — but it is **not flagged** as a departure.

#### Missing MOO1 Propulsion Techs

1. **Intergalactic Star Gates** (MOO1 L27) — 3000 BC infrastructure; ships travel any colony in 1 turn. Completely absent.
2. **Ionic Pulsar** (MOO1 L40) — 10 damage to adjacent ships (improved Energy Pulsar). Missing.
3. **Sub-Space Interdictor** (MOO1 L43) — Nullifies sub-space teleporters over owned planets. Missing.

#### High Energy Focus Mechanic Discrepancy

- **MOO1:** +3 attack *range* to direct fire weapons (Level 34)
- **Design:** +2 Initiative, +1 Attack rating (Level 48)

Completely different effect and level. The design's version is a Computers-style tactical buff; MOO1's is a range extender. This is a **fundamental mechanic change** not noted in docs.

#### Warp Dissipator Mechanic Discrepancy

- **MOO1:** "Reduces defender's maneuverability by 0-1 per turn" (Level 20) — random maneuver reduction on target
- **Design:** "Prevent all enemy fleet retreat from combat zone" (Level 24) — blanket retreat prevention

Different mechanic entirely. The design's version is far more powerful (complete retreat block vs. probabilistic maneuver debuff). **Likely an intentional upgrade** but not documented as such.

---

### 6. PLANETOLOGY

The StrategyWiki MOO1 planetology page was not directly accessible in detail, but based on the tech tree structure page and general MOO1 knowledge:

#### MOO1 Planetology Techs (Known)

MOO1's Planetology field includes:
- Terraforming (various levels — increases max pop)
- Soil Enrichment (increases planet size)
- Atmospheric Terraforming (Gaia transformation)
- Cloning (accelerated growth)
- Biological weapons (Death Spores, Doom Virus, Bio-Terminator)
- Eco Restoration (pollution cleanup)
- Colonization techs for hostile worlds

#### Design vs MOO1 Alignment

The design's Planetology field is the most **freely adapted** of all six fields. Key observations:

1. **Bio weapons moved correctly to Planetology** — Design correctly places Death Spores, Doom Virus, and Bio Terminator in Planetology, not Weapons. Matches MOO1 field assignment. ✅

2. **Death Spores (design L15, Planetology)** — Cross-references weapons.md where it's listed at tech level 15. Design correctly notes bio weapons belong to Planetology.

3. **Doom Virus (design L25)** — In weapons.md listed at L28 (Tier 9) but the cross-reference sends to Planetology. The Planetology doc shows L25. **Inconsistency**: weapons.md shows doom_virus tech_level=28 in the JSON schema but the planetology doc lists it at tech level 25.

4. **Bio Terminator (design Planetology L33)** — weapons.md JSON shows bio_terminator at tech_level=42 but correctly notes it's in Planetology. Planetology doc shows L33. Weapons.md is wrong in its tech_level assignment for bio weapons. **These cross-references in weapons.md need correction.**

5. **Terraforming progression** — The design's progressive +10/+20/+30 terraforming system is broadly MOO1-like but with RP costs derived via formula rather than directly matched to MOO1 source values (which weren't available online).

6. **Soil Enrichment** — Design has Basic (+25 pop, 200 BC) and Advanced (+50 pop, 300 BC). MOO1 has Soil Enrichment as well; likely similar values.

7. **Cloning** — Design adds Basic and Advanced Cloning as planetary growth accelerators. MOO1 has cloning; design values appear original.

---

## Cross-Document Inconsistencies

### weapons.md vs Planetology Field Assignments

The `weapons.md` JSON schema incorrectly assigns tech levels to bio weapons that conflict with planetology.md:

| Bio Weapon | weapons.md tech_level | planetology.md tech_level |
|------------|----------------------|--------------------------|
| Death Spores | 15 (category: biological) | 15 ✅ (matches) |
| Doom Virus | 28 (in tier 9 JSON) | 25 ❌ (mismatch) |
| Bio Terminator | 42 (in tier 14 JSON) | 33 ❌ (mismatch) |

**The Planetology file's values should be canonical** — weapons.md was retrofitted with bio weapon entries that don't match planetology's established levels.

### weapons.md Tier Assignment Logic

The design's Weapons tech tree uses a "tier" abstraction (Tier 1–18) that doesn't correspond to MOO1's level-per-tech system. Each tier spans multiple tech levels. This is a design choice, but it creates confusion when comparing to MOO1 which assigns one level per tech. The tier-to-level mapping in weapons.md is internally inconsistent (e.g., Tier 8 spans L22-25 but also contains L25 which is listed in Tier 9).

### Specific Tier/Level Overlap (weapons.md)

- Anti-Matter Torpedoes: Tier 8, tech_level=25
- Megabolt Cannon: Tier 9, tech_level=25
- Same tech level (25) in two different tiers — structural inconsistency.

---

## Summary of Key Issues

### Critical (Must Fix Before Implementation)

1. **Missing MOO1 Weapons**: Heavy Lasers, Anti-Missile Rockets, Ion Stream Projector, Pulse Phasor, Tri-Focus Plasma Cannon, Neutron Stream Projector — all completely absent from the design. Either document as intentional omissions or add them.

2. **Proton Torpedo damage wrong**: Design says 40, MOO1 says 75. **Half the correct value.**

3. **Plasma Torpedo damage wrong**: Design says 75, MOO1 says 150. **Half the correct value.**

4. **Stellar Converter attacks wrong**: Design says ×20, MOO1 says ×4. **5× too many attacks.**

5. **Neutronium Bomb damage wrong**: Design 30-125, MOO1 40-70. Different range entirely.

6. **Missing Propulsion techs**: Star Gates (L27), Ionic Pulsar (L40), Sub-Space Interdictor (L43) — three complete techs missing.

7. **Engine speeds compressed**: Design speeds 1-2 lower than MOO1 at every tier. Needs to be flagged as intentional or corrected.

8. **High Energy Focus mechanic**: MOO1 = +3 beam range. Design = +2 initiative, +1 attack. Completely different; undocumented change.

9. **Warp Dissipator mechanic**: MOO1 = maneuver debuff. Design = complete retreat prevention. Major power difference; undocumented change.

10. **Lightning Shield**: MOO1 Level 46 missile destroyer. Design Level 25 damage reflector. Different tier and mechanic; undocumented.

11. **Doom Virus / Bio Terminator tech level conflict** between weapons.md and planetology.md.

### Significant (Should Fix or Document)

12. **Heavy Fusion Beam damage**: MOO1 4-30 vs design 8-24. Different range.
13. **Scatter Pack V missile damage**: MOO1 6/missile vs design 5/missile.
14. **Scatter Pack VII**: MOO1 = 7 missiles × 10 dmg; Design = 5 missiles × 7 dmg. Both count and damage wrong.
15. **Scatter Pack X**: MOO1 = 10 missiles × 15 dmg; Design = 5 missiles × 10 dmg. Both count and damage wrong.
16. **Omega/Omega-V Bomb**: MOO1 20-50 damage; Design 15-60. Likely intentional rename+redesign; not documented.
17. **Construction Hull Space upgrades**: Four hull space improvement techs (design) don't exist in MOO1. Not flagged as additions.
18. **Powered Armor** (MOO1 Construction L40) missing from design.
19. **Battery Computers off by 1**: All BC and ECM techs shifted +1 level consistently. Likely intentional spread; should be documented.
20. **Intergalactic Star Gates**: Major strategic tech (L27 Propulsion) missing from design with no note.

### Minor (Note for Polish)

21. **Zyro Shield**: Missing missile tech level penalty from design.
22. **Death Ray placement**: MOO1 = Guardian-only. Design = researchable at L45. Major lore/balance change; should be explicitly flagged.
23. **Force Fields Shield ordering**: Classes IV, V, VI shifted vs MOO1; design may have constructed its own sequence.
24. **Sub-Light Drives speed**: MOO1 speed=3/combat=2; Design speed=2/combat=3 (speeds vs. combat swapped).
25. **Multiple propulsion techs shifted** by 1-4 levels throughout the tree.
26. **Quantum Computer** (design) — not a MOO1 tech; undocumented addition.

---

## Intentional vs Unintentional Discrepancies

### Likely Intentional (Design Choices)

| Change | Rationale |
|--------|-----------|
| Pet-themed race names replacing MOO1 races | Core game concept |
| Bio weapons in Planetology (correct per MOO1) | Correct field assignment ✅ |
| Death Ray researchable (not Guardian-locked) | Makes late game more accessible |
| Hull Space upgrade techs in Construction | Added progression element |
| Extended tech level scale (to L55+) | More endgame content |
| Warp Dissipator as retreat-blocker | Stronger, simpler mechanic |
| Oracle Interface in Computers field | Matches MOO1 correctly ✅ |
| Racial research cost modifiers (Poor/Average/Good/Excellent) | Matches MOO1 exactly ✅ |
| 50% tech randomness per race | Matches MOO1 exactly ✅ |

### Likely Unintentional (Errors)

| Error | Evidence |
|-------|----------|
| Proton Torpedo: 40 vs 75 | Simple value error |
| Plasma Torpedo: 75 vs 150 | Simple value error |
| Stellar Converter: ×20 vs ×4 attacks | 5× inflation |
| Doom Virus: L28 in weapons.md vs L25 in planetology | Copy-paste inconsistency |
| Bio Terminator: L42 in weapons.md vs L33 in planetology | Copy-paste inconsistency |
| Engine speeds 1-2 lower than MOO1 throughout | Compression without documentation |
| High Energy Focus effect changed | MOO1 effect likely forgotten |
| Scatter Pack damage and count values wrong | Multiple accumulated errors |

---

## Recommended Actions

### Immediate Fixes

1. **Correct torpedo damage**: Proton Torpedo → 75; Plasma Torpedo → 150
2. **Correct Stellar Converter**: Change ×20 to ×4 attacks (or document intentional buff)
3. **Fix bio weapon tech level conflict**: weapons.md should not list tech_levels for bio weapons; remove or mark as "see Planetology". Doom Virus canonical level = L25; Bio Terminator = L33.
4. **Fix Scatter Pack values**: V → 6 dmg/missile; VII → 7 missiles × 10; X → 10 missiles × 15.
5. **Fix Heavy Fusion Beam damage**: → 4-30 (or document intentional redesign)
6. **Fix Neutronium Bomb damage**: → 40-70 (or document intentional redesign)
7. **Fix Omega-V Bomb damage**: → 20-50 (or document as intentional Omega Bomb redesign)
8. **Fix weapons.md tier/level overlap at L25** (AMT and Megabolt Cannon both at same level in adjacent tiers)

### Documentation Additions

9. Add "**Design Departures from MOO1**" section to TECH_OVERVIEW.md listing all intentional changes
10. Document that engine speeds are compressed vs MOO1 and why
11. Document Warp Dissipator mechanic change explicitly
12. Document High Energy Focus mechanic change explicitly
13. Document Lightning Shield mechanic redesign
14. Document Death Ray as researchable (departure from MOO1)

### Additions to Consider

15. **Anti-Missile Rockets** (MOO1 L6) — defensive missile interceptor; fills gap between ECM and Zyro Shield
16. **Ion Stream Projector** (MOO1 L21) — HP-percentage damage weapon; unique mechanic worth including
17. **Intergalactic Star Gates** (MOO1 L27 Propulsion) — major strategic tech missing
18. **Ionic Pulsar** (MOO1 L40 Propulsion) — stronger Energy Pulsar upgrade
19. **Sub-Space Interdictor** (MOO1 L43 Propulsion) — Teleporter counter
20. **Heavy Lasers** (MOO1 L1) — range-2 beam weapon for early game variety
21. **Powered Armor** (MOO1 Construction L40) — +30 ground gear missing a tier

---

## Overall Assessment

**Structure**: The six-field tech tree framework matches MOO1 well. Research mechanics, racial cost modifiers, and the random availability system are all correctly captured.

**Tech names**: Most MOO1 tech names are preserved accurately, which is good for recognizability.

**Tech levels**: Consistently shifted throughout — computers off by ~1, weapons wildly scattered, propulsion off by 4-10 in the late game. The design appears to have expanded the scale without re-anchoring the individual tech levels.

**Damage values**: Core beam weapons and most missiles are correct. The big outliers are torpedoes (Proton: ½, Plasma: ½), Stellar Converter (×5 attacks), and Scatter Packs (wrong counts and damage).

**Missing techs**: ~10 MOO1 techs are absent from the design, mostly in Weapons (specialized niche weapons) and Propulsion (infrastructure and utility techs). These are all defensible cuts but should be documented.

**Design additions**: Hull Space upgrades (Construction), Quantum Computer (Computers), and extended engine/tech tiers are the main additions. All reasonable but undocumented.

The design is a solid MOO1 foundation with room for the pet-themed flavor. Fixing the critical damage values and documenting intentional departures would significantly improve the spec quality.
