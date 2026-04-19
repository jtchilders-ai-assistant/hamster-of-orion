# Rendering Pipeline

## Overview

Hamster of Orion uses HTML5 Canvas for the Galaxy Map and Tactical Combat, with HTML/CSS for UI panels. This document details the rendering architecture and implementation.

---

## Canvas Architecture

### Multi-Layer Rendering

```
┌─────────────────────────────────┐
│  UI Layer (SVG/HTML)            │ ← Buttons, panels, text
├─────────────────────────────────┤
│  Effects Layer (Canvas)         │ ← Particles, animations
├─────────────────────────────────┤
│  Foreground Layer (Canvas)      │ ← Fleets, selections
├─────────────────────────────────┤
│  Objects Layer (Canvas)         │ ← Stars, planets
├─────────────────────────────────┤
│  Background Layer (Canvas)      │ ← Starfield, grid
└─────────────────────────────────┘
```

**Benefits**:
- Render only changed layers
- Independent update frequencies
- Easier debugging and testing
- Better performance

---

## Galaxy Map Renderer

### Core Renderer Class

```javascript
class GalaxyMapRenderer {
  constructor(canvasElement, store) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,  // Opaque background = faster
      desynchronized: true  // Lower latency
    });

    this.store = store;

    // Layers
    this.layers = {
      background: this.createOffscreenCanvas(),
      objects: this.createOffscreenCanvas(),
      foreground: this.createOffscreenCanvas(),
      effects: this.createOffscreenCanvas()
    };

    // Camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      targetZoom: 1.0,
      velocity: { x: 0, y: 0 }
    };

    // Performance
    this.frameTime = 0;
    this.fps = 60;
    this.targetFrameTime = 1000 / this.fps;
    this.dirty = new Set(['background', 'objects']);  // Which layers need redraw

    // Spatial index
    this.quadTree = null;

    // Asset cache
    this.sprites = new Map();
    this.fonts = new Map();

    // Animation
    this.animationFrame = null;
    this.lastFrame = performance.now();
  }

  /**
   * Main render loop
   */
  render(timestamp) {
    const deltaTime = timestamp - this.lastFrame;

    // Skip if not enough time elapsed (frame rate limiting)
    if (deltaTime < this.targetFrameTime) {
      this.animationFrame = requestAnimationFrame((t) => this.render(t));
      return;
    }

    // Update camera (smooth interpolation)
    this.updateCamera(deltaTime);

    // Render only if something changed
    if (this.dirty.size > 0) {
      this.composeLayers();
      this.dirty.clear();
    }

    this.lastFrame = timestamp;
    this.animationFrame = requestAnimationFrame((t) => this.render(t));
  }

  /**
   * Compose all layers onto main canvas
   */
  composeLayers() {
    // Clear main canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(this.camera.x, this.camera.y);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);

    // Draw each layer if dirty
    if (this.dirty.has('background')) {
      this.renderBackground();
    }
    this.ctx.drawImage(this.layers.background, 0, 0);

    if (this.dirty.has('objects')) {
      this.renderObjects();
    }
    this.ctx.drawImage(this.layers.objects, 0, 0);

    if (this.dirty.has('foreground')) {
      this.renderForeground();
    }
    this.ctx.drawImage(this.layers.foreground, 0, 0);

    if (this.dirty.has('effects')) {
      this.renderEffects();
    }
    this.ctx.drawImage(this.layers.effects, 0, 0);

    this.ctx.restore();
  }

  /**
   * Background: Starfield and grid
   */
  renderBackground() {
    const ctx = this.layers.background.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Starfield (parallax effect)
    this.renderStarfield(ctx);

    // Optional grid
    if (this.store.getState().ui.settings.showGrid) {
      this.renderGrid(ctx);
    }
  }

  /**
   * Objects: Star systems, planets
   */
  renderObjects() {
    const ctx = this.layers.objects.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const state = this.store.getState();
    const systems = state.galaxy.systems.byId;
    const fogOfWar = state.galaxy.fogOfWar[state.player.id];

    // Frustum culling: Only render visible systems
    const visibleSystems = this.getVisibleSystems(systems);

    for (const system of visibleSystems) {
      // Skip if in fog of war
      if (fogOfWar.has(system.id)) {
        this.renderFoggedSystem(ctx, system);
        continue;
      }

      // Render system
      this.renderStarSystem(ctx, system);
    }
  }

  /**
   * Foreground: Fleets, selections, UI overlays
   */
  renderForeground() {
    const ctx = this.layers.foreground.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const state = this.store.getState();

    // Render fleets
    const fleets = state.fleets.byId;
    for (const fleetId in fleets) {
      const fleet = fleets[fleetId];
      this.renderFleet(ctx, fleet);
    }

    // Render movement paths
    this.renderFleetPaths(ctx);

    // Render selections
    const selected = state.ui.selectedSystem;
    if (selected) {
      this.renderSelection(ctx, state.galaxy.systems.byId[selected]);
    }

    // Render range indicators
    this.renderRangeIndicators(ctx);
  }

  /**
   * Effects: Particles, animations, explosions
   */
  renderEffects() {
    const ctx = this.layers.effects.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Render active particle systems
    for (const particle of this.particles) {
      this.renderParticle(ctx, particle);
    }
  }

  /**
   * Viewport culling
   */
  getVisibleSystems(systems) {
    const viewport = this.getViewportBounds();

    // Use QuadTree for fast spatial query
    if (this.quadTree) {
      return this.quadTree.query(viewport);
    }

    // Fallback: check all systems
    return Object.values(systems).filter(sys =>
      this.isInViewport(sys.coordinates, viewport)
    );
  }

  getViewportBounds() {
    const { x, y, zoom } = this.camera;
    const w = this.canvas.width / zoom;
    const h = this.canvas.height / zoom;

    return {
      left: -x / zoom,
      top: -y / zoom,
      right: (-x + w) / zoom,
      bottom: (-y + h) / zoom
    };
  }

  /**
   * Mark layers as dirty when state changes
   */
  markDirty(layers) {
    for (const layer of layers) {
      this.dirty.add(layer);
    }
  }

  /**
   * Smooth camera interpolation
   */
  updateCamera(deltaTime) {
    const LERP_SPEED = 0.1;

    // Zoom interpolation
    if (Math.abs(this.camera.zoom - this.camera.targetZoom) > 0.01) {
      this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * LERP_SPEED;
      this.markDirty(['objects', 'foreground', 'effects']);
    }

    // Position interpolation (if following target)
    if (this.camera.target) {
      const targetPos = this.getSystemPosition(this.camera.target);
      const dx = targetPos.x - this.camera.x;
      const dy = targetPos.y - this.camera.y;

      this.camera.x += dx * LERP_SPEED;
      this.camera.y += dy * LERP_SPEED;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        this.markDirty(['objects', 'foreground', 'effects']);
      }
    }
  }

  /**
   * Create offscreen canvas for layer
   */
  createOffscreenCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    return canvas;
  }
}
```

---

## Star System Rendering

```javascript
/**
 * Render a single star system
 */
renderStarSystem(ctx, system) {
  const { x, y } = system.coordinates;

  // Star glow (behind star)
  this.renderStarGlow(ctx, system, x, y);

  // Star itself
  this.renderStar(ctx, system, x, y);

  // Orbit rings
  if (this.camera.zoom > 0.7) {  // Only at close zoom
    this.renderOrbits(ctx, system, x, y);
  }

  // Planets (at very close zoom)
  if (this.camera.zoom > 1.2) {
    this.renderPlanets(ctx, system, x, y);
  }

  // System name
  this.renderSystemName(ctx, system, x, y);

  // Owner indicator
  if (system.ownerId) {
    this.renderOwnerFlag(ctx, system, x, y);
  }

  // Special markers
  if (system.isOrion) {
    this.renderOrionMarker(ctx, x, y);
  }
  if (system.hasArtifacts) {
    this.renderArtifactsMarker(ctx, x, y);
  }
}

renderStar(ctx, system, x, y) {
  // Get star color based on type
  const starColors = {
    'yellow': '#ffeb3b',
    'green': '#4caf50',
    'red': '#ff6b6b',
    'blue': '#2196f3',
    'white': '#ffffff',
    'purple': '#9c27b0'
  };

  const color = starColors[system.starType] || '#ffffff';
  const size = 8 * this.camera.zoom;

  // Draw star
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Corona effect
  const gradient = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 1.5);
  gradient.addColorStop(0, `${color}80`);  // 50% alpha
  gradient.addColorStop(1, `${color}00`);  // Transparent

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
  ctx.fill();
}

renderSystemName(ctx, system, x, y) {
  // Only render if zoomed in enough
  if (this.camera.zoom < 0.5) return;

  ctx.save();
  ctx.font = `${12 * this.camera.zoom}px "Orbitron", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Shadow for readability
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;

  ctx.fillText(system.name, x, y + 15);
  ctx.restore();
}
```

---

## Fleet Rendering

```javascript
/**
 * Render fleet icon
 */
renderFleet(ctx, fleet) {
  const system = this.getSystemById(fleet.systemId);
  if (!system) return;

  const { x, y } = system.coordinates;
  const offset = 20;  // Offset from star

  // Fleet icon (triangle)
  const empireColor = this.getEmpireColor(fleet.ownerId);
  const size = 10 * this.camera.zoom;

  ctx.save();
  ctx.translate(x + offset, y - offset);

  // Draw triangle
  ctx.fillStyle = empireColor;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size * 0.866, size * 0.5);
  ctx.lineTo(size * 0.866, size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ship count badge
  if (fleet.shipIds.length > 1) {
    this.renderFleetBadge(ctx, fleet.shipIds.length);
  }

  ctx.restore();

  // Movement indicator (if moving)
  if (fleet.destination) {
    this.renderFleetPath(ctx, fleet);
  }
}

renderFleetPath(ctx, fleet) {
  const start = this.getSystemPosition(fleet.systemId);
  const end = this.getSystemPosition(fleet.destination);

  ctx.save();
  ctx.strokeStyle = this.getEmpireColor(fleet.ownerId);
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // Arrow at destination
  this.renderArrow(ctx, start, end);

  ctx.restore();
}
```

---

## Tactical Combat Renderer

```javascript
class CombatRenderer {
  constructor(canvasElement, store) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.store = store;

    // Hex grid settings
    this.hexSize = 40;  // Radius
    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;

    // Assets
    this.shipSprites = new Map();
    this.weaponEffects = new Map();

    // Animation state
    this.animations = [];
  }

  render() {
    const state = this.store.getState();
    const combat = state.combat;

    if (!combat.active) return;

    this.clear();

    // Render hex grid
    this.renderHexGrid(combat.grid);

    // Render ships
    for (const participant of Object.values(combat.participants)) {
      for (const ship of participant.ships) {
        this.renderCombatShip(ship);
      }
    }

    // Render UI overlays
    this.renderCombatUI(combat);

    // Render animations
    for (const anim of this.animations) {
      this.renderAnimation(anim);
    }

    requestAnimationFrame(() => this.render());
  }

  /**
   * Render hexagonal grid
   */
  renderHexGrid(grid) {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const hex = grid.hexes[`${x},${y}`];
        this.renderHex(hex, x, y);
      }
    }
  }

  renderHex(hex, x, y) {
    const center = this.hexToPixel(x, y);

    ctx.save();
    ctx.translate(center.x, center.y);

    // Hex outline
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    this.drawHexagon(this.hexSize);
    ctx.stroke();

    // Hex fill based on type
    switch (hex.type) {
      case 'asteroid':
        ctx.fillStyle = '#666666';
        ctx.fill();
        break;
      case 'nebula':
        ctx.fillStyle = '#ff00ff20';  // Semi-transparent purple
        ctx.fill();
        break;
    }

    // Highlight if selected/targeted
    if (hex.coord.equals(this.selectedHex)) {
      ctx.fillStyle = '#00ff0040';
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Convert hex coordinates to pixel coordinates
   */
  hexToPixel(x, y) {
    const pixelX = this.hexWidth * (x + 0.5 * (y % 2));
    const pixelY = this.hexHeight * 0.75 * y;
    return { x: pixelX, y: pixelY };
  }

  /**
   * Draw hexagon shape
   */
  drawHexagon(size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }

  /**
   * Render ship on hex grid
   */
  renderCombatShip(ship) {
    const pos = this.hexToPixel(ship.position.x, ship.position.y);

    // Get ship sprite
    const sprite = this.shipSprites.get(ship.designId);
    if (sprite) {
      ctx.drawImage(sprite, pos.x - 20, pos.y - 20, 40, 40);
    } else {
      // Fallback: draw simple triangle
      this.drawShipFallback(pos, ship.ownerId);
    }

    // HP bar
    this.renderHealthBar(pos, ship.hp, ship.maxHp);

    // Shield indicator
    if (ship.shieldHp > 0) {
      this.renderShieldEffect(pos, ship.shieldHp / ship.maxShieldHp);
    }
  }

  /**
   * Weapon fire animation
   */
  playWeaponEffect(source, target, weaponType) {
    const animation = {
      type: weaponType,
      source: this.hexToPixel(source.x, source.y),
      target: this.hexToPixel(target.x, target.y),
      progress: 0,
      duration: weaponType === 'beam' ? 300 : 800  // ms
    };

    this.animations.push(animation);

    // Auto-remove when done
    setTimeout(() => {
      const index = this.animations.indexOf(animation);
      if (index > -1) {
        this.animations.splice(index, 1);
      }
    }, animation.duration);
  }

  renderAnimation(anim) {
    switch (anim.type) {
      case 'beam':
        this.renderBeamWeapon(anim);
        break;
      case 'missile':
        this.renderMissileWeapon(anim);
        break;
      case 'explosion':
        this.renderExplosion(anim);
        break;
    }

    anim.progress += 16 / anim.duration;  // 60 FPS
  }

  renderBeamWeapon(anim) {
    ctx.save();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1 - anim.progress;

    ctx.beginPath();
    ctx.moveTo(anim.source.x, anim.source.y);
    ctx.lineTo(anim.target.x, anim.target.y);
    ctx.stroke();

    ctx.restore();
  }
}
```

---

## Performance Optimizations

### 1. Object Pooling

```javascript
/**
 * Reuse canvas objects instead of creating new ones
 */
class ObjectPool {
  constructor(factory, size = 100) {
    this.factory = factory;
    this.pool = [];
    this.active = [];

    // Pre-create objects
    for (let i = 0; i < size; i++) {
      this.pool.push(factory());
    }
  }

  acquire() {
    let obj = this.pool.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.active.push(obj);
    return obj;
  }

  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      obj.reset();  // Clean state
      this.pool.push(obj);
    }
  }

  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
}

// Usage
const particlePool = new ObjectPool(() => new Particle(), 500);
const particle = particlePool.acquire();
// ... use particle
particlePool.release(particle);
```

### 2. Texture Atlas

```javascript
/**
 * Combine multiple sprites into single texture
 * Reduces draw calls dramatically
 */
class TextureAtlas {
  constructor(imageUrl, spriteData) {
    this.image = new Image();
    this.image.src = imageUrl;
    this.sprites = spriteData;  // { 'ship_scout': { x, y, w, h }, ... }
  }

  draw(ctx, spriteName, dx, dy, dw, dh) {
    const sprite = this.sprites[spriteName];
    if (!sprite) return;

    ctx.drawImage(
      this.image,
      sprite.x, sprite.y, sprite.w, sprite.h,  // Source
      dx, dy, dw, dh                            // Destination
    );
  }
}

// Usage
const atlas = new TextureAtlas('assets/ships.png', SHIP_SPRITE_DATA);
atlas.draw(ctx, 'ship_scout', x, y, 40, 40);
```

### 3. Dirty Rectangle

```javascript
/**
 * Only redraw changed regions
 */
class DirtyRectangleManager {
  constructor(width, height) {
    this.dirtyRegions = [];
    this.width = width;
    this.height = height;
  }

  markDirty(x, y, w, h) {
    this.dirtyRegions.push({ x, y, w, h });
  }

  clear() {
    this.dirtyRegions = [];
  }

  render(ctx, renderFunc) {
    if (this.dirtyRegions.length === 0) return;

    for (const region of this.dirtyRegions) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(region.x, region.y, region.w, region.h);
      ctx.clip();

      renderFunc(ctx, region);

      ctx.restore();
    }

    this.clear();
  }
}
```

---

## Asset Management

```javascript
/**
 * Centralized asset loading and caching
 */
class AssetManager {
  constructor() {
    this.images = new Map();
    this.sounds = new Map();
    this.fonts = new Map();
    this.loading = new Map();
  }

  async loadImage(url) {
    // Check cache
    if (this.images.has(url)) {
      return this.images.get(url);
    }

    // Check if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    // Load image
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });

    this.loading.set(url, promise);
    return promise;
  }

  async loadManifest(manifest) {
    const promises = Object.entries(manifest).map(([key, url]) =>
      this.loadImage(url).then(img => ({ key, img }))
    );

    const results = await Promise.all(promises);
    return results.reduce((acc, { key, img }) => {
      acc[key] = img;
      return acc;
    }, {});
  }

  getImage(url) {
    return this.images.get(url);
  }
}

// Usage
const assets = new AssetManager();
await assets.loadManifest({
  'star_red': '/assets/stars/red.png',
  'star_yellow': '/assets/stars/yellow.png',
  'ship_scout': '/assets/ships/scout.png'
});

const starSprite = assets.getImage('star_red');
```

---

## Integration with React

```jsx
/**
 * React component wrapping Canvas renderer
 */
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GalaxyMapRenderer } from './renderers/GalaxyMapRenderer';

export function GalaxyMapCanvas() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  const store = useStore();

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new GalaxyMapRenderer(canvasRef.current, store);
    rendererRef.current = renderer;

    // Start render loop
    renderer.start();

    // Cleanup
    return () => {
      renderer.stop();
    };
  }, []);

  // Mark dirty when relevant state changes
  const systems = useSelector(state => state.galaxy.systems);
  const camera = useSelector(state => state.ui.camera);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.markDirty(['objects', 'foreground']);
    }
  }, [systems, camera]);

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
```

---

All rendering optimized for 60 FPS at 1920×1080. Next: `ai-implementation.md` for AI decision trees.
