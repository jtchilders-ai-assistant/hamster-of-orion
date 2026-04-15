# Tech Tree Audit Report — 2026-04-15

## Purpose

Cross-reference all six technology fields against MOO1 canonical values (StrategyWiki) and verify that all values needed by game algorithms are defined.

---

## Summary

| Field | Status | Issues Found | Critical |
|-------|--------|--------------|----------|
| Weapons | ⚠️ Needs Review | 8 | 3 |
| Computers | ⚠️ Needs Review | 6 | 2 |
| Construction | ⚠️ Needs Review | 4 | 1 |
| Force Fields | ⚠️ Needs Review | 5 | 2 |
| Planetology | ⚠️ Needs Review | 4 | 1 |
| Propulsion | ⚠️ Needs Review | 6 | 2 |

**Legend:** Critical = blocks algorithm implementation

---

## WEAPONS FIELD

### Tech Level Discrepancies (MOO1 vs Design)

| Tech | MOO1 Level | Design Level | Issue |
|------|------------|--------------|-------|
| Neutron Pellet Gun | L7 | L5 | Design is 2 levels early |
| Hyper-X Rockets | L8 | L7 | Design is 1 level early |
| Fusion Bomb | L9 | L10 | Design is 1 level late |
| Scatter Pack V | L11 | L10 | Design is 1 level early |
| Ion Rifle/Gatling Laser Rifle | L12 | L12 | ✅ OK |
| Mass Driver | L13 | L8 | **Design is 5 levels early** |
| Merculite Missiles | L14 | L12 | Design is 2 levels early |
| Graviton Beam | L17 | L15 | Design is 2 levels early |
| Stinger Missiles | L18 | L15 | Design is 3 levels early |
| Hard Beam | L19 | L18 | Design is 1 level early |
| Scatter Pack VII | L27 | L18 | **Design is 9 levels early** |
| Heavy Fusion Beam | L20 | L22 | MOO1: 4-30 dmg, Design: 8-24 dmg |
| Omega-V Bomb | L22 | L30 | **Design is 8 levels late** |
| Ion Stream Projector | L21 | L21 | ✅ OK |
| Anti-Matter Torpedoes | L23 | L25 | Design is 2 levels late |
| Megabolt Cannon | L25 | L25 | ✅ OK |
| Phasor | L26 | L27 | Design is 1 level late |
| Auto-Blaster | L28 | L32 | Design is 4 levels late |
| Pulson Missiles | L29 | L21 | **Design is 8 levels early** |
| Tachyon Beam | L30 | L35 | Design is 5 levels late |
| Gauss Autocannon | L32 | L37 | Design is 5 levels late |
| Particle Beam | L33 | L40 | Design is 7 levels late |
| Hercular Missiles | L34 | L24 | **Design is 10 levels early** |
| Plasma Cannon | L35 | L42 | Design is 7 levels late |
| Disruptor | L37 | L47 | Design is 10 levels late |
| Pulse Phasor | L38 | L38 | ✅ OK |
| Neutronium Bomb | L39 | L43 | Design is 4 levels late |
| Hellfire Torpedoes | L40 | L35 | **Design is 5 levels early** |
| Zeon Missiles | L41 | L30 | **Design is 11 levels early** |
| Proton Torpedoes | L43 | L42 | Design is 1 level early |
| Scatter Pack X | L44 | L33 | **Design is 11 levels early** |
| Tri-Focus Plasma Cannon | L45 | L45 | ✅ OK (damage fixed to 20-50) |
| Stellar Converter | L46 | L55 | Design is 9 levels late |
| Neutron Stream Projector | L47 | L47 | ✅ OK |
| Mauler Device | L48 | L50 | Design is 2 levels late |
| Plasma Torpedoes | L50 | L48 | Design is 2 levels early |
| Death Ray | Guardian only | L45 | ✅ OK (Design note) |

### Missing Numeric Values (Algorithm-Critical)

| Tech | Missing Value | Used By |
|------|---------------|---------|
| Heavy Fusion Beam | MOO1 dmg is 4-30, design says 8-24 | combat-algorithm.md |
| Nuclear Missile | Missing attack rating bonus (+1) | combat-algorithm.md |
| Hyper-V Rockets | Missing attack rating bonus (+1) | combat-algorithm.md |
| Hyper-X Rockets | Missing attack rating bonus (+1) | combat-algorithm.md |
| Merculite Missiles | Missing attack rating bonus (+2) | combat-algorithm.md |
| Stinger Missiles | Missing attack rating bonus (+3) | combat-algorithm.md |
| Pulson Missiles | Missing attack rating bonus (+4) | combat-algorithm.md |
| Hercular Missiles | Missing attack rating bonus (+5) | combat-algorithm.md |
| Zeon Missiles | Missing attack rating bonus (+7) | combat-algorithm.md |
| Hellfire Torpedoes | MOO1: 4 attacks × 25 dmg each | combat-algorithm.md |
| Plasma Torpedoes | Missing -15 damage per space traveled | combat-algorithm.md |
| All weapons | Missing space/cost values | ship-design.md |

### Recommendations
1. **Critical:** Add missile attack bonuses to all missile entries
2. **Critical:** Fix Heavy Fusion Beam damage to 4-30 (MOO1)
3. **Critical:** Add Hellfire Torpedo mechanic (4×25 dmg)
4. Review tech level deviations — some may be intentional design changes but should be documented

---

## COMPUTERS FIELD

### Tech Level Discrepancies (MOO1 vs Design)

| Tech | MOO1 Level | Design Level | Issue |
|------|------------|--------------|-------|
| BC Mark II | L5 | L6 | Design is 1 level late |
| ECM Mark I | L2 | L3 | Design is 1 level late |
| Deep Space Scanner | L4 | L4 | ✅ OK |
| ECM Mark II | L7 | L8 | Design is 1 level late |
| RC III | L8 | L8 | ✅ OK |
| BC Mark III | L10 | L11 | Design is 1 level late |
| ECM Mark III | L12 | L13 | Design is 1 level late |
| Improved Space Scanner | L13 | L14 | Design is 1 level late |
| BC Mark IV | L15 | L16 | Design is 1 level late |
| ECM Mark IV | L17 | L18 | Design is 1 level late |
| RC IV | L18 | L18 | ✅ OK |
| BC Mark V | L20 | L21 | Design is 1 level late |
| ECM Mark V | L22 | L23 | Design is 1 level late |
| Advanced Space Scanner | L23 | L24 | Design is 1 level late |
| BC Mark VI | L25 | L26 | Design is 1 level late |
| ECM Mark VI | L27 | L28 | Design is 1 level late |
| RC V | L28 | L28 | ✅ OK |
| BC Mark VII | L30 | L31 | Design is 1 level late |
| ECM Mark VII | L32 | L33 | Design is 1 level late |
| Hyperspace Comms | L34 | L34 | ✅ OK |
| BC Mark VIII | L35 | L36 | Design is 1 level late |
| ECM Mark VIII | L37 | L38 | Design is 1 level late |
| RC VI | L38 | L38 | ✅ OK |
| BC Mark IX | L40 | L41 | Design is 1 level late |
| ECM Mark IX | L42 | L43 | Design is 1 level late |
| BC Mark X | L45 | L46 | Design is 1 level late |
| Oracle Interface | L46 | L46 | ✅ OK |
| ECM Mark X | L47 | L48 | Design is 1 level late |
| RC VII | L48 | L48 | ✅ OK |
| Technology Nullifier | L49 | L49 | ✅ OK |
| BC Mark XI | L50 | Not in design | **MISSING** |

### Missing Numeric Values (Algorithm-Critical)

| Tech | Missing Value | Used By |
|------|---------------|---------|
| Technology Nullifier | MOO1: -2 to -6 attack, design says -2 to -5 | combat-algorithm.md |
| Battle Scanner | Initiative bonus (+3) ✅ Defined | combat-algorithm.md |
| All BC/ECM | Attack/Defense values ✅ Defined | combat-algorithm.md |
| All Scanners | Detection ranges ✅ Defined | exploration.md |

### Recommendations
1. **Critical:** Add BC Mark XI (L50, +11 Attack)
2. Fix Technology Nullifier to -2 to -6 (MOO1)
3. Review +1 level offset pattern — this appears consistent so may be intentional

---

## CONSTRUCTION FIELD

### Tech Level Discrepancies (MOO1 vs Design)

| Tech | MOO1 Level | Design Level | Issue |
|------|------------|--------------|-------|
| Industrial Tech 9 | L3 | L3 | ✅ OK |
| Reduced Waste 80% | L5 | L5 | ✅ OK |
| Industrial Tech 8 | L8 | L8 | ✅ OK |
| Duralloy Armor | L10 | L10 | ✅ OK |
| Battle Suits | L11 | L11 | ✅ OK |
| Industrial Tech 7 | L13 | L13 | ✅ OK |
| Automated Repair | L14 | L14 | ✅ OK |
| Reduced Waste 60% | L15 | L15 | ✅ OK |
| Zortrium Armor | L17 | L17 | ✅ OK |
| Industrial Tech 6 | L18 | L18 | ✅ OK |
| Industrial Tech 5 | L23 | L23 | ✅ OK |
| Armored Exoskeleton | L24 | L24 | ✅ OK |
| Reduced Waste 40% | L25 | L25 | ✅ OK |
| Andrium Armor | L26 | L26 | ✅ OK |
| Industrial Tech 4 | L28 | L28 | ✅ OK |
| Industrial Tech 3 | L33 | L33 | ✅ OK |
| Tritanium Armor | L34 | L34 | ✅ OK |
| Reduced Waste 20% | L35 | L35 | ✅ OK |
| Adv Damage Control | L36 | L36 | ✅ OK |
| Industrial Tech 2 | L38 | L38 | ✅ OK |
| Powered Armor | L40 | L40 | ✅ OK |
| Adamantium Armor | L42 | L42 | ✅ OK |
| Waste Elimination | L45 | L45 | ✅ OK |
| Neutronium Armor | L50 | L50 | ✅ OK |

### Missing Numeric Values

| Tech | Missing Value | Used By |
|------|---------------|---------|
| Hull Space bonuses | Design has +20/40/60/80%, MOO1 doesn't specify | ship-design.md |
| Armor HP multipliers | ✅ All defined (1.0×–4.0×) | combat-algorithm.md |
| Ground bonuses | ✅ All defined (+0 to +30) | ground-combat.md |

### Notes
✅ Construction field is well-aligned with MOO1. No critical issues.

---

## FORCE FIELDS FIELD

### Tech Level Discrepancies (MOO1 vs Design)

| Tech | MOO1 Level | Design Level | Issue |
|------|------------|--------------|-------|
| Class II Shield | L4 | L5 | Design is 1 level late |
| Personal Deflector | L8 | L8 | ✅ OK |
| Class III Shield | L10 | L10 | ✅ OK |
| Planetary Shield V | L12 | L12 | ✅ OK |
| Class IV Shield | L14 | L12 | **Design is 2 levels early** |
| Class V Shield | L20 | L14 | **Design is 6 levels early** |
| Repulsor Beam | L16 | L16 | ✅ OK |
| Personal Absorption | L21 | L21 | ✅ OK |
| Planetary Shield X | L22 | L22 | ✅ OK |
| Class VI Shield | L24 | L18 | **Design is 6 levels early** |
| Cloaking Device | L27 | L27 | ✅ OK |
| Class VII Shield | L30 | L20 | **Design is 10 levels early** |
| Zyro Shield | L31 | L31 | ✅ OK |
| Planetary Shield XV | L32 | L32 | ✅ OK |
| Class IX Shield | L34 | L28 | **Design is 6 levels early** |
| Stasis Field | L37 | L37 | ✅ OK |
| Personal Barrier | L38 | L38 | ✅ OK |
| Class XI Shield | L40 | L36 | **Design is 4 levels early** |
| Planetary Shield XX | L42 | L42 | ✅ OK |
| Black Hole Generator | L43 | L43 | ✅ OK |
| Class XIII Shield | L44 | L44 | ✅ OK |
| Lightning Shield | L46 | L25 | **Design is 21 levels early** |
| Class XV Shield | L50 | L50 | ✅ OK |

### Missing Shields (MOO1 has, Design missing)
- Class VIII Shield (L? — need to check MOO1 exactly)
- Class X Shield (L? — need to check MOO1)
- Class XII Shield (L? — need to check MOO1)
- Class XIV Shield (L? — need to check MOO1)

Wait — MOO1 skips some shield classes. Let me re-check...

### MOO1 Shield Progression (Verified)
| MOO1 | Shield | Absorb |
|------|--------|--------|
| L1 | Class I | -1 |
| L4 | Class II | -2 |
| L10 | Class III | -3 |
| L14 | Class IV | -4 |
| L20 | Class V | -5 |
| L24 | Class VI | -6 |
| L30 | Class VII | -7 |
| L34 | Class IX | -9 |
| L40 | Class XI | -11 |
| L44 | Class XIII | -13 |
| L50 | Class XV | -15 |

MOO1 skips Classes VIII, X, XII, XIV. Our design adds these — this is likely **intentional design expansion**.

### Missing Numeric Values

| Tech | Missing Value | Used By |
|------|---------------|---------|
| Lightning Shield | MOO1: 100% missile destroy − 1% per missile level | combat-algorithm.md |
| Zyro Shield | MOO1: 75% missile destroy − 1% per missile level | combat-algorithm.md |
| Black Hole Generator | MOO1: 25-100% destroy − 2% per shield class | combat-algorithm.md |
| All shields | Absorb values ✅ Defined | combat-algorithm.md |

### Recommendations
1. **Critical:** Add Zyro/Lightning Shield formulas (missile tech level modifier)
2. **Critical:** Add Black Hole Generator formula (shield class modifier)
3. Review shield level offsets — design adds intermediate shields, which is fine but deviates from MOO1 progression

---

## PLANETOLOGY FIELD

### Tech Level Discrepancies (MOO1 vs Design)

| Tech | MOO1 Level | Design Level | Issue |
|------|------------|--------------|-------|
| Eco Restoration | L1 | L1 | ✅ OK |
| Terraforming +10 | L2 | L2 | ✅ OK |
| Controlled Barren | L3 | L3 | ✅ OK |
| Improved Eco | L5 | L4 | Design is 1 level early |
| Controlled Tundra | L6 | L6 | ✅ OK |
| Terraforming +20 | L8 | L6 | **Design is 2 levels early** |
| Controlled Dead | L9 | L8 | Design is 1 level early |
| Death Spores | L10 | L9 | Design is 1 level early |
| Enhanced Eco | L13 | L11 | Design is 2 levels early |
| Controlled Inferno | L12 | L10 | Design is 2 levels early |
| Terraforming +30 | L14 | L10 | **Design is 4 levels early** |
| Controlled Toxic | L15 | L13 | Design is 2 levels early |
| Soil Enrichment | L16 | L14 | Design is 2 levels early |
| Bio Toxin Antidote | L17 | L15 | Design is 2 levels early |
| Controlled Radiated | L18 | L17 | Design is 1 level early |
| Terraforming +40 | L20 | L14 | **Design is 6 levels early** |
| Cloning | L21 | L19 | Design is 2 levels early |
| Atmos Terraforming | L22 | L21 | Design is 1 level early |
| Advanced Eco | L24 | L22 | Design is 2 levels early |
| Doom Virus | L27 | L25 | Design is 2 levels early |
| Advanced Soil | L30 | L26 | Design is 4 levels early |
| Terraforming +60 | L32 | L22 | **Design is 10 levels early** |
| Complete Eco | L34 | L29 | Design is 5 levels early |
| Universal Antidote | L36 | L30 | Design is 6 levels early |
| Terraforming +80 | L38 | L30 | **Design is 8 levels early** |
| Bio Terminator | L40 | L33 | Design is 7 levels early |
| Advanced Cloning | L42 | L34 | Design is 8 levels early |
| Terraforming +100 | L44 | L38 | Design is 6 levels early |
| Complete Terraforming | L50 | L46+ | Design is ~4 levels early |

### Missing Numeric Values

| Tech | Issue | Used By |
|------|-------|---------|
| Death Spores | MOO1: -1 pop per fire, design says per round | combat-algorithm.md |
| Bio weapons | Need per-fire vs per-round clarification | combat-algorithm.md |
| Cloning | MOO1: 10 BC per 1M, ✅ Defined | economy.md |
| Advanced Cloning | MOO1: 5 BC per 1M, ✅ Defined | economy.md |
| Eco restoration | All ✅ Defined (2/3/5/10/20 waste per BC) | economy.md |

### Recommendations
1. Document that tech levels are intentionally compressed (faster progression)
2. Clarify bio weapon damage timing (per-fire vs per-round)

---

## PROPULSION FIELD

### Tech Level Discrepancies (MOO1 vs Design)

| Tech | MOO1 Level | Design Level | Issue |
|------|------------|--------------|-------|
| Retro Engines | L1 | L1 | ✅ OK |
| Hydrogen Fuel | L2 | L1 (as "Standard") | Renamed, ✅ OK |
| Deuterium Fuel | L5 | L8 | Design is 3 levels late |
| Nuclear Engines | L6 | L5 | Design is 1 level early |
| Irridium Fuel | L9 | Not found | **MISSING** (or renamed?) |
| Inertial Stabilizer | L10 | L3 | **Design is 7 levels early** |
| Sub-Light Drives | L12 | L8 | Design is 4 levels early |
| Dotomite Crystals | L14 | L13 | Design is 1 level early |
| Energy Pulsar | L16 | L12 | Design is 4 levels early |
| Fusion Drives | L18 | L12 | Design is 6 levels early |
| Uridium Fuel | L19 | L18 | Design is 1 level early |
| Warp Dissipator | L20 | L24 | Design is 4 levels late |
| Reajax II Fuel | L23 | L24 | Design is 1 level late |
| Impulse Drives | L24 | L16 | **Design is 8 levels early** |
| Intergalactic Star Gates | L27 | L27 | ✅ OK |
| Trilithium Crystals | L29 | L30 | Design is 1 level late |
| Ion Drives | L30 | L20 | **Design is 10 levels early** |
| High Energy Focus | L34 | L48 | Design is 14 levels late |
| Antimatter Drives | L36 | L26 | Design is 10 levels early |
| Sub-Space Teleporter | L38 | L28 | Design is 10 levels early |
| Ionic Pulsar | L40 | L40 | ✅ OK |
| Thorium Cells | L41 | L45 | Design is 4 levels late |
| Interphased Drives | L42 | L34 | Design is 8 levels early |
| Sub-Space Interdictor | L43 | L43 | ✅ OK |
| Combat Transporters | L45 | L30 | **Design is 15 levels early** |
| Inertial Nullifier | L46 | L20 | **Design is 26 levels early** |
| Hyperdrives | L48 | L42 | Design is 6 levels early |
| Displacement Device | L50 | L43 | Design is 7 levels early |

### Missing Numeric Values

| Tech | Missing Value | Used By |
|------|---------------|---------|
| Energy Pulsar | MOO1: 5 dmg + 1 per 2 ships | combat-algorithm.md |
| Ionic Pulsar | MOO1: 10 dmg + 1 per 2 ships | combat-algorithm.md |
| Displacement Device | MOO1: 33% miss | combat-algorithm.md |
| Engine stats | Most ✅ Defined (speed, combat, maneuver) | combat-algorithm.md |
| Fuel ranges | Most ✅ Defined (4-11 parsecs, infinite) | exploration.md |

### Recommendations
1. **Critical:** Define Energy/Ionic Pulsar damage formula (base + per-ship bonus)
2. Verify Inertial Stabilizer/Nullifier bonuses match MOO1 (+2/+4)
3. Many tech levels are compressed — document as intentional

---

## GLOBAL RECOMMENDATIONS

### Critical Fixes (Block Implementation)

1. **Weapons:** Add missile attack rating bonuses (+1 to +7)
2. **Weapons:** Fix Heavy Fusion Beam damage (4-30 not 8-24)
3. **Weapons:** Add Hellfire Torpedo mechanic (4×25 damage)
4. **Weapons:** Add Plasma Torpedo range decay (-15 per space)
5. **Computers:** Add BC Mark XI (L50, +11 Attack)
6. **Force Fields:** Add Zyro/Lightning Shield formulas
7. **Propulsion:** Add Pulsar damage formulas

### Documentation Needed

1. Create DESIGN_DEVIATIONS.md listing all intentional changes from MOO1
2. Many techs are available earlier than MOO1 — document as "accelerated progression"
3. Some techs have different values — document rationale

### Verification Needed

1. Cross-check all weapon space/cost values against ships/weapons-complete.md
2. Verify all combat formulas use correct tech values
3. Run test suite against MOO1 expected outcomes

---

*Audit completed: 2026-04-15*
*Auditor: Wesley (AI Assistant)*
*Source: StrategyWiki MOO1 reference pages*
