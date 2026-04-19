/**
 * Galaxy generator — pure TypeScript, NO DOM.
 * src/game/generators/galaxy.ts
 *
 * Placeholder: generates a minimal test galaxy.
 * Full generation will be implemented in a future task.
 */

import { Galaxy, GalaxySize, GalaxyShape } from '../state';
import { randomId } from '../utils/random';

export interface GalaxyOptions {
  size: GalaxySize;
  shape: GalaxyShape;
  seed: string;
}

const SIZE_CONFIG: Record<GalaxySize, { width: number; height: number; systems: number }> = {
  small:  { width: 20, height: 20, systems: 24  },
  medium: { width: 30, height: 30, systems: 48  },
  large:  { width: 40, height: 40, systems: 72  },
  huge:   { width: 50, height: 50, systems: 100 },
};

/**
 * Generate a skeleton galaxy with the correct shape and counts.
 * Stars/planets are populated in later tasks.
 */
export function generateGalaxy(options: GalaxyOptions): Galaxy {
  const config = SIZE_CONFIG[options.size];
  const galaxyId = randomId('gal');
  const orionId = randomId('sys');

  return {
    id: galaxyId,
    size: options.size,
    shape: options.shape,
    width: config.width,
    height: config.height,
    systemCount: config.systems,
    systems: {
      byId: {
        [orionId]: {
          id: orionId,
          name: 'Orion',
          coordinates: { x: config.width / 2, y: config.height / 2 },
          starType: 'blue',
          starClass: 'O5',
          planetIds: [],
          ownerId: null,
          hasAsteroids: false,
          hasNebula: false,
          hasWormhole: false,
          wormholeTarget: null,
          fleetIds: [],
          isOrion: true,
          hasGuardian: true,
          hasArtifacts: true,
          hasSpaceMonster: null,
        },
      },
      allIds: [orionId],
    },
    orionSystemId: orionId,
    homeSystemIds: {},
    fogOfWar: {},
  };
}
