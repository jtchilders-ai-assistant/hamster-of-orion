# Ship Design System

## Overview

Players design custom ships by selecting hull size, appearance, weapons, and special equipment. Ship systems (engines, shields, computers, etc.) are **automatically set to your best available technology** - no manual selection required.

---

## Design Philosophy (MOO1-Faithful)

### Automatic Systems
The following are **automatically equipped** with your best researched tech:
- **Computer** - Attack bonus (Battle Computer)
- **Shield** - Deflector shields
- **ECM** - Electronic countermeasures (Missile Defense)
- **Armor** - Hull armor type
- **Engine** - Propulsion (determines Warp Speed)
- **Maneuver** - Combat maneuverability

**When you research better tech, ALL your ships automatically upgrade** to use it. No retrofitting needed.

### Player Choices
Players only select:
1. **Hull Size** - Small, Medium, Large, Huge (determines space available)
2. **Ship Appearance** - Visual style (cosmetic only)
3. **Weapons** - Up to 4 weapon slots with type and quantity
4. **Special Equipment** - Up to 3 special slots

---

## Hull Sizes

| Size | Space | Base Cost | Typical Use |
|------|-------|-----------|-------------|
| Small | 25 | 6 BC | Scouts, fighters, colony ships |
| Medium | 70 | 36 BC | Multi-role warships |
| Large | 280 | 200 BC | Heavy warships |
| Huge | 1400 | 1200 BC | Battleships, dreadnoughts |

Larger hulls unlock with Construction technology research.

---

## Weapons

### Weapon Slots
- 4 weapon slots available per ship
- Each slot can hold one weapon type
- **Count** determines how many of that weapon (uses more space)

### Weapon Types
- **Beam Weapons**: Instant hit (Laser, Gatling Laser, Ion Cannon, etc.)
- **Missiles**: Can be intercepted, limited racks (Nuclear, Merculite, etc.)
- **Torpedoes**: Heavy damage, slower
- **Bombs**: For planetary bombardment only

### Space Consumption
Each weapon has a space cost. More weapons = more space used.
```
Example: 
- Laser × 2 = 6 space
- Nuclear Missiles × 1 = 8 space
```

---

## Special Equipment

### Special Slots
- 3 special equipment slots available
- These provide utility, not combat power

### Common Special Equipment

| Equipment | Effect | Typical Use |
|-----------|--------|-------------|
| **Colony Module** | Allows colonizing planets | Required for colony ships |
| **Reserve Fuel Tanks** | +3 parsec range | Extended exploration |
| **Extended Fuel Tanks** | +6 parsec range | Deep space missions |
| **Battle Scanner** | See enemy ship details | Intel in combat |
| **Anti-Missile Rockets** | Point defense vs missiles | Defense ships |

---

## Space Management

**Only weapons and specials consume space.**

Ship systems (Computer, Shield, ECM, Armor, Engine, Maneuver) are automatic and do NOT use space.

```
Example Small Hull (25 space):
- Laser × 1 = 3 space
- Nuclear Missiles × 1 = 8 space  
- Reserve Fuel Tanks = 10 space
- Available: 4 space remaining
```

---

## Design Constraints

- **6 Design Limit**: Empire can have only 6 active ship designs
- **Space Limit**: Weapons + Specials cannot exceed hull space
- **Production**: Once designed, ships can be built at any colony

---

## Automatic Tech Upgrades

When you research better technology:
- **Existing designs** automatically use the new tech
- **Ships already built** also upgrade (for systems, not weapons)
- **No retrofitting cost** for system upgrades

Example: Research "Class II Shields" → All your ships now have Class II Shields automatically.

---

## Miniaturization

As tech advances, weapons shrink:
- Each tech tier above a weapon: **-50% space cost**
- Allows fitting more weapons on same hull
- Encourages upgrading to new weapon types

---

## Example Designs

### Scout (Small Hull)
- Weapons: None
- Specials: Reserve Fuel Tanks
- Role: Exploration

### Colony Ship (Small Hull)
- Weapons: None  
- Specials: Colony Module
- Role: Colonization

### Fighter (Small Hull)
- Weapons: Laser × 4
- Specials: None
- Role: Cheap combat ship

### Destroyer (Large Hull)
- Weapons: Ion Cannon × 2, Merculite Missiles × 1
- Specials: Battle Scanner
- Role: Multi-role warship

---

## Race-Specific Tips

- **Budgies**: Leverage defense bonus with speed
- **Ferrets**: Maximize attack weapons
- **Hermit Crabs**: Heavy armor benefits your resilience
- **Rabbits**: Build many cheap small ships
- **Ants**: Efficient production of any design
