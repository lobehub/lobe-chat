/**
 * Internal seed generator for ComfyUI workflows
 * Avoids dependency on @lobechat/utils to prevent circular dependencies
 *
 * This is a 1:1 copy of the original generateUniqueSeeds function
 * from @lobechat/utils/number.ts
 */
import prand from 'pure-rand';

const MAX_SEED = 2_147_483_647; // PostgreSQL INTEGER max value (2^31 - 1)

/**
 * Generate unique random seeds for batch image generation
 *
 * @param seedCount - Number of unique seeds to generate
 * @returns Array of unique random seeds
 */
export function generateUniqueSeeds(seedCount: number): number[] {
  // Use current timestamp as the initial seed
  const initialSeed = Date.now();

  // Create an instance of Xoroshiro128+ random number generator
  let rng = prand.xoroshiro128plus(initialSeed);

  const seeds = new Set<number>();

  while (seeds.size < seedCount) {
    // Generate a 31-bit random integer (PostgreSQL INTEGER compatible)
    const [randomInt, nextRng] = prand.uniformIntDistribution(0, MAX_SEED, rng);

    // Update RNG state
    rng = nextRng;

    // Add to the set, ensuring uniqueness
    seeds.add(randomInt);
  }

  return Array.from(seeds);
}
