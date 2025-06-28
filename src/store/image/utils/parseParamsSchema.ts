import { StdImageGenParams, StdParamsZodSchema } from './StandardParameters';

export function parseParamsSchema(schema: Record<string, any>) {
  const paramsSchema = StdParamsZodSchema.parse(schema);
  const { properties } = paramsSchema;
  const defaultValues = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      return [key, value.default];
    }),
  ) as Partial<StdImageGenParams>;

  return {
    defaultValues,
    properties,
  };
}
