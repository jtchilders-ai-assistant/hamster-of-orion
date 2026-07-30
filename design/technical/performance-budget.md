# Performance Budget & Technical SLA Specification

## Overview

This document specifies the performance SLAs, framerate targets, spatial indexing structures, garbage collection optimization rules, and memory budgets for **Hamster of Orion**.

**Reference Materials:**
- [Technical Architecture](file:///Users/jchilders/mywork/hamster-of-orion/design/technical/ARCHITECTURE.md)
- [Rendering Pipeline](file:///Users/jchilders/mywork/hamster-of-orion/design/technical/rendering-pipeline.md)

---

## 1. Frame Budget & Latency SLA

| Performance Metric | SLA Target | Hard Limit | Verification Method |
| :--- | :--- | :--- | :--- |
| **Main Loop Framerate** | **60.0 FPS** | 45.0 FPS | `requestAnimationFrame` frame delta profiling |
| **Frame Budget Allocation** | **16.6 ms / frame** | 22.2 ms | Chrome DevTools Performance Profiler |
| **Turn Processing Time** | **< 250 ms** | 500 ms | Web Worker turn tick execution timer |
| **Star Hover Delay** | **< 16 ms** | 33 ms | Spatial QuadTree lookup profiling |
| **Modal Open Latency** | **< 50 ms** | 100 ms | DOM mount to frame render timer |

### Frame Time Breakdown (16.6ms Budget)
- **Game Logic & Input**: `3.0 ms`
- **Spatial QuadTree & Pathfinding**: `2.5 ms`
- **Canvas / WebGL Draw Calls**: `7.0 ms`
- **DOM Overlay & Tooltip Reflow**: `2.5 ms`
- **Headroom Margin**: `1.6 ms`

---

## 2. Spatial Indexing & Spatial Partitioning

To maintain 60 FPS in galaxies with 108 star systems and 1,000+ moving fleet nodes:

```
┌────────────────────────┬────────────────────────┐
│                        │                        │
│     NW QUADTREE        │     NE QUADTREE        │
│   (Stars & Fleets)     │   (Stars & Fleets)     │
│                        │                        │
├────────────────────────┼────────────────────────┤
│                        │                        │
│     SW QUADTREE        │     SE QUADTREE        │
│   (Stars & Fleets)     │   (Stars & Fleets)     │
│                        │                        │
└────────────────────────┴────────────────────────┘
```

- **Algorithm**: 2D QuadTree spatial index updated dynamically on fleet position changes.
- **Lookup Complexity**: O(log N) point query for mouse hovers and star selection instead of O(N) linear iteration.
- **Fleet Range Queries**: Circle collision queries against QuadTree bounds for scanner detection and nebula masking.

---

## 3. Memory SLA & Garbage Collection Optimization

- **Maximum Heap Memory SLA**: `< 150 MB` total JS heap footprint.
- **Object Pooling**:
  - Tactical combat laser beams, missile sprites, and particle effects use static object pools (`PoolSize = 500`).
  - No `new Particle()` allocations during active combat frames.
- **Canvas Render Buffers**: Offscreen Canvas caching for static star backgrounds, nebula dust, and star system icons.
