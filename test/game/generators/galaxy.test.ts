/**
 * Galaxy generator unit tests.
 * test/game/generators/galaxy.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateGalaxy,
  GALAXY_CONFIGS,
  STAR_COLOR_WEIGHTS,
  ENVIRONMENT_TABLES,
  RESOURCE_TABLES,
  SIZE_DISTRIBUTION,
  calculatePlanetQuality,
  type GalaxyOptions,
  type GalaxyGeneratorConfig,
} from '../../../src/game/generators/galaxy';
import { seedRandom } from '../../../src/game/utils/random';
import { distance } from '../../../src/game/utils/math';
import type { GalaxySize, StarType, PlanetType, ResourceLevel } from '../../../src/game/state';

describe('Galaxy Generator', () => {
  const seed = 12345;
  
  beforeEach(() => {
    seedRandom(seed);
  });

  describe('Configuration', () => {
    it('should have valid galaxy size configs', () => {
      const sizes: GalaxySize[] = ['small', 'medium', 'large', 'huge'];
      for (const size of sizes) {
        const config = GALAXY_CONFIGS[size];
        expect(config).toBeDefined();
        expect(config.starCount).toBeGreaterThan(0);
        expect(config.width).toBeGreaterThan(0);
        expect(config.height).toBeGreaterThan(0);
        expect(config.minStarDistance).toBeGreaterThan(0);
        expect(config.minHomeworldDistance).toBeGreaterThan(0);
      }
    });

    it('should have correct star counts per galaxy size', () => {
      expect(GALAXY_CONFIGS.small.starCount).toBe(24);
      expect(GALAXY_CONFIGS.medium.starCount).toBe(48);
      expect(GALAXY_CONFIGS.large.starCount).toBe(70);
      expect(GALAXY_CONFIGS.huge.starCount).toBe(108);
    });

    it('should have valid star color weights', () => {
      const total = Object.values(STAR_COLOR_WEIGHTS).reduce((sum, w) => sum + w, 0);
      expect(total).toBe(100);
      expect(STAR_COLOR_WEIGHTS.yellow).toBe(25);
      expect(STAR_COLOR_WEIGHTS.purple).toBe(8);
    });

    it('should have valid environment tables for all star types', () => {
      const starTypes: StarType[] = ['yellow', 'green', 'red', 'blue', 'white', 'purple'];
      for (const type of starTypes) {
        const table = ENVIRONMENT_TABLES[type];
        expect(table).toBeDefined();
        const total = Object.values(table).reduce((sum, w) => sum + w, 0);
        expect(total).toBe(100);
      }
    });

    it('should have valid size distribution', () => {
      const total = Object.values(SIZE_DISTRIBUTION).reduce((sum, w) => sum + w, 0);
      expect(total).toBe(100);
    });

    it('should have valid resource tables', () => {
      const starTypes: StarType[] = ['yellow', 'green', 'red', 'blue', 'white', 'purple'];
      for (const type of starTypes) {
        const table = RESOURCE_TABLES[type];
        expect(table).toBeDefined();
        const total = Object.values(table).reduce((sum, w) => sum + w, 0);
        expect(total).toBe(100);
      }
    });
  });

  describe('Generation - Small Galaxy', () => {
    it('should generate a small galaxy with correct star count', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 3,
      });

      expect(result.galaxy.size).toBe('small');
      expect(result.galaxy.systems.allIds.length).toBe(24);
      expect(result.planetIds.length).toBe(24);
    });

    it('should place Orion near center', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      const orion = result.galaxy.systems.byId[result.galaxy.orionSystemId];
      expect(orion).toBeDefined();
      expect(orion.name).toBe('Orion');
      expect(orion.isOrion).toBe(true);
      expect(orion.hasGuardian).toBe(true);
      
      const config = GALAXY_CONFIGS.small;
      const centerX = config.width / 2;
      const centerY = config.height / 2;
      const dist = distance(orion.coordinates.x, orion.coordinates.y, centerX, centerY);
      
      // Should be reasonably close to center (within 20% of max dimension)
      expect(dist).toBeLessThan(Math.max(config.width, config.height) * 0.2);
    });

    it('should place correct number of homeworlds', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 3,
      });

      const homeworldIds = Object.values(result.galaxy.homeSystemIds);
      expect(homeworldIds.length).toBe(3);

      for (const sysId of homeworldIds) {
        const system = result.galaxy.systems.byId[sysId];
        expect(system).toBeDefined();
        const planetId = system.planetIds[0];
        const planet = result.planets[planetId];
        expect(planet.isHomeworld).toBe(true);
        expect(planet.type).toBe('terran');
        expect(planet.startingPopulation).toBe(40);
        expect(planet.startingFactories).toBe(30);
      }
    });

    it('should enforce minimum homeworld spacing', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      const homeworldIds = Object.values(result.galaxy.homeSystemIds);
      const config = GALAXY_CONFIGS.small;

      for (let i = 0; i < homeworldIds.length; i++) {
        for (let j = i + 1; j < homeworldIds.length; j++) {
          const a = result.galaxy.systems.byId[homeworldIds[i]];
          const b = result.galaxy.systems.byId[homeworldIds[j]];
          const dist = distance(a.coordinates.x, a.coordinates.y, b.coordinates.x, b.coordinates.y);
          expect(dist).toBeGreaterThanOrEqual(config.minHomeworldDistance);
        }
      }
    });
  });

  describe('Generation - Medium Galaxy', () => {
    it('should generate a medium galaxy with correct star count', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 5,
      });

      expect(result.galaxy.size).toBe('medium');
      expect(result.galaxy.systems.allIds.length).toBe(48);
      expect(result.planetIds.length).toBe(48);
    });

    it('should place artifacts worlds', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      const artifactsCount = result.galaxy.artifactsSystemIds.length;
      const config = GALAXY_CONFIGS.medium;
      
      expect(artifactsCount).toBeGreaterThanOrEqual(config.artifactsCountMin);
      expect(artifactsCount).toBeLessThanOrEqual(config.artifactsCountMax);

      for (const sysId of result.galaxy.artifactsSystemIds) {
        const system = result.galaxy.systems.byId[sysId];
        expect(system.hasArtifacts).toBe(true);
        const planetId = system.planetIds[0];
        const planet = result.planets[planetId];
        expect(planet.hasArtifacts).toBe(true);
        // Artifacts RP multiplier: +25% per exploration.md / research-formulas.md
        expect(planet.researchMultiplier).toBe(1.25);
      }
    });

    it('should generate nebulae with stars', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      const nebulaCount = result.galaxy.nebulae.length;
      const config = GALAXY_CONFIGS.medium;
      
      expect(nebulaCount).toBeGreaterThanOrEqual(config.nebulaCountMin);
      expect(nebulaCount).toBeLessThanOrEqual(config.nebulaCountMax);

      for (const nebula of result.galaxy.nebulae) {
        expect(nebula.starIds.length).toBeGreaterThanOrEqual(2);
        expect(nebula.radius).toBeGreaterThanOrEqual(60);
        expect(nebula.radius).toBeLessThanOrEqual(120);

        for (const sysId of nebula.starIds) {
          const system = result.galaxy.systems.byId[sysId];
          expect(system.hasNebula).toBe(true);
          expect(system.nebulaId).toBe(nebula.id);
        }
      }
    });

    it('should identify clusters', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      const clusterCount = result.galaxy.clusters.length;
      expect(clusterCount).toBeGreaterThan(0);

      for (const cluster of result.galaxy.clusters) {
        expect(cluster.memberStarIds.length).toBeGreaterThanOrEqual(3);
        expect(cluster.centerStarId).toBeDefined();
        
        for (const memberId of cluster.memberStarIds) {
          const system = result.galaxy.systems.byId[memberId];
          expect(system.clusterId).toBe(cluster.id);
        }
      }
    });

    it('should assign regions to all systems', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      for (const sysId of result.galaxy.systems.allIds) {
        const system = result.galaxy.systems.byId[sysId];
        expect(system.region).toMatch(/^(safe_zones|wild_pellet_fields|dark_sectors|omega_sector)$/);
      }

      // Orion should be in omega_sector
      const orion = result.galaxy.systems.byId[result.galaxy.orionSystemId];
      expect(orion.region).toBe('omega_sector');
    });
  });

  describe('Star and Planet Properties', () => {
    it('should assign valid star colors', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      const validColors: StarType[] = ['yellow', 'green', 'red', 'blue', 'white', 'purple'];
      for (const sysId of result.galaxy.systems.allIds) {
        const system = result.galaxy.systems.byId[sysId];
        expect(validColors).toContain(system.starType);
      }
    });

    it('should assign valid planet environments', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      const validEnvs: PlanetType[] = [
        'terran', 'ocean', 'jungle', 'arid', 'tundra',
        'toxic', 'radiated', 'barren', 'dead', 'gas_giant',
        'gaia', 'steppe', 'desert', 'minimal', 'inferno',
      ];

      for (const planetId of result.planetIds) {
        const planet = result.planets[planetId];
        expect(validEnvs).toContain(planet.type);
      }
    });

    it('should assign valid planet sizes', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      for (const planetId of result.planetIds) {
        const planet = result.planets[planetId];
        expect(['tiny', 'small', 'medium', 'large', 'huge']).toContain(planet.size);
      }
    });

    it('should assign valid resource levels', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      const validLevels: ResourceLevel[] = ['ultra_poor', 'poor', 'normal', 'rich', 'ultra_rich'];
      for (const planetId of result.planetIds) {
        const planet = result.planets[planetId];
        expect(validLevels).toContain(planet.resourceLevel);
      }
    });

    it('should set Orion planet properties correctly', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      const orionSystem = result.galaxy.systems.byId[result.galaxy.orionSystemId];
      const orionPlanetId = orionSystem.planetIds[0];
      const orionPlanet = result.planets[orionPlanetId];

      // Per design/planets/generation-tables.md §10.2: Orion is 'dead' environment
      // (Gaia never spawns naturally), Huge size with 150 base pop, Ultra Rich
      expect(orionPlanet.type).toBe('dead');
      expect(orionPlanet.size).toBe('huge');
      expect(orionPlanet.resourceLevel).toBe('ultra_rich');
      expect(orionPlanet.researchMultiplier).toBe(4.0);
    });

    it('should have unique star names', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      const names = new Set<string>();
      for (const sysId of result.galaxy.systems.allIds) {
        const system = result.galaxy.systems.byId[sysId];
        expect(names.has(system.name)).toBe(false);
        names.add(system.name);
      }
    });
  });

  describe('Minimum Distance Enforcement', () => {
    it('should enforce minimum star distance', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      const config = GALAXY_CONFIGS.small;
      const systems = result.galaxy.systems.allIds.map(id => result.galaxy.systems.byId[id]);

      for (let i = 0; i < systems.length; i++) {
        for (let j = i + 1; j < systems.length; j++) {
          const a = systems[i];
          const b = systems[j];
          const dist = distance(a.coordinates.x, a.coordinates.y, b.coordinates.x, b.coordinates.y);
          // Allow 10% tolerance due to relaxation in fallback placement
          expect(dist).toBeGreaterThanOrEqual(config.minStarDistance * 0.9);
        }
      }
    });
  });

  describe('Seeded Generation', () => {
    it('should generate identical galaxies with same seed', () => {
      const result1 = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: 999,
        playerCount: 2,
      });

      const result2 = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: 999,
        playerCount: 2,
      });

      expect(result1.galaxy.systems.allIds.length).toBe(result2.galaxy.systems.allIds.length);
      
      for (let i = 0; i < result1.galaxy.systems.allIds.length; i++) {
        const sys1 = result1.galaxy.systems.byId[result1.galaxy.systems.allIds[i]];
        const sys2 = result2.galaxy.systems.byId[result2.galaxy.systems.allIds[i]];
        
        expect(sys1.starType).toBe(sys2.starType);
        expect(sys1.coordinates.x).toBe(sys2.coordinates.x);
        expect(sys1.coordinates.y).toBe(sys2.coordinates.y);
      }
    });

    it('should generate different galaxies with different seeds', () => {
      const result1 = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: 111,
        playerCount: 2,
      });

      const result2 = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: 222,
        playerCount: 2,
      });

      // Star positions should differ
      let differentPositions = 0;
      for (let i = 0; i < result1.galaxy.systems.allIds.length; i++) {
        const sys1 = result1.galaxy.systems.byId[result1.galaxy.systems.allIds[i]];
        const sys2 = result2.galaxy.systems.byId[result2.galaxy.systems.allIds[i]];
        
        if (sys1.coordinates.x !== sys2.coordinates.x || sys1.coordinates.y !== sys2.coordinates.y) {
          differentPositions++;
        }
      }

      expect(differentPositions).toBeGreaterThan(0);
    });
  });

  describe('Empire ID Assignment', () => {
    it('should assign homeworlds to provided empire IDs', () => {
      const empireIds = ['player', 'ai_1', 'ai_2'];
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 3,
        empireIds,
      });

      expect(Object.keys(result.galaxy.homeSystemIds)).toEqual(empireIds);

      for (const empireId of empireIds) {
        const sysId = result.galaxy.homeSystemIds[empireId];
        expect(sysId).toBeDefined();
        const system = result.galaxy.systems.byId[sysId];
        expect(system.ownerId).toBe(empireId);
        
        const planetId = system.planetIds[0];
        const planet = result.planets[planetId];
        expect(planet.ownerId).toBe(empireId);
        expect(planet.isColonized).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid player count (too low)', () => {
      expect(() => {
        generateGalaxy({
          size: 'small',
          shape: 'spiral',
          seed: seed,
          playerCount: 1,
        });
      }).toThrow(/Invalid player count/);
    });

    it('should throw error for invalid player count (too high)', () => {
      expect(() => {
        generateGalaxy({
          size: 'small',
          shape: 'spiral',
          seed: seed,
          playerCount: 11,
        });
      }).toThrow(/Invalid player count/);
    });

    it('should throw error for too many players for galaxy size', () => {
      expect(() => {
        generateGalaxy({
          size: 'small',
          shape: 'spiral',
          seed: seed,
          playerCount: 10,
        });
      }).toThrow(/Too many players/);
    });
  });

  describe('calculatePlanetQuality helper', () => {
    it('should calculate quality score for terran large normal', () => {
      const score = calculatePlanetQuality({
        environment: 'terran',
        size: 'large',
        resources: 'normal',
      });
      expect(score).toBe(35 + 26 + 15); // 76
    });

    it('should give gaia huge ultra_rich maximum score', () => {
      const score = calculatePlanetQuality({
        environment: 'gaia',
        size: 'huge',
        resources: 'ultra_rich',
      });
      expect(score).toBe(40 + 30 + 30); // 100
    });

    it('should give radiated tiny ultra_poor minimum score', () => {
      const score = calculatePlanetQuality({
        environment: 'radiated',
        size: 'tiny',
        resources: 'ultra_poor',
      });
      expect(score).toBe(0 + 5 + 0); // 5
    });
  });

  describe('Large and Huge Galaxies', () => {
    it('should generate large galaxy correctly', () => {
      const result = generateGalaxy({
        size: 'large',
        shape: 'spiral',
        seed: seed,
        playerCount: 6,
      });

      expect(result.galaxy.size).toBe('large');
      expect(result.galaxy.systems.allIds.length).toBe(70);
      expect(result.planetIds.length).toBe(70);
      expect(Object.keys(result.galaxy.homeSystemIds).length).toBe(6);
    });

    it('should generate huge galaxy correctly', () => {
      const result = generateGalaxy({
        size: 'huge',
        shape: 'spiral',
        seed: seed,
        playerCount: 8,
      });

      expect(result.galaxy.size).toBe('huge');
      expect(result.galaxy.systems.allIds.length).toBe(108);
      expect(result.planetIds.length).toBe(108);
      expect(Object.keys(result.galaxy.homeSystemIds).length).toBe(8);
    });
  });

  describe('Data Consistency', () => {
    it('should have matching planet and system counts', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      expect(result.planetIds.length).toBe(result.galaxy.systems.allIds.length);
    });

    it('should have valid system IDs in all planet records', () => {
      const result = generateGalaxy({
        size: 'small',
        shape: 'spiral',
        seed: seed,
        playerCount: 2,
      });

      for (const planetId of result.planetIds) {
        const planet = result.planets[planetId];
        const system = result.galaxy.systems.byId[planet.systemId];
        expect(system).toBeDefined();
        expect(system.planetIds).toContain(planetId);
      }
    });

    it('should have valid star IDs in nebula records', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      for (const nebula of result.galaxy.nebulae) {
        for (const starId of nebula.starIds) {
          const system = result.galaxy.systems.byId[starId];
          expect(system).toBeDefined();
          expect(system.hasNebula).toBe(true);
          expect(system.nebulaId).toBe(nebula.id);
        }
      }
    });

    it('should have valid star IDs in cluster records', () => {
      const result = generateGalaxy({
        size: 'medium',
        shape: 'spiral',
        seed: seed,
        playerCount: 4,
      });

      for (const cluster of result.galaxy.clusters) {
        for (const starId of cluster.memberStarIds) {
          const system = result.galaxy.systems.byId[starId];
          expect(system).toBeDefined();
          expect(system.clusterId).toBe(cluster.id);
        }
      }
    });
  });
});
