import type { ModelParamsSchema } from 'model-bank';

export interface SanitizedImageParams {
  /**
   * Human-readable notes returned to the agent so it can see how its request changed.
   */
  adjustments: string[];
  params: Record<string, unknown>;
}

const SIZE_PATTERN = /^(\d+)\s*[*x×]\s*(\d+)$/i;
const ASPECT_RATIO_PATTERN = /^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/;

const parseAspectRatio = (value: string) => {
  const match = value.trim().match(ASPECT_RATIO_PATTERN);
  if (!match) return;
  const ratio = Number(match[1]) / Number(match[2]);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : undefined;
};

/**
 * Picks the enum size whose width/height ratio is closest to the requested aspect ratio.
 * Non-dimension values such as `auto` are skipped.
 */
const findClosestSize = (aspectRatio: string, sizes: readonly string[]) => {
  const target = parseAspectRatio(aspectRatio);
  if (!target) return;

  let closest: { distance: number; size: string } | undefined;
  for (const size of sizes) {
    const match = size.match(SIZE_PATTERN);
    if (!match) continue;
    const ratio = Number(match[1]) / Number(match[2]);
    if (!ratio) continue;
    const distance = Math.abs(Math.log(ratio / target));
    if (!closest || distance < closest.distance) closest = { distance, size };
  }

  return closest?.size;
};

const collectReferenceUrls = (imageUrl: unknown, imageUrls: unknown) => {
  const urls = [imageUrl, ...(Array.isArray(imageUrls) ? imageUrls : [])].filter(
    (url): url is string => typeof url === 'string' && !!url.trim(),
  );
  return [...new Set(urls.map((url) => url.trim()))];
};

/**
 * Restricts agent-supplied generation params to the keys declared by the model card.
 *
 * Providers reject or mishandle keys outside their schema: OpenAI-compatible image APIs
 * return `400 Unknown parameter: 'aspectRatio'`, and the Google runtime throws when both
 * `imageUrl` and `imageUrls` are present. Models without a schema keep the params unchanged.
 */
export const sanitizeImageParams = (
  params: Record<string, unknown>,
  schema: ModelParamsSchema | undefined,
): SanitizedImageParams => {
  if (!schema) return { adjustments: [], params };

  const supported = new Set(['prompt', ...Object.keys(schema)]);
  const { imageUrl, imageUrls, ...rest } = params;
  const result: Record<string, unknown> = { ...rest };
  const adjustments: string[] = [];
  const ignored: string[] = [];

  const referenceUrls = collectReferenceUrls(imageUrl, imageUrls);
  if (referenceUrls.length > 0) {
    if (supported.has('imageUrls')) {
      const maxCount = schema.imageUrls?.maxCount;
      const accepted = maxCount ? referenceUrls.slice(0, maxCount) : referenceUrls;
      result.imageUrls = accepted;
      if (typeof imageUrl === 'string' && imageUrl.trim()) {
        adjustments.push(
          'Merged imageUrl into imageUrls because this model only accepts imageUrls.',
        );
      }
      if (accepted.length < referenceUrls.length) {
        adjustments.push(
          `This model accepts at most ${maxCount} reference image${maxCount === 1 ? '' : 's'}; ignored ${referenceUrls.slice(accepted.length).join(', ')}.`,
        );
      }
    } else if (supported.has('imageUrl')) {
      result.imageUrl = referenceUrls[0];
      if (referenceUrls.length > 1) {
        adjustments.push(
          `This model accepts a single reference image; used imageUrl ${referenceUrls[0]} and ignored ${referenceUrls.slice(1).join(', ')}.`,
        );
      }
    } else {
      if (typeof imageUrl === 'string' && imageUrl.trim()) ignored.push('imageUrl');
      if (Array.isArray(imageUrls) && imageUrls.length > 0) ignored.push('imageUrls');
    }
  } else if (imageUrl === null && supported.has('imageUrl')) {
    result.imageUrl = null;
  }

  const { aspectRatio } = result;
  if (
    typeof aspectRatio === 'string' &&
    !supported.has('aspectRatio') &&
    schema.size &&
    result.size === undefined
  ) {
    const size = findClosestSize(aspectRatio, schema.size.enum);
    if (size) {
      result.size = size;
      delete result.aspectRatio;
      adjustments.push(
        `Mapped aspectRatio ${aspectRatio} to size ${size} because this model only accepts size.`,
      );
    }
  }

  for (const key of Object.keys(result)) {
    if (supported.has(key)) continue;
    if (result[key] !== undefined) ignored.push(key);
    delete result[key];
  }

  if (ignored.length > 0) {
    adjustments.push(
      `Ignored parameters not supported by this model: ${ignored.sort().join(', ')}.`,
    );
  }

  return { adjustments, params: result };
};
