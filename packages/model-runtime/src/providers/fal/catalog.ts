import debug from 'debug';

import type { FalJsonSchema } from './schema';
import {
  extractFalInputSchema,
  falInputSchemaToImageParameters,
  falInputSchemaToVideoParameters,
} from './schema';

const log = debug('lobe-image:fal:catalog');

// https://fal.ai/docs/platform-apis/v1/models
const FAL_MODELS_API = 'https://api.fal.ai/v1/models';

/**
 * Catalog categories the generation pages can drive, in listing order, with the model type each
 * maps to.
 */
const FAL_GENERATION_CATEGORIES = [
  ['text-to-image', 'image'],
  ['image-to-image', 'image'],
  ['text-to-video', 'video'],
  ['image-to-video', 'video'],
] as const;

type FalGenerationCategory = (typeof FAL_GENERATION_CATEGORIES)[number];

/** Page size of a catalog request that expands OpenAPI schemas */
const PAGE_SIZE = 50;

/** Upper bound of pages per category, so a model fetch stays a bounded number of requests */
const MAX_PAGES_PER_CATEGORY = 20;

interface FalCatalogModel {
  endpoint_id: string;
  metadata?: {
    category?: string;
    date?: string;
    description?: string;
    display_name?: string;
    kind?: string;
    status?: string;
  };
  openapi?: unknown;
}

interface FalCatalogPage {
  has_more?: boolean;
  models?: FalCatalogModel[];
  next_cursor?: string | null;
}

export interface FalModelListItem {
  description?: string;
  displayName: string;
  id: string;
  parameters: Record<string, unknown>;
  releasedAt?: string;
  type: 'image' | 'video';
}

const requestCatalog = async (
  apiKey: string,
  query: Record<string, string | undefined>,
  signal?: AbortSignal,
): Promise<FalCatalogPage> => {
  const url = new URL(FAL_MODELS_API);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  const response = await fetch(url, { headers: { Authorization: `Key ${apiKey}` }, signal });
  if (!response.ok) {
    const error = new Error(`fal model catalog request failed: ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  return response.json();
};

const toModelListItem = (
  model: FalCatalogModel,
  type: 'image' | 'video',
): FalModelListItem | undefined => {
  if (model.metadata?.kind === 'training') return;

  const input = extractFalInputSchema(model.openapi, model.endpoint_id);
  const parameters =
    type === 'image'
      ? falInputSchemaToImageParameters(input)
      : falInputSchemaToVideoParameters(input);
  if (!parameters) return;

  const releasedAt = model.metadata?.date?.slice(0, 10);

  return {
    description: model.metadata?.description?.trim(),
    displayName: model.metadata?.display_name || model.endpoint_id,
    id: model.endpoint_id,
    parameters,
    ...(releasedAt && { releasedAt }),
    type,
  };
};

const listCategory = async (
  apiKey: string,
  [category, type]: FalGenerationCategory,
  signal?: AbortSignal,
) => {
  const items: FalModelListItem[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES_PER_CATEGORY; page++) {
    const result = await requestCatalog(
      apiKey,
      {
        category,
        cursor,
        expand: 'openapi-3.0',
        limit: String(PAGE_SIZE),
        status: 'active',
      },
      signal,
    );

    for (const model of result.models ?? []) {
      const item = toModelListItem(model, type);
      if (item) items.push(item);
    }

    if (!result.has_more || !result.next_cursor) break;
    cursor = result.next_cursor;
  }

  return items;
};

/**
 * List the fal endpoints that can run on the image and video generation pages, each with the
 * parameters derived from its input schema. A failing category is skipped so one bad page does
 * not hide the rest; only a failure of every category (e.g. an invalid key) is thrown.
 */
export const listFalGenerationModels = async (apiKey: string, signal?: AbortSignal) => {
  const results = await Promise.allSettled(
    FAL_GENERATION_CATEGORIES.map((category) => listCategory(apiKey, category, signal)),
  );

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length === results.length) throw (rejected[0] as PromiseRejectedResult).reason;

  const models = new Map<string, FalModelListItem>();
  for (const result of results) {
    if (result.status === 'rejected') {
      log('fal catalog category failed: %O', result.reason);
      continue;
    }
    for (const item of result.value) if (!models.has(item.id)) models.set(item.id, item);
  }

  return [...models.values()];
};

const inputSchemaCache = new Map<string, Promise<FalJsonSchema | undefined>>();

/**
 * Input schema of one fal endpoint, cached per process. Resolves undefined when the catalog
 * cannot be reached, so callers fall back to sending the request as built.
 */
export const getFalInputSchema = (apiKey: string, endpointId: string) => {
  const cached = inputSchemaCache.get(endpointId);
  if (cached) return cached;

  const pending = requestCatalog(apiKey, { endpoint_id: endpointId, expand: 'openapi-3.0' })
    .then((page) => {
      const model = page.models?.find((item) => item.endpoint_id === endpointId);
      return extractFalInputSchema(model?.openapi, endpointId);
    })
    .catch((error) => {
      log('Failed to load fal input schema for %s: %O', endpointId, error);
      inputSchemaCache.delete(endpointId);
      return undefined;
    });

  inputSchemaCache.set(endpointId, pending);
  return pending;
};

/** @internal Test helper */
export const clearFalInputSchemaCache = () => inputSchemaCache.clear();
