import { Pricing } from 'model-bank';

export interface ImageSinglePriceResult {
  isApproximate: boolean;
  price?: number;
}

const DEFAULT_REFERENCE_MP = (1024 * 1024) / 1_000_000;

export const resolveImageSinglePrice = (pricing?: Pricing): ImageSinglePriceResult => {
  if (!pricing) return { isApproximate: false };

  if (typeof pricing.pricePerImage === 'number') {
    return { isApproximate: true, price: pricing.pricePerImage };
  }

  const imageGenerationUnit = pricing.units.find((unit) => unit.name === 'imageGeneration');
  if (!imageGenerationUnit) return { isApproximate: false };

  if (imageGenerationUnit.strategy === 'fixed') {
    if (imageGenerationUnit.unit === 'image') {
      return { isApproximate: false, price: imageGenerationUnit.rate };
    }

    if (imageGenerationUnit.unit === 'megapixel') {
      return {
        isApproximate: true,
        price: imageGenerationUnit.rate * DEFAULT_REFERENCE_MP,
      };
    }

    return { isApproximate: false };
  }

  // Lookup/tiered pricing typically requires explicit configuration; treat as unavailable here.
  return { isApproximate: false };
};
