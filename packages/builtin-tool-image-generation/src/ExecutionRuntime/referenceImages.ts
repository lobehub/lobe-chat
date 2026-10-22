import type { ModelParamsSchema } from 'model-bank';

import type { GenerateImageParams } from '../types';

export type ReferenceImageParams = { imageUrl?: null | string; imageUrls?: string[] };

export type ResolvedReferenceImages =
  { error: string; success: false } | { params: ReferenceImageParams; success: true };

const collectReferenceUrls = (values: unknown[]) => {
  const urls = values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((url): url is string => typeof url === 'string' && !!url.trim())
    .map((url) => url.trim());

  return [...new Set(urls)];
};

/**
 * Collects every reference image from `imageUrl` / `imageUrls` (top-level or inside `parameters`)
 * and places them in the field the model card declares.
 *
 * References are never dropped: when the model cannot take all of them, generation is rejected
 * before any task is created, because a generation without the references is still billed but
 * does not match the request. Other parameters are intentionally left untouched.
 */
export const resolveReferenceImages = (
  { imageUrl, imageUrls, parameters }: GenerateImageParams,
  schema: ModelParamsSchema | undefined,
): ResolvedReferenceImages => {
  const urls = collectReferenceUrls([
    imageUrl,
    parameters?.imageUrl,
    imageUrls,
    parameters?.imageUrls,
  ]);

  if (urls.length === 0) {
    // Preserve an explicit "no reference" value for models whose schema declares `imageUrl`.
    return { params: imageUrl === null ? { imageUrl: null } : {}, success: true };
  }

  // Without a schema the model's capability is unknown; keep every reference in a single field.
  if (!schema) {
    const singleFieldOnly =
      urls.length === 1 && !imageUrls?.length && !Array.isArray(parameters?.imageUrls);
    return {
      params: singleFieldOnly ? { imageUrl: urls[0] } : { imageUrls: urls },
      success: true,
    };
  }

  if (schema.imageUrls) {
    const maxCount = schema.imageUrls.maxCount;
    if (maxCount && urls.length > maxCount) {
      return {
        error: `This model accepts at most ${maxCount} reference image${maxCount === 1 ? '' : 's'}, but ${urls.length} were provided.`,
        success: false,
      };
    }
    return { params: { imageUrls: urls }, success: true };
  }

  if (schema.imageUrl) {
    if (urls.length > 1) {
      return {
        error: `This model accepts a single reference image, but ${urls.length} were provided.`,
        success: false,
      };
    }
    return { params: { imageUrl: urls[0] }, success: true };
  }

  return { error: 'This model does not accept reference images.', success: false };
};
