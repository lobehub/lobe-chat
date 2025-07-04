/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { z } from 'zod';

export const MAX_SEED = 2 ** 31 - 1;

export const StdParamsZodSchema = z.object({
  type: z.literal('object'),
  required: z.array(z.string()),
  properties: z.object({
    prompt: z.object({
      type: z.literal('string').optional(),
      description: z.string().optional(),
      default: z.string().optional().default(''),
    }),
    imageUrls: z
      .object({
        type: z.literal('array').optional(),
        default: z.array(z.string()),
        description: z.string().optional(),
      })
      .optional(),
    imageUrl: z
      .object({
        type: z.tuple([z.literal('string'), z.literal('null')]).optional(),
        default: z.string().nullable().optional(),
        description: z.string().optional(),
      })
      .optional(),
    width: z
      .object({
        type: z.literal('number').optional(),
        default: z.number(),
        minimum: z.number(),
        maximum: z.number(),
        step: z.number().optional().default(1),
        description: z.string().optional(),
      })
      .optional(),
    height: z
      .object({
        type: z.literal('number').optional(),
        default: z.number(),
        minimum: z.number(),
        maximum: z.number(),
        step: z.number().optional().default(1),
        description: z.string().optional(),
      })
      .optional(),
    size: z
      .object({
        type: z.literal('string').optional(),
        default: z.string(),
        enum: z.array(z.string()),
        description: z.string().optional(),
      })
      .optional(),
    aspectRatio: z
      .object({
        type: z.literal('string').optional(),
        default: z.string(),
        enum: z.array(z.string()),
        description: z.string().optional(),
      })
      .optional(),
    seed: z
      .object({
        type: z.tuple([z.literal('number'), z.literal('null')]).optional(),
        default: z.number().nullable().optional().default(null),
        minimum: z.number().optional().default(0),
        maximum: z.number().optional().default(MAX_SEED),
        description: z.string().optional(),
      })
      .optional(),
    steps: z
      .object({
        type: z.literal('number').optional(),
        default: z.number(),
        minimum: z.number(),
        maximum: z.number(),
        step: z.number().optional().default(1),
        description: z.string().optional(),
      })
      .optional(),
    cfg: z
      .object({
        type: z.literal('number').optional(),
        default: z.number(),
        minimum: z.number(),
        maximum: z.number(),
        step: z.number(),
        description: z.string().optional(),
      })
      .optional(),
  }),
});

// -------------------------- compute type StandardImageGenerationParameters from zod schema ----------------------------------
type SchemaProperties = Required<z.infer<typeof StdParamsZodSchema>['properties']>;
type TypeMapping<T> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends ['number', 'null']
      ? number | null
      : T extends ['string', 'null']
        ? string | null
        : T extends 'string'
          ? string
          : T extends 'boolean'
            ? boolean
            : never;
type _StandardImageGenerationParameters<P extends keyof SchemaProperties = keyof SchemaProperties> =
  {
    [key in P]-?: TypeMapping<SchemaProperties[key]['type']>;
  };

export type _StdImageGenParams = _StandardImageGenerationParameters;
export type StdImageGenParams = Omit<
  Omit<_StdImageGenParams, 'imageUrls'> & {
    imageUrls: string[];
  },
  never
>;
export type StdImageGenParamsKeys = keyof StdImageGenParams;
// like:
/*
type StdImageGenParams = {
    prompt: string;
    imageUrls: string[];
    width: number;
    height: number;
    size: string;
    aspectRatio: string;
    seed: number | null;
    steps: number;
    cfg: number;
}
*/
