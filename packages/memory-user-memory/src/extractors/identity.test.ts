import { renderPlaceholderTemplate } from '@lobechat/context-engine';
import type { ModelRuntime } from '@lobechat/model-runtime';
import { readFile } from 'node:fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IdentityExtractor, IdentityExtractorTemplateProps, IdentityToolName } from './identity';

const runtimeMock = { generateObject: vi.fn() } as unknown as ModelRuntime;

const templateOptions: IdentityExtractorTemplateProps = {
  availableCategories: ['work', 'personal'],
  existingIdentitiesContext: 'existing identities',
  language: 'English',
  retrievedContexts: ['existing context'],
  sessionDate: '2024-06-01',
  topK: 3,
  username: 'User',
};

describe('IdentityExtractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes identity tools for add/update/remove flows', () => {
    const extractor = new IdentityExtractor({
      model: 'gpt-mock',
      modelRuntime: runtimeMock,
    });

    const tools = (extractor as any).getTools(templateOptions);
    expect(tools).toHaveLength(3);
    expect(tools?.map((tool: any) => tool.function?.name)).toEqual([
      IdentityToolName.addIdentity,
      IdentityToolName.updateIdentity,
      IdentityToolName.removeIdentity,
    ]);
  });

  it('does not build a generate object schema because the extractor uses tools only', () => {
    const extractor = new IdentityExtractor({
      model: 'gpt-mock',
      modelRuntime: runtimeMock,
    });

    expect((extractor as any).getSchema(templateOptions)).toBeUndefined();
  });

  it('returns full template props from options', () => {
    const extractor = new IdentityExtractor({
      model: 'gpt-mock',
      modelRuntime: runtimeMock,
    });

    expect((extractor as any).getTemplateProps(templateOptions)).toEqual({
      availableCategories: templateOptions.availableCategories,
      existingIdentitiesContext: templateOptions.existingIdentitiesContext,
      language: templateOptions.language,
      retrievedContext:
        templateOptions.retrievedContexts?.join('\n\n') || 'No similar memories retrieved.',
      sessionDate: templateOptions.sessionDate,
      topK: templateOptions.topK,
      username: templateOptions.username,
    });
  });

  it('throws when building user prompt without template', () => {
    const extractor = new IdentityExtractor({
      model: 'gpt-mock',
      modelRuntime: runtimeMock,
    });

    expect(() => (extractor as any).buildUserPrompt(templateOptions)).toThrowError(
      'Prompt template not loaded',
    );
  });

  it('renders user prompt with provided template props', async () => {
    const extractor = new IdentityExtractor({
      model: 'gpt-mock',
      modelRuntime: runtimeMock,
    });

    await extractor.ensurePromptTemplate();
    const result = (extractor as any).buildUserPrompt(templateOptions);
    const expectedProps = (extractor as any).getTemplateProps(templateOptions);

    expect(result).toBe(
      renderPlaceholderTemplate(
        await readFile(new URL('../prompts/layers/identity.md', import.meta.url).pathname, 'utf8'),
        expectedProps,
      ),
    );
  });
});
