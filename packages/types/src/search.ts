import { z } from 'zod';

export type SearchMode = 'off' | 'auto' | 'on';

export enum ModelSearchImplement {
  /**
   * Model has built-in search functionality
   * Similar to search modes of models like Jina, PPLX, transparent to the caller
   */
  Internal = 'internal',
  /**
   * Uses parameter toggle approach, e.g. Qwen, Google, OpenRouter, search results in
   */
  Params = 'params',
  /**
   * Uses tool calling approach
   */
  Tool = 'tool',
}

export interface CitationItem {
  favicon?: string;
  id?: string;
  title?: string;
  url: string;
}

export interface GroundingSearch {
  citations?: CitationItem[];
  searchQueries?: string[];
}

export const GroundingSearchSchema = z.object({
  citations: z
    .array(
      z.object({
        favicon: z.string().optional(),
        id: z.string().optional(),
        title: z.string().optional(),
        url: z.string(),
      }),
    )
    .optional(),
  searchQueries: z.array(z.string()).optional(),
});
