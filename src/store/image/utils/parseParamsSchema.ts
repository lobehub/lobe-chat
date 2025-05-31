import {
  StandardImageGenerationParameters,
  StandardParametersSchemaZodSchema,
} from './StandardParameters';

export function parseParamsSchema(schema: Record<string, any>) {
  const paramsSchema = StandardParametersSchemaZodSchema.parse(schema);
  const properties = paramsSchema.properties;
  const defaultValues = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      return [key, value.default];
    }),
  ) as Partial<StandardImageGenerationParameters>;

  return {
    defaultValues,
    properties,
  };
}
