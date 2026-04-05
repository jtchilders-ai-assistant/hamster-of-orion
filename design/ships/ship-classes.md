# Ship Hull Classes

## Overview

In Hamster of Orion (following MOO1), there are **4 hull sizes**. The player assigns custom names to their ship designs - the hull size determines available space, not the ship's role.

---

## Hull Sizes

| Hull Size | Base Space | Base Cost | Typical Roles |
|-----------|------------|-----------|---------------|
| **Small** | 25-40 | Low | Scouts, fighters, colony ships |
| **Medium** | 60-100 | Medium | Multi-role warships |
| **Large** | 160-250 | High | Heavy warships |
| **Huge** | 400-600 | Very High | Capital ships, dreadnoughts |

**Note**: Exact space values depend on Construction technology level. Higher tech = more space per hull size.

---

## Design Names vs Hull Sizes

**Hull sizes are fixed**: Small, Medium, Large, Huge

**Design names are player-chosen**: 
- A Small hull might be named "Scout", "Fighter", "Colony Ship", or "Gunboat"
- A Huge hull might be named "Dreadnought", "Carrier", or "Death Star"

The empire can have up to **6 active ship designs** at any time.

---

## Hull Size Progression

Hull sizes unlock with **Construction technology**:

| Hull | Construction Tech Required |
|------|---------------------------|
| Small | Available at start |
| Medium | Available at start |
| Large | Improved Construction (varies) |
| Huge | Advanced Construction (varies) |

---

## Space Allocation

Each hull provides space for:
- **Weapons** (4 weapon slots)
- **Special Equipment** (3 special slots)

Ship systems (Computer, Shield, ECM, Armor, Engine, Maneuver) are **automatic** and do NOT consume space - they use your best available technology.

---

## Cost Calculation

Ship cost depends on:
1. Hull size base cost
2. Weapons equipped
3. Special equipment equipped
4. Miniaturization (older tech costs less space/BC)

```
Ship_Cost = Hull_Base_Cost + Weapon_Costs + Special_Costs
```

---

## Combat Statistics by Size

Larger ships have more hit points and are easier to hit:

| Hull Size | Base Hits | Size Modifier (to be hit) |
|-----------|-----------|---------------------------|
| Small | 3 | -2 (harder to hit) |
| Medium | 18 | 0 (baseline) |
| Large | 100 | +2 (easier to hit) |
| Huge | 600 | +4 (much easier to hit) |

---

## Strategic Considerations

**Small Ships**:
- Cheap, fast to build
- Good for scouts, early defense
- Quantity over quality

**Medium Ships**:
- Balanced cost/power
- Good multi-role platforms
- Main fleet backbone

**Large Ships**:
- Significant firepower
- Can mount heavy weapons
- Expensive but powerful

**Huge Ships**:
- Maximum firepower
- Can mount any weapon combo
- Very expensive, slow to build
- High-value targets
