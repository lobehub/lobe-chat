import prand from 'pure-rand';

export const MAX_SEED = 2 ** 31 - 1;
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
