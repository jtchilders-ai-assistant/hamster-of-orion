# QA Test Matrix & Headless Simulation Specification

## Overview

this document specifies the QA test suite, deterministic map seed validation, headless AI simulation runner, and automated UI integration tests for **Hamster of Orion**.

**Reference Materials:**
- [Development Roadmap](file:///Users/jchilders/mywork/hamster-of-orion/design/technical/development-roadmap.md)
- [Turn Structure](file:///Users/jchilders/mywork/hamster-of-orion/design/game-mechanics/turn-structure.md)

---

## 1. Headless AI Simulation Suite

To verify game balance, economy stability, and non-blocking loop execution, the game includes a headless node CLI test runner (`npm run sim:headless`).

```
┌─────────────────────────────────────────────────────────────┐
│                HEADLESS AI SIMULATION RUNNER                │
│                                                             │
│  Seed: 0x9F4B210A  |  Galaxy: Large (108 Stars)  |  Races: 6  │
│  Executing 1,000 Turns...                                   │
│                                                             │
│  Turn  100: Stable Economy (Avg Pop: 1.4B, Avg Tech: 8)     │
│  Turn  250: Council Formed (Hamsters: 42%, Ferrets: 35%)     │
│  Turn  412: VICTORY DETECTED - Diplomatic Council Win        │
│                                                             │
│  Result: PASS (0 Infinite Loops, 0 NaN Errors, 60 FPS SLA)  │
└─────────────────────────────────────────────────────────────┘
```

### Automated Assertions Checked Every Sim Turn:
1. **Resource Conservation**: Total BC reserves + expenditures equal global income (no spontaneous BC leaks/duplication).
2. **Population Bounds**: `0 <= Colony.population <= Colony.max_population` for all 108 systems.
3. **No Deadlocks**: Turn processing finishes in `< 250ms` per turn.

---

## 2. Deterministic Seed Testing

- **Pseudo-Random Number Generator (PRNG)**: Uses Mulberry32 / PCG32 PRNG seeded by a 32-bit hex value (`0x1A2B3C4D`).
- **Seed Repeatability**: Passing identical seed + map configuration guarantees 100% identical star coordinates, planet types, mineral richness, and precursor artifact placements.
- **Fairness Audit**: Ensures homeworld systems for all 6 starting empires spawn within `12` to `16` light-years of each other.

---

## 3. UI Integration & Slider Math Test Suite

| Test Suite | Target Component | Test Case Description | Expected Result |
| :--- | :--- | :--- | :--- |
| `SliderMath.test.ts` | Production Sliders | Drag SHIP slider to 100% with 2 locked sliders | Other 2 unlocked sliders auto-balance to 0%; locked sliders remain unchanged |
| `SliderMath.test.ts` | Production Sliders | Set ECO slider to cleanup waste requirement | Eco slider indicator turns Green (`Waste: 0`); remainder spills into Terraforming |
| `CombatAlgo.test.ts` | Fleet Combat | 100 Lasers firing at Shield Level 2 ships | Damage formula subtracts 2 per beam hit; destroys target when total HP hits 0 |
| `TechTree.test.ts` | Research Engine | Select new tech research option | RP accumulates each turn until total cost met; triggers discovery event popup |
| `SaveLoad.test.ts` | Save System | Save state, modify local storage payload, load game | Save Migrator validates checksum, loads game state, and restores screen view |
