import { renderPlaceholderTemplate } from '@lobechat/context-engine';
import type { ChatCompletionTool } from '@lobechat/model-runtime';
import { GenerateObjectSchema, ModelRuntime } from '@lobechat/model-runtime';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

import { ExtractionMessage, ExtractorOptions, TemplateProps } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';

const conversationToText = (messages: ExtractionMessage[]): string => {
  return messages
    .map((message) => {
      const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
      return `${role}:\n${message.content}`;
    })
    .join('\n\n');
};

export interface BaseMemoryExtractorConfig {
  model: string;
  modelRuntime: ModelRuntime;
  promptRoot: string;
}

export abstract class BaseMemoryExtractor<
  TOutput,
  TOptions extends ExtractorOptions = ExtractorOptions,
> {
  private promptTemplate: string | null = null;
  protected readonly model: string;
  protected readonly runtime: ModelRuntime;
  private readonly promptRoot: string;

  constructor(config: BaseMemoryExtractorConfig) {
    this.model = config.model;
    this.runtime = config.modelRuntime;
    this.promptRoot = config.promptRoot;
  }

  protected abstract getPromptFileName(): string;
  protected abstract getResultSchema(): z.ZodType<TOutput>;
  protected abstract buildUserPrompt(conversationText: string): string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getSchema(_options: TOptions): GenerateObjectSchema | undefined {
    const schema = this.getResultSchema();
    return buildGenerateObjectSchema(schema, {
      name: this.getPromptFileName().replaceAll(/\W+/g, '_'),
    });
  }

  protected getTemplateProps(options: TOptions): TemplateProps {
    return {
      language: options.language || 'English',
      topK: options.topK ?? 10,
      username: options.username || 'User',
    } satisfies TemplateProps;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTools(_options: TOptions): ChatCompletionTool[] | undefined {
    return undefined;
  }

  private async ensurePromptTemplate(): Promise<void> {
    if (this.promptTemplate) return;

    const filePath = path.join(this.promptRoot, this.getPromptFileName());
    this.promptTemplate = await readFile(filePath, 'utf8');
  }

  private buildSystemPrompt(options: TOptions): string {
    return renderPlaceholderTemplate(this.promptTemplate || '', this.getTemplateProps(options));
  }

  async extract(messages: ExtractionMessage[], options: TOptions): Promise<TOutput> {
    await this.ensurePromptTemplate();

    const systemPrompt = this.buildSystemPrompt(options);
    const conversationText = conversationToText(messages);
    const userPrompt = this.buildUserPrompt(conversationText);

    const payload = {
      messages: [
        { content: systemPrompt, role: 'system' as const },
        { content: userPrompt, role: 'user' as const },
      ],
      model: this.model,
      schema: this.getSchema(options),
      tools: this.getTools(options),
    };

    const result = await this.runtime.generateObject(payload);

    return this.getResultSchema().parse(result);
  }
}
