# Art Asset Manifest

## Overview
This document serves as the master tracking list for all graphical assets required for Hamster of Orion. It is the "Single Source of Truth" for the art department and UI engineers. Engineers should use the dimensions specified here to create placeholder colored `<div>`s or blank canvas sprites until final art is delivered.

## 1. UI Icons & HUD Elements
All UI icons should be delivered as vector `.svg` or high-resolution `.webp` files with transparent backgrounds.

| Asset Name | Dimensions | Format | Description / States | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `ui_icon_research` | 64x64 | SVG | Microscope or atom icon. States: Default, Hover, Disabled. | High |
| `ui_icon_production`| 64x64 | SVG | Factory or gear icon. States: Default, Hover, Disabled. | High |
| `ui_icon_fleet` | 64x64 | SVG | Spaceship silhouette. States: Default, Hover, Disabled. | High |
| `ui_icon_diplomacy` | 64x64 | SVG | Handshake or speech bubble. States: Default, Hover, Disabled. | High |
| `ui_icon_finance` | 64x64 | SVG | Coin stack or BC symbol. States: Default, Hover, Disabled. | High |
| `ui_slider_thumb` | 24x48 | SVG | The draggable handle for planetary production sliders. | High |
| `ui_slider_track` | 200x12 | SVG | The background track for sliders. | High |
| `ui_frame_modal` | 9-slice | PNG/SVG | Glassmorphism container border for popups (requires 9-slice). | High |
| `ui_cursor_default` | 32x32 | PNG | Custom sci-fi cursor (Standard pointer). | Medium |
| `ui_cursor_target` | 32x32 | PNG | Crosshair cursor for combat/bombardment. | Medium |

## 2. Race Portraits
Used in the Diplomacy Screen, High Council, and Game Setup.

| Asset Name | Dimensions | Format | Description / States | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `portrait_hamster_leader` | 400x500 | WEBP | Hamster emperor. States: Neutral, Happy, Angry. | High |
| `portrait_mouse_leader` | 400x500 | WEBP | Mouse leader. States: Neutral, Happy, Angry. | High |
| `portrait_rat_leader` | 400x500 | WEBP | Rat warlord. States: Neutral, Happy, Angry. | High |
| `portrait_guinea_pig_leader`| 400x500 | WEBP | Guinea Pig diplomat. States: Neutral, Happy, Angry. | High |
| `portrait_ferret_leader` | 400x500 | WEBP | Ferret general. States: Neutral, Happy, Angry. | High |
| `portrait_chameleon_leader` | 400x500 | WEBP | Chameleon spy-master. States: Neutral, Happy, Angry. | High |
| `portrait_budgie_leader` | 400x500 | WEBP | Budgie avian ruler. States: Neutral, Happy, Angry. | High |
| `portrait_ant_leader` | 400x500 | WEBP | Ant hive-mind queen. States: Neutral, Happy, Angry. | High |
| `portrait_rabbit_leader` | 400x500 | WEBP | Rabbit ecologist. States: Neutral, Happy, Angry. | High |
| `portrait_hermit_crab_leader`| 400x500 | WEBP | Hermit crab technologist. States: Neutral, Happy, Angry. | High |

## 3. Planet Maps & Textures
Used in the Galaxy Map and Colony View screens.

| Asset Name | Dimensions | Format | Description / States | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `planet_terran` | 256x256 | WEBP | Earth-like planet. Needs seamless texture map for rotation. | High |
| `planet_ocean` | 256x256 | WEBP | Water world. | High |
| `planet_arid` | 256x256 | WEBP | Desert/Dune-like world. | High |
| `planet_tundra` | 256x256 | WEBP | Ice/snow world. | High |
| `planet_jungle` | 256x256 | WEBP | Swamp/Forest world. | High |
| `planet_toxic` | 256x256 | WEBP | Acidic, unlivable atmosphere. | Medium |
| `planet_radiated` | 256x256 | WEBP | Glowing, scorched world. | Medium |
| `planet_barren` | 256x256 | WEBP | Moon-like rock. | High |
| `planet_dead` | 256x256 | WEBP | Completely shattered/lifeless core. | Medium |
| `planet_gas_giant` | 256x256 | WEBP | Swirling gas giant. | Medium |
| `bg_starfield_layer1` | 1920x1080 | WEBP | Distant stars (parallax layer 1, tileable). | High |
| `bg_starfield_layer2` | 1920x1080 | WEBP | Medium stars/nebulae (parallax layer 2, tileable). | High |

## 4. Ship Hulls & Combat Sprites
Used in the Ship Designer and Tactical Combat grid. 
*Note: Due to ship customization, ships are dynamically tinted via code based on the owning empire's color.*

| Asset Name | Dimensions | Format | Description / States | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `hull_small_01` | 32x32 | WEBP | Fighter/Scout chassis. | High |
| `hull_medium_01` | 64x64 | WEBP | Destroyer chassis. | High |
| `hull_large_01` | 128x128 | WEBP | Cruiser chassis. | High |
| `hull_huge_01` | 256x256 | WEBP | Battleship/Titan chassis. | High |
| `hull_colony_ship` | 128x128 | WEBP | Unarmed colony transport. | High |
| `vfx_engine_plume` | 32x32 | Sprite | Spritesheet for exhaust plumes (4 frames). | Medium |
| `vfx_weapon_laser` | 64x16 | PNG | Standard beam projectile. | High |
| `vfx_weapon_missile` | 32x16 | PNG | Standard missile projectile. | High |
| `vfx_shield_impact` | 64x64 | Sprite | Energy ripple when shield is hit (6 frames). | Medium |
| `vfx_hull_explosion` | 128x128 | Sprite | Ship destruction animation (12 frames). | High |

## 5. Technology Icons
Used in the Tech Tree and Research selection UI.

| Asset Name | Dimensions | Format | Description / States | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `tech_category_weapons` | 64x64 | SVG | Crosshairs or laser icon. | High |
| `tech_category_propulsion`| 64x64 | SVG | Engine thruster icon. | High |
| `tech_category_construction`| 64x64 | SVG | Construction crane or metal plates. | High |
| `tech_category_planetology` | 64x64 | SVG | DNA strand or terraforming dome. | High |
| `tech_category_computers` | 64x64 | SVG | Circuit board or AI eye. | High |
| `tech_category_forcefields` | 64x64 | SVG | Energy bubble. | High |
| `tech_icon_generic_weapon` | 48x48 | SVG | Generic weapon fallback. | Medium |
| `tech_icon_generic_armor` | 48x48 | SVG | Generic armor fallback. | Medium |
| `tech_icon_generic_shield` | 48x48 | SVG | Generic shield fallback. | Medium |

## Asset Pipeline Rules
1. **Naming Convention:** All assets MUST follow `[category]_[specific_name]_[state].[extension]` (e.g., `ui_btn_next_hover.svg`).
2. **Pathing:** All UI assets belong in `/assets/ui/`. All game world sprites belong in `/assets/sprites/`.
3. **Compression:** Run all PNGs/WEBPs through a lossless compressor (e.g., ImageOptim) before PR submission.
4. **Placeholder Integration:** If a final asset is not ready, engineers must create a hot-pink (`#FF00FF`) exact-dimension placeholder `<div>` or `.png` to ensure layout constraints hold up prior to final integration.
