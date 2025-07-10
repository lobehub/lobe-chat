import type { Simplify } from 'type-fest';
import { z } from 'zod';

export const MAX_SEED = 2 ** 31 - 1;

// 定义顶层的元规范 - 平铺结构
export const ModelParamsMetaSchema = z.object({
  /**
   * Prompt 是唯一一个每个模型都有的参数
   */
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
      min: z.number(),
      max: z.number(),
      step: z.number().optional().default(1),
      description: z.string().optional(),
    })
    .optional(),
  height: z
    .object({
      type: z.literal('number').optional(),
      default: z.number(),
      min: z.number(),
      max: z.number(),
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
      default: z.number().nullable().default(null),
      min: z.number().optional().default(0),
      max: z.number().optional().default(MAX_SEED),
      description: z.string().optional(),
    })
    .optional(),
  steps: z
    .object({
      type: z.literal('number').optional(),
      default: z.number(),
      min: z.number(),
      max: z.number(),
      step: z.number().optional().default(1),
      description: z.string().optional(),
    })
    .optional(),
  cfg: z
    .object({
      type: z.literal('number').optional(),
      default: z.number(),
      min: z.number(),
      max: z.number(),
      step: z.number(),
      description: z.string().optional(),
    })
    .optional(),
});
// 导出推断出的类型，供定义对象使用
export type ModelParamsDefinition = z.input<typeof ModelParamsMetaSchema>;
export type ModelParamsDefinitionParsed = z.output<typeof ModelParamsMetaSchema>;
export type ModelParamsKeys = Simplify<keyof ModelParamsDefinitionParsed>;

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
type TypeType<K extends ModelParamsKeys> = NonNullable<ModelParamsDefinitionParsed[K]>['type'];
type DefaultType<K extends ModelParamsKeys> = NonNullable<
  ModelParamsDefinitionParsed[K]
>['default'];
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
export function validateModelParamsDefinition(
  paramsDefinition: unknown,
): ModelParamsDefinitionParsed {
  return ModelParamsMetaSchema.parse(paramsDefinition);
}

/**
 * 从参数定义对象提取默认值
 */
export function extractDefaultValues(definition: ModelParamsDefinition) {
  // 部分默认值从 ModelParamsMetaSchema 中获取
  const definitionWithDefault = ModelParamsMetaSchema.parse(definition);
  return Object.fromEntries(
    Object.entries(definitionWithDefault).map(([key, value]) => {
      return [key, value.default];
    }),
  ) as RuntimeImageGenParams;
}
