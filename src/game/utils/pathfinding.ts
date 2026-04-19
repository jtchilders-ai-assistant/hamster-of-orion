/**
 * Pathfinding utilities — pure TypeScript, NO DOM.
 * src/game/utils/pathfinding.ts
 *
 * Dijkstra's algorithm for fleet routing through the galaxy graph.
 */

import { Galaxy, SystemId } from '../state';
import { distance } from './math';

export interface PathResult {
  path: SystemId[];
  totalDistance: number;
}

/**
 * Find the shortest path between two star systems using Dijkstra.
 * Returns the path (list of system IDs including start and end)
 * and total travel distance.
 */
export function findPath(
  galaxy: Galaxy,
  fromId: SystemId,
  toId: SystemId,
  maxRange: number,
): PathResult | null {
  const systems = galaxy.systems.byId;

  if (!(fromId in systems) || !(toId in systems)) return null;
  if (fromId === toId) return { path: [fromId], totalDistance: 0 };

  const dist: Record<SystemId, number> = {};
  const prev: Record<SystemId, SystemId | null> = {};
  const unvisited = new Set<SystemId>(galaxy.systems.allIds);

  for (const id of galaxy.systems.allIds) {
    dist[id] = Infinity;
    prev[id] = null;
  }
  dist[fromId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited with smallest dist
    let current: SystemId | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      if (dist[id] < minDist) {
        minDist = dist[id];
        current = id;
      }
    }

    if (current === null || current === toId) break;
    unvisited.delete(current);

    const currentSystem = systems[current];

    // Check all other systems as potential neighbors within range
    for (const neighborId of unvisited) {
      const neighbor = systems[neighborId];
      const d = distance(
        currentSystem.coordinates.x, currentSystem.coordinates.y,
        neighbor.coordinates.x, neighbor.coordinates.y,
      );
      if (d > maxRange) continue;

      const alt = dist[current] + d;
      if (alt < dist[neighborId]) {
        dist[neighborId] = alt;
        prev[neighborId] = current;
      }
    }
  }

  if (!isFinite(dist[toId])) return null;

  // Reconstruct path
  const path: SystemId[] = [];
  let cur: SystemId | null = toId;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev[cur];
  }

  return { path, totalDistance: dist[toId] };
}
