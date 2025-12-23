/**
 * Scoped SWR Mutate
 *
 * When using a custom cache provider with SWRConfig, the global `mutate` from 'swr'
 * becomes a no-op because it can't access the scoped cache.
 *
 * This module provides a scoped mutate function that works with custom cache providers.
 * The mutate function is initialized when the SWRConfig component mounts.
 *
 * @see https://github.com/vercel/swr/issues/2799
 *
 * @example
 * ```ts
 * // Instead of:
 * import { mutate } from 'swr';
 *
 * // Use:
 * import { mutate } from '@/libs/swr';
 * ```
 */
import type { ScopedMutator } from 'swr/_internal';

// Global scoped mutate reference, set when SWRConfig mounts
let scopedMutate: ScopedMutator | null = null;

/**
 * Set the scoped mutate function from SWRConfig
 * Called internally by SWRProvider on mount
 */
export const setScopedMutate = (m: ScopedMutator) => {
  scopedMutate = m;
};

/**
 * Scoped mutate function that works with custom cache providers
 *
 * Use this instead of `import { mutate } from 'swr'` when using localStorage cache provider
 */
export const mutate: ScopedMutator = ((key: any, data?: any, opts?: any) => {
  if (!scopedMutate) {
    console.warn('[SWR] Scoped mutate not initialized, this may cause cache sync issues');
    return Promise.resolve([]);
  }
  return scopedMutate(key, data, opts);
}) as ScopedMutator;
