# Telemetry, Analytics & Save Versioning Specification

## Overview

This document specifies the telemetry event tracking architecture, game balance analytics payloads, save game schema versioning, and corrupted save recovery protocols for **Hamster of Orion**.

**Reference Materials:**
- [Technical Architecture](file:///Users/jchilders/mywork/hamster-of-orion/design/technical/ARCHITECTURE.md)
- [Data Schemas](file:///Users/jchilders/mywork/hamster-of-orion/design/technical/data-schemas.md)

---

## 1. Game Balance Telemetry Events

Telemetry events allow developers to gather anonymized play balance data to tune species traits, tech tree costs, and AI difficulty:

```json
{
  "event_id": "evt_game_end_0942",
  "timestamp": 1785289200,
  "game_version": "1.0.4",
  "galaxy_size": "LARGE",
  "difficulty": "HARD",
  "player_species": "Hamsters",
  "winning_species": "Hamsters",
  "victory_type": "DIPLOMATIC_COUNCIL",
  "total_turns": 248,
  "duration_seconds": 5420,
  "species_stats": [
    {"species": "Hamsters", "colonies": 18, "tech_level_sum": 142, "final_score": 48200},
    {"species": "Ferrets", "colonies": 12, "tech_level_sum": 118, "final_score": 32100}
  ]
}
```

### Tracked Analytics Triggers
- `session_start` / `session_end`
- `turn_complete` (records turn time, turn count, population totals)
- `tech_researched` (tracks which techs are chosen vs skipped)
- `battle_resolution` (tracks fleet composition, losses, and battle outcome)
- `diplomatic_treaty` (tracks non-aggression, trade pacts, and war declarations)

---

## 2. Save Game Versioning & Migration Pipeline

Save game files are stored as JSON blobs in `localStorage` or IndexedDB with a strict header version tag:

```json
{
  "save_header": {
    "version": "1.2.0",
    "save_name": "Autosave_Turn_142",
    "timestamp": "2026-07-29T18:35:00Z",
    "turn": 142,
    "player_species": "Hamsters"
  },
  "game_state": { ... }
}
```

### Automated Migration Pipeline (`Migrator.ts`)
```typescript
class SaveMigrator {
  static migrate(saveData: any): any {
    let currentVersion = saveData.save_header.version;
    
    if (currentVersion === "1.0.0") {
      saveData = this.migrateV10ToV11(saveData);
      currentVersion = "1.1.0";
    }
    if (currentVersion === "1.1.0") {
      saveData = this.migrateV11ToV12(saveData);
      currentVersion = "1.2.0";
    }
    return saveData;
  }
}
```

---

## 3. Corrupted Save Recovery Protocol

1. **Checksum Validation**: Save payloads include a SHA-256 header hash (`checksum`).
2. **Corrupted File Detection**: If the hash check fails or JSON parsing fails, the game notifies the player: `"Save file corrupted"`.
3. **Automated Fallback**: Automatically presents a `[LOAD AUTOSAVE]` or `[LOAD PREVIOUS TURN]` prompt so player progress is never lost.
