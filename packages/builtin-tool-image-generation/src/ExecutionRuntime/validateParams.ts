import type { ModelParamsSchema } from 'model-bank';

export type ValidatedImageParams =
  { error: string; success: false } | { params: Record<string, unknown>; success: true };

const collectReferenceUrls = (imageUrl: unknown, imageUrls: unknown) => {
  const urls = [imageUrl, ...(Array.isArray(imageUrls) ? imageUrls : [])].filter(
    (url): url is string => typeof url === 'string' && !!url.trim(),
  );
  return [...new Set(urls.map((url) => url.trim()))];
};

/**
 * Checks agent-supplied generation params against the model card before any image is generated.
 *
 * Params the model cannot honor are rejected rather than dropped or remapped: a silently adjusted
 * request still bills a generation that may not match what the user asked for. Only lossless
 * normalization is applied, moving references into whichever of `imageUrl` / `imageUrls` the
 * schema declares, because the Google runtime throws when both are present. Models without a
 * schema keep the params unchanged.
 */
export const validateImageParams = (
  params: Record<string, unknown>,
  schema: ModelParamsSchema | undefined,
): ValidatedImageParams => {
  if (!schema) return { params, success: true };

  const supported = new Set(['prompt', ...Object.keys(schema)]);
  const { imageUrl, imageUrls, ...rest } = params;
  const result: Record<string, unknown> = { ...rest };
  const errors: string[] = [];

  const referenceUrls = collectReferenceUrls(imageUrl, imageUrls);
  if (referenceUrls.length > 0) {
    if (supported.has('imageUrls')) {
      const maxCount = schema.imageUrls?.maxCount;
      if (maxCount && referenceUrls.length > maxCount) {
        errors.push(
          `This model accepts at most ${maxCount} reference image${maxCount === 1 ? '' : 's'}, but ${referenceUrls.length} were provided.`,
        );
      }
      result.imageUrls = referenceUrls;
    } else if (supported.has('imageUrl')) {
      if (referenceUrls.length > 1) {
        errors.push(
          `This model accepts a single reference image, but ${referenceUrls.length} were provided.`,
        );
      }
      result.imageUrl = referenceUrls[0];
    } else {
      errors.push('This model does not accept reference images.');
    }
  } else if (imageUrl === null && supported.has('imageUrl')) {
    result.imageUrl = null;
  }

  const unsupported = Object.keys(result)
    .filter((key) => !supported.has(key) && result[key] !== undefined)
    .sort();
  if (unsupported.length > 0) {
    errors.push(
      `Unsupported parameters: ${unsupported.join(', ')}. Supported parameters: ${[...supported].join(', ')}.`,
    );
  }

  if (errors.length > 0) return { error: errors.join(' '), success: false };

  for (const key of Object.keys(result)) {
    if (result[key] === undefined) delete result[key];
  }

  return { params: result, success: true };
};
