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

/**
 * Calculate thumbnail dimensions
 * Generate thumbnail with max edge of 512px
 */
export function calculateThumbnailDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize = 512,
): {
  shouldResize: boolean;
  thumbnailHeight: number;
  thumbnailWidth: number;
} {
  const shouldResize = originalWidth > maxSize || originalHeight > maxSize;

  if (!shouldResize) {
    return {
      shouldResize: false,
      thumbnailHeight: originalHeight,
      thumbnailWidth: originalWidth,
    };
  }

  const thumbnailWidth =
    originalWidth > originalHeight
      ? maxSize
      : Math.round((originalWidth * maxSize) / originalHeight);

  const thumbnailHeight =
    originalHeight > originalWidth
      ? maxSize
      : Math.round((originalHeight * maxSize) / originalWidth);

  return {
    shouldResize: true,
    thumbnailHeight,
    thumbnailWidth,
  };
}
