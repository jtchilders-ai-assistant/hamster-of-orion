# Audio & Sound Design Specification

## Overview

This document specifies the audio architecture, sound effect matrix, dynamic music engine, and Web Audio API implementation for **Hamster of Orion**.

The audio design pairs **majestically serious sci-fi orchestration** with **tactile UI sound effects**, creating a rich, immersive audio environment.

**Reference Materials:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [StrategyWiki MOO1 Reference Text](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)

---

## 1. Audio Architecture & Bus Topology

The game uses a 4-bus Web Audio API mixer architecture with gain nodes and low-pass filtering:

```
                      ┌────────────────────────┐
                      │    MASTER GAIN NODE    │
                      └───────────┬────────────┘
                                  │
      ┌──────────────────┬────────┴─────────┬──────────────────┐
      │                  │                  │                  │
┌─────▼──────┐    ┌──────▼─────┐    ┌───────▼────┐    ┌────────▼────────┐
│ UI BUS     │    │ MUSIC BUS  │    │ SFX BUS    │    │ AMBIENCE BUS    │
│ (Gain:1.0) │    │ (Gain:0.7) │    │ (Gain:0.9) │    │ (Gain:0.4)      │
└────────────┘    └────────────┘    └────────────┘    └─────────────────┘
```

### Bus Volume Controls & Player Settings
- **Master Volume**: `0.0` to `1.0` (Default: `0.8`)
- **Music Volume**: `0.0` to `1.0` (Default: `0.7`)
- **SFX Volume**: `0.0` to `1.0` (Default: `0.9`)
- **Ambience Volume**: `0.0` to `1.0` (Default: `0.4`)

---

## 2. Sound Effects (SFX) Matrix

| Trigger Event | Audio File / Synthesizer | Bus | Spatialization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **UI Button Click** | `sfx_ui_click.wav` | UI | Stereo | Crisp metallic click (high pitch) |
| **Command Screen Switch** | `sfx_ui_screen_change.wav` | UI | Stereo | Smooth electronic hum transition |
| **Slider Adjustment** | `sfx_ui_slider_step.wav` | UI | Stereo | Soft tactile notch sound during drag |
| **Fleet Command Order** | `sfx_fleet_send.wav` | SFX | 2D Spatial | Low-frequency warp charge effect |
| **Star Selection** | `sfx_map_star_select.wav` | SFX | 2D Spatial | Subtle sonar ping |
| **Laser Beam Fire** | `sfx_combat_laser.wav` | SFX | 3D Spatial | High-energy pulse beam sound |
| **Missile Launch** | `sfx_combat_missile_launch.wav` | SFX | 3D Spatial | Heavy rocket engine ignition thruster |
| **Shield Impact** | `sfx_combat_shield_hit.wav` | SFX | 3D Spatial | Resonant energy barrier buzz |
| **Hull Explosion** | `sfx_combat_explosion.wav` | SFX | 3D Spatial | Deep subterranean rumble with debris |
| **New Tech Discovered** | `sfx_event_tech_gained.wav` | UI | Stereo | Ascending brass fanfare chord |
| **Crisis / Monster Alert** | `sfx_event_crisis_siren.wav` | UI | Stereo | Low pulse alarm siren (`1Hz`) |
| **Colony Established** | `sfx_event_colony_new.wav` | UI | Stereo | Triumphant orchestral sting |

---

## 3. Dynamic Music Engine

The music engine uses seamless cross-fading (`1.5s` transition) between exploration, diplomatic, and combat tracks based on game state.

### 3.1 Music Track Assignments

| Game State | Track Name | Style & Mood | Loop Behavior |
| :--- | :--- | :--- | :--- |
| **Galaxy Map (Peace)** | `music_galaxy_ambient_1.mp3` | Deep space synth pads, slow tempo | Seamless loop |
| **Diplomacy - Hamsters** | `music_theme_hamsters.mp3` | Majestic imperial march, horn fanfare | Loop with 4-bar tail |
| **Diplomacy - Ants** | `music_theme_ants.mp3` | Rhythmic percussive hive beats | Loop with 4-bar tail |
| **Diplomacy - Budgies** | `music_theme_budgies.mp3` | High-register woodwinds, airy strings | Loop with 4-bar tail |
| **Diplomacy - Ferrets** | `music_theme_ferrets.mp3` | Aggressive brass & staccato drums | Loop with 4-bar tail |
| **Tactical Combat (Low Tension)** | `music_combat_tension_low.mp3` | Steady pulse synth bass, rising tension | Loop |
| **Tactical Combat (High Danger)** | `music_combat_tension_high.mp3` | Fast orchestral percussion, heavy brass | Loop |
| **Victory Screen** | `music_victory_fanfare.mp3` | Triumphant orchestral anthem | Play once |
| **Defeat Screen** | `music_defeat_lament.mp3` | Somber minor-key string adagio | Play once |

---

## 4. Preloading & Memory Caching Strategy

- **Core UI Sound Effects**: Preloaded into memory arrays on game launch (`~2.5 MB`).
- **Music Streams**: Streamed via HTML5 Audio elements with buffer pre-fetching (`128kbps` AAC/MP3).
- **Combat Sound Effects**: Cached on entry into tactical combat view and flushed on return to map.
