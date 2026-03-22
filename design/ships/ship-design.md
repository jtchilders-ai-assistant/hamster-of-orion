# Ship Design System

## Overview
Players design custom ships by selecting hull size, engines, weapons, defenses, and special systems. MOO1-style: simple but strategic.

---

## Design Process

### Step 1: Choose Hull
- Scout (50) → Titan (2,500)
- Determines total space available
- Locked hulls require Construction tech

### Step 2: Select Engine
- **Required** - every ship needs propulsion
- Takes 10-20% of hull space
- Better engines = faster ship = higher initiative

### Step 3: Add Weapons
- Optional but recommended for combat ships
- Beam weapons: instant hit
- Missiles: can be intercepted
- Bombs: for planetary attack
- Mix weapon types for flexibility

### Step 4: Add Defenses
- **Shields**: Absorb damage, regenerate between battles
- **Armor**: Automatic based on tech, covers remaining space
- **ECM**: Reduces enemy accuracy

### Step 5: Add Special Systems
- Battle Computers: +accuracy
- Repair Systems: Regenerate hull
- Cloaking: Invisibility
- Scanners: Detection range

### Step 6: Name & Save
- Give design a name
- Save to library
- Can build unlimited copies

---

## Design Constraints

**Space Limit**: Total systems ≤ Hull Size  
**Engine Required**: Must have propulsion  
**Cost Scales**: Bigger/better = more expensive  

**Example Destroyer Design (250 space)**:
```
"Guardian" Class Destroyer
- Ion Drive: 35 space
- 2x Heavy Laser: 60 space
- Class III Shield: 25 space
- Battle Computer II: 15 space
- ECM Jammer I: 20 space
- Armor (Duralloy): Fills remaining 95 space
Total: 250 space
Cost: ~450 BC
```

---

## Pre-Made Templates

Game includes default designs:
- Scout: Fast exploration ship
- Fighter: Light combat
- Bomber: Planet attack
- Defender: Colony protection
- Battleship: Heavy assault

Players can modify or create custom designs.

---

## Miniaturization

As tech advances, old systems shrink:
- Each tech tier: -50% space
- Example: Laser (4 space) → (2 space) after Gatling Laser researched
- Frees space for more systems
- Allows retrofitting old designs

---

## Race-Specific Design Tips

**Budgies**: Speed + Light Weapons  
**Ferrets**: Maximum Firepower  
**Hermit Crabs**: Maximum Defense  
**Rabbits**: Minimum Cost  
**Ants**: Efficient Production  

---

Next: See `weapons-systems.md` and `defense-systems.md` for detailed system behaviors.
