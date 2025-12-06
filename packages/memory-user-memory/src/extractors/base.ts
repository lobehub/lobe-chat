import { renderPlaceholderTemplate } from '@lobechat/context-engine';
import type { ChatCompletionTool, GenerateObjectPayload } from '@lobechat/model-runtime';
import { GenerateObjectSchema, ModelRuntime } from '@lobechat/model-runtime';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

import { ExtractorOptions, ExtractorTemplateProps, TemplateProps } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';

export interface BaseMemoryExtractorConfig {
  model: string;
  modelRuntime: ModelRuntime;

  promptRoot?: string;
}

export abstract class BaseMemoryExtractor<
  TOutput,
  TExtractorTemplateProps extends ExtractorTemplateProps = ExtractorTemplateProps,
  TExtractorOptions extends ExtractorOptions = ExtractorOptions,
> {
  protected readonly model: string;
  protected readonly runtime: ModelRuntime;

  protected promptTemplate: string | undefined;

  private readonly promptRoot: string;

  constructor(config: BaseMemoryExtractorConfig) {
    this.model = config.model;
    this.runtime = config.modelRuntime;
    this.promptRoot = config.promptRoot ?? new URL('../prompts', import.meta.url).pathname;
  }

  protected abstract getPromptFileName(): string;
  protected abstract getResultSchema(): z.ZodType<TOutput> | undefined;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getSchema(_options: TExtractorTemplateProps): GenerateObjectSchema | undefined {
    const schema = this.getResultSchema();
    if (!schema) return undefined;

    return buildGenerateObjectSchema(schema, {
      name: this.getPromptFileName().replaceAll(/\W+/g, '_'),
    });
  }

  protected getTemplateProps(options: TExtractorTemplateProps): TemplateProps {
    return {
      language: options.language || 'English',
      topK: options.topK ?? 10,
      username: options.username || 'User',
    } satisfies TemplateProps;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTools(_options: TExtractorTemplateProps): ChatCompletionTool[] | undefined {
    return undefined;
  }

  async ensurePromptTemplate(): Promise<void> {
    if (this.promptTemplate) return;

    const filePath = path.join(this.promptRoot, this.getPromptFileName());
    this.promptTemplate = await readFile(filePath, 'utf8');
  }

  private buildSystemPrompt(options: TExtractorTemplateProps): string {
    return renderPlaceholderTemplate(this.promptTemplate || '', this.getTemplateProps(options));
  }

  protected abstract buildUserPrompt(options: TExtractorTemplateProps): string;

  async structuredCall(options?: TExtractorOptions): Promise<TOutput> {
    await this.ensurePromptTemplate();

    const systemPrompt = this.buildSystemPrompt(options as unknown as TExtractorTemplateProps);
    const userPrompt = this.buildUserPrompt(options as unknown as TExtractorTemplateProps);

    const payload: GenerateObjectPayload = {
      messages: [
        { content: systemPrompt, role: 'system' as const },
        { content: userPrompt, role: 'user' as const },
        // TODO: additional messages typing issue
        ...((options?.additionalMessages || []) as GenerateObjectPayload['messages']),
      ],
      model: this.model,
      schema: this.getSchema(options as unknown as TExtractorTemplateProps),
      tools: this.getTools(options as unknown as TExtractorTemplateProps),
    };

    const result = await this.runtime.generateObject(payload);
    const schema = this.getResultSchema();
    return (schema ? schema.parse(result) : result) as TOutput;
  }
}
