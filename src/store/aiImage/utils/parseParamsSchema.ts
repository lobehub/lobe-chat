import { StandardAiImageParameters, paramsSchemaSchema } from './StandardAiImageParameters';

export function parseParamsSchema(schema: Record<string, any>) {
  const paramsSchema = paramsSchemaSchema.parse(schema);
  const properties = paramsSchema.properties;

  const parameters = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      return [key, value.default];
    }),
  ) as Partial<StandardAiImageParameters>;

  return {
    parametersProperties: properties,
    parametersValues: parameters,
  };
}
