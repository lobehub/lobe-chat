import type { Simplify } from 'type-fest';
import { z } from 'zod';

export const MAX_SEED = 2 ** 31 - 1;

// 定义顶层的元规范 - 平铺结构
export const ModelParamsMetaSchema = z.object({
  aspectRatio: z
    .object({
      default: z.string(),
      description: z.string().optional(),
      enum: z.array(z.string()),
      type: z.literal('string').optional(),
    })
    .optional(),

  cfg: z
    .object({
      default: z.number(),
      description: z.string().optional(),
      max: z.number(),
      min: z.number(),
      step: z.number(),
      type: z.literal('number').optional(),
    })
    .optional(),

  height: z
    .object({
      default: z.number(),
      description: z.string().optional(),
      max: z.number(),
      min: z.number(),
      step: z.number().optional().default(1),
      type: z.literal('number').optional(),
    })
    .optional(),

  imageUrl: z
    .object({
      default: z.string().nullable().optional(),
      description: z.string().optional(),
      type: z.tuple([z.literal('string'), z.literal('null')]).optional(),
    })
    .optional(),

  imageUrls: z
    .object({
      default: z.array(z.string()),
      description: z.string().optional(),
      type: z.literal('array').optional(),
    })
    .optional(),

  /**
   * Prompt 是唯一一个每个模型都有的参数
   */
  prompt: z.object({
    default: z.string().optional().default(''),
    description: z.string().optional(),
    type: z.literal('string').optional(),
  }),

  seed: z
    .object({
      default: z.number().nullable().default(null),
      description: z.string().optional(),
      max: z.number().optional().default(MAX_SEED),
      min: z.number().optional().default(0),
      type: z.tuple([z.literal('number'), z.literal('null')]).optional(),
    })
    .optional(),

  size: z
    .object({
      default: z.string(),
      description: z.string().optional(),
      enum: z.array(z.string()),
      type: z.literal('string').optional(),
    })
    .optional(),

  steps: z
    .object({
      default: z.number(),
      description: z.string().optional(),
      max: z.number(),
      min: z.number(),
      step: z.number().optional().default(1),
      type: z.literal('number').optional(),
    })
    .optional(),

  width: z
    .object({
      default: z.number(),
      description: z.string().optional(),
      max: z.number(),
      min: z.number(),
      step: z.number().optional().default(1),
      type: z.literal('number').optional(),
    })
    .optional(),
});
// 导出推断出的类型，供定义对象使用
export type ModelParamsSchema = z.input<typeof ModelParamsMetaSchema>;
export type ModelParamsOutputSchema = z.output<typeof ModelParamsMetaSchema>;
export type ModelParamsKeys = Simplify<keyof ModelParamsOutputSchema>;

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
type TypeType<K extends ModelParamsKeys> = NonNullable<ModelParamsOutputSchema[K]>['type'];
type DefaultType<K extends ModelParamsKeys> = NonNullable<ModelParamsOutputSchema[K]>['default'];
type _StandardImageGenerationParameters<P extends ModelParamsKeys = ModelParamsKeys> = {
  [key in P]: NonNullable<TypeType<key>> extends 'array'
    ? DefaultType<key>
    : TypeMapping<TypeType<key>>;
};

export type RuntimeImageGenParams = Pick<_StandardImageGenerationParameters, 'prompt'> &
  Partial<Omit<_StandardImageGenerationParameters, 'prompt'>>;
export type RuntimeImageGenParamsKeys = keyof RuntimeImageGenParams;
export type RuntimeImageGenParamsValue = RuntimeImageGenParams[RuntimeImageGenParamsKeys];

// 验证函数
export function validateModelParamsSchema(paramsSchema: unknown): ModelParamsOutputSchema {
  return ModelParamsMetaSchema.parse(paramsSchema);
}

/**
 * 从参数定义对象提取默认值
 */
export function extractDefaultValues(paramsSchema: ModelParamsSchema) {
  // 部分默认值从 ModelParamsMetaSchema 中获取
  const schemaWithDefault = ModelParamsMetaSchema.parse(paramsSchema);
  return Object.fromEntries(
    Object.entries(schemaWithDefault).map(([key, value]) => {
      return [key, value.default];
    }),
  ) as RuntimeImageGenParams;
}
