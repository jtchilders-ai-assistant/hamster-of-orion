/**
 * Galaxy generator — pure TypeScript, NO DOM.
 * src/game/generators/galaxy.ts
 *
 * Implements the full galaxy generation algorithm per design/galaxy/generation-algorithm.md.
 * All functions are pure (no side effects). Uses the seeded PRNG from utils/random.ts.
 */

import {
  Galaxy,
  GalaxySize,
  GalaxyShape,
  GalaxyRegion,
  StarType,
  PlanetType,
  PlanetSize,
  ResourceLevel,
  StarSystem,
  Planet,
  SystemId,
  PlanetId,
  Nebula,
  Cluster,
  GalaxyCoord,
  EmpireId,
} from '../state';
import { seedRandom, seededRandom, randomInt, randomPick } from '../utils/random';
import { distance, clamp } from '../utils/math';

// ── Galaxy size configuration ──────────────────────────────────────────────

export interface GalaxyConfig {
  starCount: number;
  width: number;
  height: number;
  minStarDistance: number;
  minHomeworldDistance: number;
  nebulaCountMin: number;
  nebulaCountMax: number;
  artifactsCountMin: number;
  artifactsCountMax: number;
  clusterCountMin: number;
  clusterCountMax: number;
}

const GALAXY_CONFIGS: Record<GalaxySize, GalaxyConfig> = {
  small: {
    starCount: 24, width: 500, height: 400,
    minStarDistance: 35, minHomeworldDistance: 150,
    nebulaCountMin: 1, nebulaCountMax: 2,
    artifactsCountMin: 2, artifactsCountMax: 3,
    clusterCountMin: 2, clusterCountMax: 4,
  },
  medium: {
    starCount: 48, width: 700, height: 560,
    minStarDistance: 35, minHomeworldDistance: 175,
    nebulaCountMin: 2, nebulaCountMax: 3,
    artifactsCountMin: 3, artifactsCountMax: 4,
    clusterCountMin: 4, clusterCountMax: 6,
  },
  large: {
    starCount: 70, width: 850, height: 680,
    minStarDistance: 35, minHomeworldDistance: 200,
    nebulaCountMin: 2, nebulaCountMax: 4,
    artifactsCountMin: 3, artifactsCountMax: 5,
    clusterCountMin: 5, clusterCountMax: 8,
  },
  huge: {
    starCount: 108, width: 1000, height: 800,
    minStarDistance: 35, minHomeworldDistance: 225,
    nebulaCountMin: 3, nebulaCountMax: 5,
    artifactsCountMin: 4, artifactsCountMax: 6,
    clusterCountMin: 7, clusterCountMax: 12,
  },
};

// ── Constants ──────────────────────────────────────────────────────────────

const CLUSTER_RADIUS = 60;
const CLUSTER_PLACEMENT_CHANCE = 0.70;
const NEBULA_RESOURCE_BONUS_CHANCE = 0.40;
const STARTING_RANGE = 45;
const MAX_WARP_RANGE = 135;
const NEBULA_MIN_RADIUS = 60;
const NEBULA_MAX_RADIUS = 120;

// ── Star names pool ────────────────────────────────────────────────────────

const STAR_NAMES: readonly string[] = [
  'Altair', 'Antares', 'Arcturus', 'Betelgeuse', 'Capella',
  'Deneb', 'Fomalhaut', 'Pollux', 'Procyon', 'Regulus',
  'Rigel', 'Sirius', 'Spica', 'Vega', 'Aldebaran',
  'Canopus', 'Castor', 'Centauri', 'Cygni', 'Draconis',
  'Eridani', 'Hydrae', 'Leonis', 'Lyrae', 'Ophiuchi',
  'Orionis', 'Pegasi', 'Phoenicis', 'Sagittarii', 'Scorpii',
  'Serpentis', 'Tauri', 'Ursae', 'Velorum', 'Virginis',
  'Andromedae', 'Aquarii', 'Arietis', 'Bootis', 'Cancri',
  'Canis', 'Carinae', 'Cassiopeiae', 'Cephei', 'Ceti',
  'Columbae', 'Coronae', 'Corvi', 'Crateris', 'Crucis',
  'Delphini', 'Doradus', 'Equulei', 'Fornacis', 'Geminorum',
  'Gruis', 'Herculis', 'Horologii', 'Hydri', 'Indi',
  'Lacertae', 'Leporis', 'Librae', 'Lupi', 'Lyncis',
  'Mensae', 'Monocerotis', 'Muscae', 'Normae', 'Octantis',
  'Pavonis', 'Persei', 'Pictoris', 'Piscium', 'Puppis',
  'Pyxidis', 'Reticuli', 'Sagittae', 'Sculptoris', 'Scuti',
  'Sextantis', 'Trianguli', 'Tucanae', 'Volantis', 'Vulpeculae',
  'Naos', 'Thuban', 'Mira', 'Achernar', 'Hadar',
  'Acrux', 'Mimosa', 'Alioth', 'Alkaid', 'Dubhe',
  'Merak', 'Phecda', 'Megrez', 'Mizar', 'Alcor',
  'Polaris', 'Kochab', 'Pherkad', 'Rastaban', 'Eltanin',
  'Grumium', 'Kuma', 'Giausar', 'Tyl', 'Alderamin',
];

// ── Weighted tables ────────────────────────────────────────────────────────

const STAR_COLOR_WEIGHTS: Record<StarType, number> = {
  yellow: 25, green: 15, red: 25, blue: 15, white: 12, purple: 8,
};

const ENVIRONMENT_TABLES: Record<StarType, Record<PlanetType, number>> = {
  yellow: {
    terran: 20, jungle: 15, ocean: 15, arid: 10, steppe: 10,
    desert: 10, minimal: 8, tundra: 5, barren: 4, dead: 2,
    inferno: 1, toxic: 0, radiated: 0, gaia: 0, gas_giant: 0,
  },
  green: {
    terran: 15, jungle: 15, ocean: 12, arid: 12, steppe: 12,
    desert: 10, minimal: 10, tundra: 6, barren: 4, dead: 2,
    inferno: 1, toxic: 1, radiated: 0, gaia: 0, gas_giant: 0,
  },
  red: {
    terran: 5, jungle: 5, ocean: 5, arid: 8, steppe: 8,
    desert: 12, minimal: 12, tundra: 15, barren: 12, dead: 10,
    inferno: 4, toxic: 3, radiated: 1, gaia: 0, gas_giant: 0,
  },
  blue: {
    terran: 5, jungle: 3, ocean: 5, arid: 5, steppe: 5,
    desert: 8, minimal: 10, tundra: 8, barren: 12, dead: 12,
    inferno: 10, toxic: 10, radiated: 7, gaia: 0, gas_giant: 0,
  },
  white: {
    terran: 2, jungle: 2, ocean: 3, arid: 5, steppe: 5,
    desert: 8, minimal: 8, tundra: 8, barren: 12, dead: 15,
    inferno: 15, toxic: 10, radiated: 7, gaia: 0, gas_giant: 0,
  },
  purple: {
    terran: 0, jungle: 0, ocean: 2, arid: 3, steppe: 3,
    desert: 5, minimal: 7, tundra: 8, barren: 15, dead: 20,
    inferno: 12, toxic: 12, radiated: 13, gaia: 0, gas_giant: 0,
  },
};

const SIZE_DISTRIBUTION: Record<PlanetSize, number> = {
  tiny: 15, small: 25, medium: 30, large: 20, huge: 10,
};

const BASE_POP_BY_SIZE: Record<PlanetSize, number> = {
  tiny: 20, small: 40, medium: 60, large: 80, huge: 100,
};

const RESOURCE_TABLES: Record<StarType, Record<ResourceLevel, number>> = {
  yellow: { ultra_poor: 5, poor: 15, normal: 60, rich: 15, ultra_rich: 5 },
  green:  { ultra_poor: 8, poor: 17, normal: 55, rich: 15, ultra_rich: 5 },
  red:    { ultra_poor: 12, poor: 23, normal: 50, rich: 12, ultra_rich: 3 },
  blue:   { ultra_poor: 5, poor: 10, normal: 45, rich: 28, ultra_rich: 12 },
  white:  { ultra_poor: 10, poor: 15, normal: 40, rich: 25, ultra_rich: 10 },
  purple: { ultra_poor: 3, poor: 7, normal: 30, rich: 35, ultra_rich: 25 },
};

const ENVIRONMENT_POP_MULT: Record<PlanetType, number> = {
  gaia: 1.0, terran: 1.0, jungle: 0.9, ocean: 0.9,
  arid: 0.8, steppe: 0.8, desert: 0.7, minimal: 0.6,
  tundra: 0.5, barren: 0.5, dead: 0.4, inferno: 0.4,
  toxic: 0.3, radiated: 0.3, gas_giant: 0.0,
};

const ENVIRONMENT_QUALITY_SCORES: Record<PlanetType, number> = {
  gaia: 40, terran: 35, jungle: 32, ocean: 30,
  arid: 25, steppe: 25, desert: 20, minimal: 15,
  tundra: 10, barren: 8, dead: 5, inferno: 3,
  toxic: 2, radiated: 0, gas_giant: 0,
};

const RESOURCE_QUALITY_SCORES: Record<ResourceLevel, number> = {
  ultra_poor: 0, poor: 8, normal: 15, rich: 25, ultra_rich: 30,
};

const SIZE_QUALITY_SCORES: Record<PlanetSize, number> = {
  tiny: 5, small: 12, medium: 20, large: 26, huge: 30,
};

const ROMAN_NUMERALS = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// ── Internal generation types ───────────────────────────────────────────────

/** Mutable internal star used during generation before freezing into StarSystem */
interface InternalStar {
  id: string;
  name: string;
  x: number;
  y: number;
  color: StarType;
  inNebula: boolean;
  nebulaId: string | null;
  region: GalaxyRegion;
  clusterId: string | null;
  isOrion: boolean;
  isHomeworld: boolean;
  isArtifacts: boolean;
  planet: InternalPlanet | null;
}

interface InternalPlanet {
  environment: PlanetType;
  size: PlanetSize;
  basePop: number;
  resources: ResourceLevel;
  researchMultiplier: number;
  hasGuardian: boolean;
  startingPopulation: number | null;
  startingFactories: number | null;
}

interface ClusterCenter {
  x: number;
  y: number;
  size: number; // controls spread (3-8)
}

// ── Helper: seeded shuffle ─────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Helper: weighted roll ──────────────────────────────────────────────────

function weightedRoll<K extends string>(weights: Record<K, number>): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = seededRandom() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  // Fallback to last non-zero
  return entries[entries.length - 1][0];
}

// ── Helper: position validity ──────────────────────────────────────────────

function isValidPosition(
  x: number, y: number,
  existing: Array<{ x: number; y: number }>,
  minDist: number,
): boolean {
  for (const s of existing) {
    if (distance(x, y, s.x, s.y) < minDist) return false;
  }
  return true;
}

// ── Helper: Gaussian approximation (Box-Muller, seeded) ───────────────────

function gaussianRandom(mean: number, stddev: number): number {
  // Box-Muller using two seeded random calls
  const u1 = seededRandom() || 1e-10;
  const u2 = seededRandom();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

// ── Step 1: Cluster centers ────────────────────────────────────────────────

function generateClusterCenters(config: GalaxyConfig): ClusterCenter[] {
  const centers: ClusterCenter[] = [];
  const count = randomInt(config.clusterCountMin, config.clusterCountMax);
  const margin = 100;

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const x = randomInt(margin, config.width - margin);
      const y = randomInt(margin, config.height - margin);
      if (isValidPosition(x, y, centers, 120)) {
        centers.push({ x, y, size: randomInt(3, 8) });
        placed = true;
        break;
      }
    }
    if (!placed && centers.length > 0) break; // Move on if we can't place more
  }

  return centers;
}

// ── Step 1: Star placement ─────────────────────────────────────────────────

function generateClusteredPosition(center: ClusterCenter, config: GalaxyConfig): GalaxyCoord {
  const angle = seededRandom() * 2 * Math.PI;
  const rawDist = Math.abs(gaussianRandom(0, center.size * 15));
  const dist = Math.min(rawDist, 100);
  const x = clamp(center.x + Math.cos(angle) * dist, 20, config.width - 20);
  const y = clamp(center.y + Math.sin(angle) * dist, 20, config.height - 20);
  return { x, y };
}

function generateRandomPosition(config: GalaxyConfig): GalaxyCoord {
  const margin = 20;
  return {
    x: randomInt(margin, config.width - margin),
    y: randomInt(margin, config.height - margin),
  };
}

function generateStarPositions(config: GalaxyConfig): GalaxyCoord[] {
  const positions: GalaxyCoord[] = [];
  const centers = generateClusterCenters(config);
  const maxAttempts = config.starCount * 100;
  let attempts = 0;
  let minDist = config.minStarDistance;

  while (positions.length < config.starCount && attempts < maxAttempts) {
    attempts++;
    let pos: GalaxyCoord;
    if (seededRandom() < CLUSTER_PLACEMENT_CHANCE && centers.length > 0) {
      const center = randomPick(centers);
      pos = generateClusteredPosition(center, config);
    } else {
      pos = generateRandomPosition(config);
    }

    if (isValidPosition(pos.x, pos.y, positions, minDist)) {
      positions.push(pos);
    }
  }

  // Fallback: relax minimum distance if we couldn't place all stars
  let relaxAttempt = 0;
  while (positions.length < config.starCount && relaxAttempt < 3) {
    relaxAttempt++;
    minDist *= 0.9;
    const remaining = config.starCount - positions.length;
    let fills = 0;
    for (let i = 0; i < remaining * 200 && fills < remaining; i++) {
      const pos = generateRandomPosition(config);
      if (isValidPosition(pos.x, pos.y, positions, minDist)) {
        positions.push(pos);
        fills++;
      }
    }
  }

  return positions;
}

// ── Step 2: Star color + name ──────────────────────────────────────────────

function assignStarColor(): StarType {
  return weightedRoll(STAR_COLOR_WEIGHTS);
}

function buildNamePool(count: number): string[] {
  const pool = [...STAR_NAMES];
  shuffle(pool);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i < pool.length) {
      names.push(pool[i]);
    } else {
      const base = pool[i % pool.length];
      const suffix = ROMAN_NUMERALS[(Math.floor(i / pool.length) - 1) % ROMAN_NUMERALS.length];
      names.push(`${base} ${suffix}`);
    }
  }
  return names;
}

// ── Step 3: Nebulae ────────────────────────────────────────────────────────

function generateNebulae(stars: InternalStar[], config: GalaxyConfig): Nebula[] {
  const count = randomInt(config.nebulaCountMin, config.nebulaCountMax);
  const nebulae: Nebula[] = [];

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const cx = randomInt(Math.floor(config.width * 0.2), Math.floor(config.width * 0.8));
      const cy = randomInt(Math.floor(config.height * 0.2), Math.floor(config.height * 0.8));
      const radius = randomInt(NEBULA_MIN_RADIUS, NEBULA_MAX_RADIUS);

      // Check overlap with existing nebulae
      let tooClose = false;
      for (const existing of nebulae) {
        const d = distance(cx, cy, existing.centerX, existing.centerY);
        if (d < radius + existing.radius + 30) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      // Find stars within nebula
      const starIds: SystemId[] = [];
      for (const star of stars) {
        if (distance(star.x, star.y, cx, cy) <= radius) {
          starIds.push(star.id);
        }
      }

      // Need at least 2 stars
      if (starIds.length >= 2) {
        const nebulaId = `neb_${i}`;
        for (const star of stars) {
          if (starIds.includes(star.id)) {
            star.inNebula = true;
            star.nebulaId = nebulaId;
          }
        }
        nebulae.push({ id: nebulaId, centerX: cx, centerY: cy, radius, starIds });
        placed = true;
        break;
      }
    }
    // If we couldn't place a nebula, skip it (not required)
    void placed;
  }

  return nebulae;
}

// ── Step 4: Planet generation ──────────────────────────────────────────────

function rollEnvironment(starColor: StarType): PlanetType {
  return weightedRoll(ENVIRONMENT_TABLES[starColor]);
}

function rollSize(): { size: PlanetSize; basePop: number } {
  const sizeType = weightedRoll(SIZE_DISTRIBUTION);
  return { size: sizeType, basePop: BASE_POP_BY_SIZE[sizeType] };
}

function rollResources(starColor: StarType): ResourceLevel {
  return weightedRoll(RESOURCE_TABLES[starColor]);
}

function applyNebulaBonus(level: ResourceLevel): ResourceLevel {
  if (seededRandom() < NEBULA_RESOURCE_BONUS_CHANCE) {
    const upgrades: Record<ResourceLevel, ResourceLevel> = {
      ultra_poor: 'poor', poor: 'normal', normal: 'rich', rich: 'ultra_rich', ultra_rich: 'ultra_rich',
    };
    return upgrades[level];
  }
  return level;
}

function generatePlanet(star: InternalStar): InternalPlanet {
  const environment = rollEnvironment(star.color);
  const { size, basePop } = rollSize();
  let resources = rollResources(star.color);
  if (star.inNebula) {
    resources = applyNebulaBonus(resources);
  }
  return {
    environment,
    size,
    basePop,
    resources,
    researchMultiplier: 1.0,
    hasGuardian: false,
    startingPopulation: null,
    startingFactories: null,
  };
}

// ── Step 5: Orion placement ────────────────────────────────────────────────

function placeOrion(stars: InternalStar[], config: GalaxyConfig): void {
  const cx = config.width / 2;
  const cy = config.height / 2;
  let best: InternalStar | null = null;
  let bestDist = Infinity;
  for (const s of stars) {
    const d = distance(s.x, s.y, cx, cy);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  if (!best) throw new Error('No stars to place Orion on');
  best.name = 'Orion';
  best.color = 'yellow';
  best.isOrion = true;
  best.planet = {
    environment: 'gaia',
    size: 'huge',
    basePop: 100,
    resources: 'ultra_rich',
    researchMultiplier: 4.0,
    hasGuardian: true,
    startingPopulation: null,
    startingFactories: null,
  };
}

// ── Step 6: Homeworld placement ─────────────────────────────────────────────

function countReachableNeighbors(
  star: InternalStar,
  stars: InternalStar[],
  maxRange: number,
): number {
  let count = 0;
  for (const other of stars) {
    if (other.id !== star.id && distance(star.x, star.y, other.x, other.y) <= maxRange) {
      count++;
    }
  }
  return count;
}

/** Calculate 0-100 quality score for a planet (used in tests and neighbor validation). */
export function calculatePlanetQuality(planet: { environment: PlanetType; size: PlanetSize; resources: ResourceLevel }): number {
  return (
    ENVIRONMENT_QUALITY_SCORES[planet.environment] +
    SIZE_QUALITY_SCORES[planet.size] +
    RESOURCE_QUALITY_SCORES[planet.resources]
  );
}

function getPerimeterPosition(
  t: number,
  config: GalaxyConfig,
  margin: number,
): GalaxyCoord {
  const w = config.width - 2 * margin;
  const h = config.height - 2 * margin;
  const perimeter = 2 * (w + h);
  const p = ((t % perimeter) + perimeter) % perimeter;

  if (p < w) return { x: margin + p, y: margin };
  if (p < w + h) return { x: config.width - margin, y: margin + (p - w) };
  if (p < 2 * w + h) return { x: config.width - margin - (p - w - h), y: config.height - margin };
  return { x: margin, y: config.height - margin - (p - 2 * w - h) };
}

function calculateIdealPositions(playerCount: number, config: GalaxyConfig): GalaxyCoord[] {
  const margin = 80;
  if (playerCount <= 4) {
    const corners: GalaxyCoord[] = [
      { x: margin, y: margin },
      { x: config.width - margin, y: margin },
      { x: margin, y: config.height - margin },
      { x: config.width - margin, y: config.height - margin },
    ];
    return corners.slice(0, playerCount);
  }
  const perimeter = 2 * (config.width + config.height);
  const spacing = perimeter / playerCount;
  const positions: GalaxyCoord[] = [];
  for (let i = 0; i < playerCount; i++) {
    positions.push(getPerimeterPosition(i * spacing, config, margin));
  }
  return positions;
}

function configureAsHomeworld(star: InternalStar): void {
  star.isHomeworld = true;
  const sizeChoice: Array<'large' | 'huge'> = ['large', 'huge'];
  const sizeType = randomPick(sizeChoice);
  star.planet = {
    environment: 'terran',
    size: sizeType,
    basePop: BASE_POP_BY_SIZE[sizeType],
    resources: 'normal',
    researchMultiplier: 1.0,
    hasGuardian: false,
    startingPopulation: 40,
    startingFactories: 30,
  };
}

function placeHomeworlds(
  stars: InternalStar[],
  playerCount: number,
  config: GalaxyConfig,
): string[] {
  const idealPositions = calculateIdealPositions(playerCount, config);
  const usedIds = new Set<string>();
  const homeworldIds: string[] = [];

  for (const ideal of idealPositions) {
    const candidates: Array<{ star: InternalStar; distFromIdeal: number; neighborCount: number }> = [];

    for (const star of stars) {
      if (usedIds.has(star.id) || star.isOrion) continue;
      const dist = distance(star.x, star.y, ideal.x, ideal.y);
      if (dist <= 100) {
        const neighbors = countReachableNeighbors(star, stars, STARTING_RANGE);
        if (neighbors >= 2) {
          candidates.push({ star, distFromIdeal: dist, neighborCount: neighbors });
        }
      }
    }

    // Sort by proximity to ideal, then by neighbor count (desc)
    candidates.sort((a, b) => {
      if (Math.abs(a.distFromIdeal - b.distFromIdeal) > 20) return a.distFromIdeal - b.distFromIdeal;
      return b.neighborCount - a.neighborCount;
    });

    // Try candidates in order, check spacing vs already-placed homeworlds
    let placed = false;
    const searchRadius = 100;
    for (const { star } of candidates) {
      let tooClose = false;
      for (const hwId of homeworldIds) {
        const hw = stars.find(s => s.id === hwId);
        if (hw && distance(star.x, star.y, hw.x, hw.y) < config.minHomeworldDistance) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        configureAsHomeworld(star);
        homeworldIds.push(star.id);
        usedIds.add(star.id);
        // Block nearby stars from being another homeworld
        for (const other of stars) {
          if (distance(other.x, other.y, star.x, star.y) < config.minHomeworldDistance * 0.5) {
            usedIds.add(other.id);
          }
        }
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Fallback: expand search radius and relax spacing requirement
      let fallback: InternalStar | null = null;
      let minDist = Infinity;
      for (const star of stars) {
        if (usedIds.has(star.id) || star.isOrion) continue;
        const d = distance(star.x, star.y, ideal.x, ideal.y);
        if (d < minDist + searchRadius * 2) {
          let tooClose = false;
          for (const hwId of homeworldIds) {
            const hw = stars.find(s => s.id === hwId);
            if (hw && distance(star.x, star.y, hw.x, hw.y) < config.minHomeworldDistance * 0.6) {
              tooClose = true;
              break;
            }
          }
          if (!tooClose && d < minDist) {
            minDist = d;
            fallback = star;
          }
        }
      }
      if (fallback) {
        configureAsHomeworld(fallback);
        homeworldIds.push(fallback.id);
        usedIds.add(fallback.id);
      } else {
        throw new Error(`Cannot place homeworld ${homeworldIds.length + 1} — regenerate galaxy`);
      }
    }
  }

  return homeworldIds;
}

// ── Step 7: Artifacts worlds ───────────────────────────────────────────────

function placeArtifactsWorlds(
  stars: InternalStar[],
  config: GalaxyConfig,
): string[] {
  const count = randomInt(config.artifactsCountMin, config.artifactsCountMax);
  const centerX = config.width / 2;
  const centerY = config.height / 2;

  // Prefer middle-ring stars (30%-70% of sorted distance from center)
  const eligible = stars
    .filter(s => !s.isOrion && !s.isHomeworld && s.planet?.environment !== 'radiated')
    .map(s => ({ star: s, dist: distance(s.x, s.y, centerX, centerY) }))
    .sort((a, b) => a.dist - b.dist);

  const mid0 = Math.floor(eligible.length * 0.3);
  const mid1 = Math.floor(eligible.length * 0.7);
  const midCandidates = eligible.slice(mid0, mid1).map(e => e.star);
  shuffle(midCandidates);

  const placed: string[] = [];
  for (const star of midCandidates) {
    if (placed.length >= count) break;
    star.isArtifacts = true;
    if (star.planet) star.planet.researchMultiplier = 2.0;
    placed.push(star.id);
  }

  // Fallback: any non-orion, non-homeworld star
  if (placed.length < count) {
    const remaining = stars.filter(s => !s.isOrion && !s.isHomeworld && !placed.includes(s.id));
    shuffle(remaining);
    for (const star of remaining) {
      if (placed.length >= count) break;
      star.isArtifacts = true;
      if (star.planet) star.planet.researchMultiplier = 2.0;
      placed.push(star.id);
    }
  }

  return placed;
}

// ── Step 8: Cluster identification ────────────────────────────────────────

function identifyClusters(stars: InternalStar[]): Cluster[] {
  const clusters: Cluster[] = [];
  const assigned = new Set<string>();

  for (const star of stars) {
    if (assigned.has(star.id)) continue;
    const nearby = stars.filter(
      o => o.id !== star.id && !assigned.has(o.id) && distance(star.x, star.y, o.x, o.y) <= CLUSTER_RADIUS,
    );
    if (nearby.length >= 2) {
      const clusterId = `cls_${clusters.length}`;
      const members = [star, ...nearby];
      for (const m of members) {
        assigned.add(m.id);
        m.clusterId = clusterId;
      }
      clusters.push({
        id: clusterId,
        centerStarId: star.id,
        memberStarIds: members.map(m => m.id),
        region: star.region,
      });
    }
  }

  return clusters;
}

// ── Step 9: Region assignment ──────────────────────────────────────────────

function determineRegion(
  x: number,
  y: number,
  inNebula: boolean,
  config: GalaxyConfig,
): GalaxyRegion {
  const cx = config.width / 2;
  const cy = config.height / 2;
  const dx = Math.abs(x - cx) / (config.width / 2);
  const dy = Math.abs(y - cy) / (config.height / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.15) return 'omega_sector';
  if (inNebula) return 'dark_sectors';
  if (dist > 0.75) return 'safe_zones';
  return 'wild_pellet_fields';
}

function assignRegions(stars: InternalStar[], config: GalaxyConfig): void {
  for (const star of stars) {
    star.region = determineRegion(star.x, star.y, star.inNebula, config);
  }
}

// ── Step 10: Connectivity validation ──────────────────────────────────────

function checkConnectivity(stars: InternalStar[], maxRange: number): boolean {
  if (stars.length === 0) return true;
  const visited = new Set<string>();
  const queue = [stars[0].id];
  visited.add(stars[0].id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const current = stars.find(s => s.id === currentId)!;
    for (const other of stars) {
      if (!visited.has(other.id) && distance(current.x, current.y, other.x, other.y) <= maxRange) {
        visited.add(other.id);
        queue.push(other.id);
      }
    }
  }

  return visited.size === stars.length;
}

/** Fix isolated stars by moving them closer to their nearest neighbor */
function fixIsolatedStars(stars: InternalStar[], maxRange: number): void {
  for (const star of stars) {
    let nearest: InternalStar | null = null;
    let nearestDist = Infinity;
    for (const other of stars) {
      if (other.id === star.id) continue;
      const d = distance(star.x, star.y, other.x, other.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = other;
      }
    }
    if (nearest && nearestDist > maxRange) {
      const dx = nearest.x - star.x;
      const dy = nearest.y - star.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len;
      const ny = dy / len;
      star.x = nearest.x - nx * (maxRange - 5);
      star.y = nearest.y - ny * (maxRange - 5);
    }
  }
}

// ── Main generation output ─────────────────────────────────────────────────

export interface GalaxyGenerationResult {
  galaxy: Galaxy;
  planets: Record<PlanetId, Planet>;
  planetIds: PlanetId[];
}

// ── Public options type ────────────────────────────────────────────────────

export interface GalaxyOptions {
  size: GalaxySize;
  shape: GalaxyShape;
  seed: number;
  playerCount: number;
  /** Optional empire IDs to assign homeworld slots (in order) */
  empireIds?: EmpireId[];
}

// ── ID generation (deterministic from seeded random) ──────────────────────

function makeId(prefix: string, index: number): string {
  return `${prefix}_${index}`;
}

// ── Main generation function ───────────────────────────────────────────────

/**
 * Generate a complete galaxy.
 *
 * @param options - Galaxy size, shape, seed, player count, and optional empire IDs
 * @returns Galaxy state + flat planets record for insertion into GameState
 * @throws Error if a valid galaxy cannot be generated within retry limits
 */
export function generateGalaxy(options: GalaxyOptions): GalaxyGenerationResult {
  const { size, shape, seed, playerCount, empireIds = [] } = options;
  const config = GALAXY_CONFIGS[size];

  if (playerCount < 2 || playerCount > 10) {
    throw new Error(`Invalid player count: ${playerCount} (must be 2-10)`);
  }
  if (playerCount > Math.floor(config.starCount / 6)) {
    throw new Error(`Too many players (${playerCount}) for ${size} galaxy`);
  }

  seedRandom(seed);

  // Retry loop for generation failures
  const MAX_RETRIES = 10;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return attemptGalaxyGeneration(config, size, shape, playerCount, empireIds, seed);
    } catch (e) {
      if (attempt === MAX_RETRIES - 1) throw e;
      // Re-seed with a slight variation for retry
      seedRandom(seed + attempt + 1);
    }
  }

  throw new Error('Galaxy generation failed after maximum retries');
}

function attemptGalaxyGeneration(
  config: GalaxyConfig,
  size: GalaxySize,
  shape: GalaxyShape,
  playerCount: number,
  empireIds: EmpireId[],
  seed: number,
): GalaxyGenerationResult {
  // Step 1: Generate positions
  const positions = generateStarPositions(config);

  // Step 2: Build internal stars with colors and names
  const namePool = buildNamePool(positions.length);
  const stars: InternalStar[] = positions.map((pos, i) => ({
    id: makeId('sys', i),
    name: namePool[i],
    x: pos.x,
    y: pos.y,
    color: assignStarColor(),
    inNebula: false,
    nebulaId: null,
    region: 'wild_pellet_fields', // will be assigned in step 9
    clusterId: null,
    isOrion: false,
    isHomeworld: false,
    isArtifacts: false,
    planet: null,
  }));

  // Step 3: Generate nebulae (marks stars with inNebula)
  const nebulae = generateNebulae(stars, config);

  // Step 4: Generate planets for each star
  for (const star of stars) {
    star.planet = generatePlanet(star);
  }

  // Step 5: Place Orion (must be before homeworlds)
  placeOrion(stars, config);

  // Step 6: Place homeworlds
  const homeworldIds = placeHomeworlds(stars, playerCount, config);

  // Step 7: Place Artifacts worlds
  const artifactsIds = placeArtifactsWorlds(stars, config);

  // Step 8: Identify clusters (needs positions set, assigns clusterId)
  // Note: region not yet set, so cluster.region will be updated after step 9
  const clusters = identifyClusters(stars);

  // Step 9: Assign regions (uses inNebula, which is set after step 3)
  assignRegions(stars, config);

  // Update cluster regions now that stars have regions
  for (const cluster of clusters) {
    const centerStar = stars.find(s => s.id === cluster.centerStarId);
    if (centerStar) cluster.region = centerStar.region;
  }

  // Fix isolated stars (connectivity)
  if (!checkConnectivity(stars, MAX_WARP_RANGE)) {
    fixIsolatedStars(stars, MAX_WARP_RANGE);
  }

  // Validate homeworld spacing
  for (let i = 0; i < homeworldIds.length; i++) {
    for (let j = i + 1; j < homeworldIds.length; j++) {
      const a = stars.find(s => s.id === homeworldIds[i])!;
      const b = stars.find(s => s.id === homeworldIds[j])!;
      if (distance(a.x, a.y, b.x, b.y) < config.minHomeworldDistance) {
        throw new Error(`Homeworlds ${a.name} and ${b.name} are too close`);
      }
    }
  }

  // ── Build output structures ──

  const planetsByIdResult: Record<PlanetId, Planet> = {};
  const planetIdsResult: PlanetId[] = [];
  const systemsByIdResult: Record<SystemId, StarSystem> = {};

  for (const star of stars) {
    const planet = star.planet!;
    const planetId = makeId('pla', stars.indexOf(star));
    const popMult = ENVIRONMENT_POP_MULT[planet.environment] ?? 0;
    const maxPop = Math.floor(planet.basePop * popMult);
    const isOrion = star.isOrion;
    const isArtifacts = star.isArtifacts;

    const planetOut: Planet = {
      id: planetId,
      name: star.name,
      systemId: star.id,
      orbit: 1,
      type: planet.environment,
      size: planet.size,
      gravity: 1.0,
      ownerId: null,
      isColonized: false,
      isHomeworld: star.isHomeworld,
      population: planet.startingPopulation ?? 0,
      maxPopulation: maxPop,
      growthRate: 1.0,
      morale: 'content',
      factories: planet.startingFactories ?? 0,
      maxFactories: maxPop,
      waste: 0,
      production: { ship: 0, defense: 0, industry: 25, ecology: 50, research: 25 },
      buildQueue: [],
      buildings: [],
      missileBases: 0,
      maxMissileBases: 10,
      planetaryShield: 0,
      isRich: planet.resources === 'rich' || planet.resources === 'ultra_rich',
      isPoor: planet.resources === 'ultra_poor' || planet.resources === 'poor',
      isGaia: planet.environment === 'gaia',
      hasArtifacts: isArtifacts,
      resourceLevel: planet.resources,
      researchMultiplier: planet.researchMultiplier,
      startingPopulation: planet.startingPopulation,
      startingFactories: planet.startingFactories,
    };

    planetsByIdResult[planetId] = planetOut;
    planetIdsResult.push(planetId);

    const systemOut: StarSystem = {
      id: star.id,
      name: star.name,
      coordinates: { x: star.x, y: star.y },
      starType: star.color,
      starClass: starClassForType(star.color),
      planetIds: [planetId],
      ownerId: null,
      hasAsteroids: false,
      hasNebula: star.inNebula,
      nebulaId: star.nebulaId,
      hasWormhole: false,
      wormholeTarget: null,
      fleetIds: [],
      isOrion,
      hasGuardian: isOrion,
      hasArtifacts: isArtifacts,
      hasSpaceMonster: null,
      region: star.region,
      clusterId: star.clusterId,
    };

    systemsByIdResult[star.id] = systemOut;
  }

  // Build homeSystemIds (empire → system)
  const homeSystemIds: Record<EmpireId, SystemId> = {};
  for (let i = 0; i < homeworldIds.length; i++) {
    const empireId = empireIds[i] ?? `empire_${i}`;
    homeSystemIds[empireId] = homeworldIds[i];
    // Set planet owner for homeworld
    const system = systemsByIdResult[homeworldIds[i]];
    system.ownerId = empireId;
    const pId = system.planetIds[0];
    if (pId) {
      planetsByIdResult[pId].ownerId = empireId;
      planetsByIdResult[pId].isColonized = true;
    }
  }

  const orionStar = stars.find(s => s.isOrion)!;
  const galaxyId = `gal_${seed}`;

  const galaxy: Galaxy = {
    id: galaxyId,
    size,
    shape,
    width: config.width,
    height: config.height,
    systemCount: stars.length,
    systems: {
      byId: systemsByIdResult,
      allIds: stars.map(s => s.id),
    },
    quadTree: {
      bounds: { x: 0, y: 0, width: config.width, height: config.height },
      systemIds: stars.map(s => s.id),
      children: null,
    },
    nebulae,
    clusters,
    artifactsSystemIds: artifactsIds,
    orionSystemId: orionStar.id,
    homeSystemIds,
    fogOfWar: {},
  };

  return { galaxy, planets: planetsByIdResult, planetIds: planetIdsResult };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function starClassForType(color: StarType): string {
  const classMap: Record<StarType, string> = {
    yellow: 'G',
    green: 'K',
    red: 'M',
    blue: 'O',
    white: 'A',
    purple: 'NS',
  };
  return classMap[color];
}

// Re-export config for tests
export { GALAXY_CONFIGS, ENVIRONMENT_TABLES, RESOURCE_TABLES, SIZE_DISTRIBUTION, STAR_COLOR_WEIGHTS };
export type { GalaxyConfig as GalaxyGeneratorConfig };
