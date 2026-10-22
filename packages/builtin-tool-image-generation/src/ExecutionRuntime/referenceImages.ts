import type { ModelParamsSchema } from 'model-bank';

import type { GenerateImageParams } from '../types';

export type ReferenceImageParams = { imageUrl?: null | string; imageUrls?: string[] };

export type ResolvedReferenceImages =
  { error: string; success: false } | { params: ReferenceImageParams; success: true };

const normalizeReferenceUrls = ({
  imageUrl,
  imageUrls,
  parameters,
}: GenerateImageParams): ReferenceImageParams => {
  const normalized: ReferenceImageParams = {};

  if (imageUrl === null || (typeof imageUrl === 'string' && imageUrl.trim())) {
    normalized.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : imageUrl;
  } else if (typeof parameters?.imageUrl === 'string' && parameters.imageUrl.trim()) {
    normalized.imageUrl = parameters.imageUrl.trim();
  }

  const urlList =
    imageUrls && imageUrls.length > 0
      ? imageUrls
      : Array.isArray(parameters?.imageUrls)
        ? parameters.imageUrls
        : [];

  const normalizedUrls = urlList
    .filter((url): url is string => typeof url === 'string' && !!url.trim())
    .map((url) => url.trim());
  if (normalizedUrls.length > 0) normalized.imageUrls = normalizedUrls;

  return normalized;
};

const NO_REFERENCE_SUPPORT = 'This model does not accept reference images.';

/**
 * Checks reference images against the fields the model card declares.
 *
 * Invalid input is rejected before any task is created rather than merged, remapped, or dropped:
 * a generation that ignores some references is still billed but does not match the request.
 * Models without a parameter schema are passed through, since their capability is unknown.
 */
export const resolveReferenceImages = (
  args: GenerateImageParams,
  schema: ModelParamsSchema | undefined,
): ResolvedReferenceImages => {
  const params = normalizeReferenceUrls(args);
  const hasSingle = typeof params.imageUrl === 'string';
  const urlCount = params.imageUrls?.length ?? 0;

  if (hasSingle && urlCount > 0) {
    return {
      error: 'Pass reference images in either imageUrl or imageUrls, not both.',
      success: false,
    };
  }

  if (!schema || (!hasSingle && urlCount === 0)) return { params, success: true };

  if (hasSingle && !schema.imageUrl) {
    return {
      error: schema.imageUrls
        ? 'This model takes reference images in imageUrls, not imageUrl.'
        : NO_REFERENCE_SUPPORT,
      success: false,
    };
  }

  if (urlCount > 0) {
    if (!schema.imageUrls) {
      return {
        error: schema.imageUrl
          ? 'This model takes a single reference image in imageUrl, not imageUrls.'
          : NO_REFERENCE_SUPPORT,
        success: false,
      };
    }

    const maxCount = schema.imageUrls.maxCount;
    if (maxCount && urlCount > maxCount) {
      return {
        error: `This model accepts at most ${maxCount} reference image${maxCount === 1 ? '' : 's'}, but ${urlCount} were provided.`,
        success: false,
      };
    }
  }

  return { params, success: true };
};
