import { readFile } from 'node:fs/promises';

import { GatekeeperResultSchema } from '../../src/schemas/gatekeeper';
import { zodToJsonSchema } from 'zod-to-json-schema';

interface PromptVars {
  // Align with production extractor input, but keep `messages` as a backward-compatible alias.
  additionalMessages?: { content: string; role: 'system' | 'user' | 'assistant' }[];
  messages?: { content: string; role: 'system' | 'user' | 'assistant' }[];
  retrievedContext?: string[];
  retrievedContexts?: string[];
  topK?: number;
}

const promptTemplatePath = new URL('../../src/prompts/gatekeeper.md', import.meta.url);

// Minimal placeholder renderer to avoid depending on the full context-engine during promptfoo runs.
const renderPlaceholderTemplate = (template: string, values: Record<string, unknown>) =>
  template.replaceAll(/{{\s*([^\s}]+)\s*}}/g, (_, key) => String(values[key] ?? ''));

const buildResponseFormat = () => {
  const fullSchema = zodToJsonSchema(GatekeeperResultSchema, 'gatekeeper_decision') as Record<
    string,
    unknown
  >;

  const defsSchema =
    (fullSchema as { $defs?: Record<string, unknown> }).$defs?.gatekeeper_decision ??
    (fullSchema as { definitions?: Record<string, unknown> }).definitions?.gatekeeper_decision;

  const jsonSchema = defsSchema ?? fullSchema;

  if (jsonSchema && typeof jsonSchema === 'object' && 'type' in jsonSchema) {
    const objectSchema = jsonSchema as Record<string, unknown>;

    if (objectSchema.type === 'object') {
      objectSchema.additionalProperties = false;
    }
  }

  return {
    type: 'json_schema' as const,
    json_schema: {
      name: 'gatekeeper_decision',
      schema: jsonSchema,
      strict: true,
    },
  };
};

export default async function generatePrompt({ vars }: { vars: PromptVars }) {
  const {
    additionalMessages = [],
    messages = [],
    retrievedContext,
    retrievedContexts,
    topK = 10,
  } = vars;

  const conversation = additionalMessages.length > 0 ? additionalMessages : messages;
  const retrieved = retrievedContexts ?? retrievedContext ?? [];

  const template = await readFile(promptTemplatePath, 'utf8');
  const filledPrompt = renderPlaceholderTemplate(template, {
    retrievedContext:
      retrieved && retrieved.length > 0 ? retrieved.join('\n\n') : 'No similar memories retrieved.',
    topK,
  });

  return {
    messages: [
      { content: filledPrompt, role: 'system' as const },
      ...conversation,
      { content: filledPrompt, role: 'user' as const },
    ],
    response_format: buildResponseFormat(),
  };
}
