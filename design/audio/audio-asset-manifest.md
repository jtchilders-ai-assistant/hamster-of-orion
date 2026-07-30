# Audio Asset Manifest

## Overview
This document tracks all required sound effects (SFX) and music files for Hamster of Orion. All audio implementation details (Web Audio API graphs, mixer buses, etc.) are governed by `sound-specification.md`. This is the rigid delivery checklist for the Audio department.

## Technical Specifications
- **Format:** All music should be delivered in high-quality VBR `.mp3`. All SFX should be delivered in 16-bit 44.1kHz `.wav` to allow precise Web Audio API buffer manipulation without compression artifacts.
- **Mastering:** Peak levels for music should hit -3dB. Peak levels for SFX should hit -6dB to avoid clipping when multiple layers trigger simultaneously.

## 1. UI & Interface SFX
Audio triggers for user interaction across menus and screens.

| Asset Name | Format | Duration/Loop | Description / Notes | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `sfx_ui_hover` | WAV | <0.5s | Soft synthetic chirp for mousing over buttons. | High |
| `sfx_ui_click` | WAV | <0.5s | Satisfying, tactile confirm sound. | High |
| `sfx_ui_error` | WAV | <0.5s | Low-pitched buzz/boop for invalid actions. | High |
| `sfx_ui_open_panel` | WAV | <1.0s | Mechanical or digital swoosh when a modal opens. | Medium |
| `sfx_ui_close_panel`| WAV | <1.0s | Reverse of open_panel swoosh. | Medium |
| `sfx_ui_turn_next` | WAV | 1.0s | Heavy, authoritative thud/chime for passing the turn. | High |
| `sfx_ui_slider_move`| WAV | <0.1s | Very short tick. Used in a rapid fire sequence as slider moves. | Medium |

## 2. Galaxy Map SFX
Audio triggers for events occurring on the main galaxy screen.

| Asset Name | Format | Duration/Loop | Description / Notes | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `sfx_map_fleet_move` | WAV | 2.0s | Low rumble of hyperspace engines accelerating away. | High |
| `sfx_map_fleet_arrive`| WAV | 1.5s | Deceleration sound or hyperspace exit boom. | High |
| `sfx_map_event_good` | WAV | 3.0s | Uplifting orchestral chime (discovery, tech breakthrough). | High |
| `sfx_map_event_bad` | WAV | 3.0s | Ominous, dissonant chord (monster attacks, plague). | High |
| `sfx_map_planet_click`| WAV | 1.0s | Digital scan noise when selecting a system. | Medium |

## 3. Combat SFX
Audio triggers for tactical battles. These will be pitch-modulated by the engine to prevent ear fatigue.

| Asset Name | Format | Duration/Loop | Description / Notes | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `sfx_combat_laser_s` | WAV | <1.0s | Quick zap for small/light energy weapons. | High |
| `sfx_combat_laser_h` | WAV | 1.5s | Deep, bassy blast for heavy energy weapons. | High |
| `sfx_combat_missile` | WAV | 1.5s | Launch whoosh followed by rocket trail. | High |
| `sfx_combat_bomb` | WAV | 2.0s | Heavy thud intended for planetary bombardment. | Medium |
| `sfx_combat_shield_hit`| WAV | 1.0s | High-frequency crackle/deflection noise. | High |
| `sfx_combat_hull_hit` | WAV | 1.0s | Metallic crunch. | High |
| `sfx_combat_explode_s`| WAV | 2.0s | Small ship destruction (fighter/scout). | High |
| `sfx_combat_explode_h`| WAV | 4.0s | Large ship destruction (cruiser/titan). Long tail. | High |
| `sfx_combat_engine` | WAV | Loop | Low hum for ship movement across hex grid. | Medium |

## 4. Music Tracks
Dynamic music system tracks.

| Asset Name | Format | Duration/Loop | Description / Notes | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `mus_theme_main` | MP3 | 2m00s | Main menu theme. Epic, space-opera feel. | High |
| `mus_map_peace_01` | MP3 | 3m00s (Loop) | Ambient, relaxing synth track for early game exploration. | High |
| `mus_map_peace_02` | MP3 | 3m00s (Loop) | Alternate peace track. | Medium |
| `mus_map_tension_01`| MP3 | 3m00s (Loop) | Darker ambient track triggered when at war. | High |
| `mus_combat_start` | MP3 | 0m10s | Explosive stinger playing immediately upon entering combat. | High |
| `mus_combat_loop` | MP3 | 2m00s (Loop) | High-tempo, percussion-heavy battle track. | High |
| `mus_diplomacy_theme`| MP3 | 1m30s (Loop) | Regal or neutral music for the diplomacy screen. | Medium |
| `mus_victory` | MP3 | 1m00s | Triumphant orchestral swell for winning the game. | High |
| `mus_defeat` | MP3 | 1m00s | Somber, tragic music for game over. | High |

## Implementation Notes for Engineers
- Do NOT hardcode audio file names in the UI components. Use the `AudioManager.play('ui_click')` wrapper defined in `sound-specification.md`.
- Missing assets should fail gracefully or fall back to a `console.warn()` without crashing the game loop.
