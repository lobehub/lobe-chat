/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { z } from 'zod';

export const paramsSchemaSchema = z.object({
  type: z.literal('object'),
  required: z.array(z.string()),
  properties: z.object({
    prompt: z.object({
      type: z.literal('string').optional(),
      description: z.string().optional(),
      default: z.string().optional(),
    }),
    width: z
      .object({
        type: z.literal('number').optional(),
        default: z.number(),
        minimum: z.number(),
        maximum: z.number(),
        step: z.number(),
        description: z.string().optional(),
      })
      .optional(),
    height: z
      .object({
        type: z.literal('number').optional(),
        default: z.number(),
        minimum: z.number(),
        maximum: z.number(),
        step: z.number(),
        description: z.string().optional(),
      })
      .optional(),
    seed: z
      .object({
        type: z.tuple([z.literal('number'), z.literal('null')]).optional(),
        default: z.number().nullable(),
        minimum: z.number(),
        maximum: z.number(),
        description: z.string().optional(),
      })
      .optional(),
    steps: z
      .object({
        type: z.literal('number').optional(),
        default: z.number(),
        minimum: z.number(),
        maximum: z.number(),
        step: z.number(),
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

type SchemaProperties = Required<z.infer<typeof paramsSchemaSchema>['properties']>;
type TypeMapping<T> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends ['number', 'null']
      ? number | null
      : T extends 'string'
        ? string
        : T extends 'boolean'
          ? boolean
          : never;
type _StandardAiImageParameters<P extends keyof SchemaProperties = keyof SchemaProperties> = {
  [key in P]-?: TypeMapping<SchemaProperties[key]['type']>;
};

export type StandardAiImageParameters = _StandardAiImageParameters;
export type StandardAiImageParametersKeys = keyof StandardAiImageParameters;

// like:
/*
type StandardAiImageParameters = {
    prompt: string;
    width: number;
    height: number;
    seed: number | null;
    steps: number;
    cfg: number;
}
*/
