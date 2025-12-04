import { ChatCompletionTool, GenerateObjectSchema, ModelRuntime } from '@lobechat/model-runtime';
import { conversationToText } from '@lobechat/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const DefaultModel = process.env.EXTRACT_MODEL || 'gpt-4.1-mini';

export interface ExtractorConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  provider: string;
}

export interface ExtractorOptions {
  availableCategories?: string[];
  existingContext?: string;
  language?: string;
  retrievedContext?: string;
  sessionDate?: string;
  topK?: number;
  username?: string;
}

export interface Message {
  content: string;
  role: string;
}

/**
 * Template variable renderer
 * Handles {{ xxx }}, {{ xxx ?? defaultValue }}, and {{ xxx || 'default' }} syntax
 */
function renderTemplate(template: string, props: Record<string, any>): string {
  let rendered = template;

  // Handle {{ xxx ?? defaultValue }} syntax (nullish coalescing)
  rendered = rendered.replaceAll(/{{\s*(\w+)\s*\?\?\s*([^}]+)\s*}}/g, (_, key, defaultValue) => {
    const value = props[key];
    if (value === undefined || value === null) {
      // Remove quotes from default value if present
      return defaultValue.trim().replaceAll(/^["']|["']$/g, '');
    }
    return String(value);
  });

  // Handle {{ xxx.join(', ') }} syntax (array join)
  rendered = rendered.replaceAll(
    /{{\s*(\w+)\.join\(["']([^"']+)["']\)\s*}}/g,
    (_, key, separator) => {
      const value = props[key];
      if (Array.isArray(value)) {
        return value.join(separator);
      }
      return '';
    },
  );

  // Handle {{ xxx || 'default' }} syntax (logical OR)
  rendered = rendered.replaceAll(/{{\s*(\w+)\s*\|\|\s*'([^']+)'\s*}}/g, (_, key, defaultValue) => {
    const value = props[key];
    if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
      return defaultValue;
    }
    return String(value);
  });

  // Handle simple {{ xxx }} syntax
  rendered = rendered.replaceAll(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = props[key];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });

  return rendered.trim();
}

/**
 * Base class for memory extractors
 * Provides common functionality for loading prompts, building messages, and calling LLM
 */
export abstract class BaseMemoryExtractor<TOutput, TInput = ExtractorOptions> {
  protected runtime: ModelRuntime;
  protected model: string;
  protected systemPromptTemplate: string = '';

  constructor(config: ExtractorConfig) {
    this.runtime = ModelRuntime.initializeWithProvider(config.provider, {
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.model = config.model || DefaultModel;
  }

  /**
   * Get the prompt file name for this extractor
   */
  protected abstract getPromptFileName(): string;

  /**
   * Get the JSON schema for structured output
   */
  protected getSchema?(options: TInput): GenerateObjectSchema;

  /**
   * Get tools for tools calling (optional)
   */
  protected getTools?(options: TInput): ChatCompletionTool[];

  /**
   * Get the Zod schema for result validation
   */
  protected abstract getResultSchema(): z.ZodType<TOutput>;

  /**
   * Build the user prompt for extraction
   */
  protected abstract buildUserPrompt(conversationText: string): string;

  /**
   * Load the prompt template from file
   */
  async loadPromptTemplate(): Promise<void> {
    if (this.systemPromptTemplate) return;
    const promptPath = path.join(__dirname, '../prompts', this.getPromptFileName());
    this.systemPromptTemplate = await fs.readFile(promptPath, 'utf8');
  }

  /**
   * Get template props for rendering
   * Can be overridden by subclasses to provide custom props
   */
  protected getTemplateProps(options: TInput): Record<string, any> {
    const opts = options as any;
    return {
      language: opts.language || 'Chinese',
      topK: opts.topK ?? 15,
      username: opts.username || 'User',
    };
  }

  /**
   * Build the system prompt with template variables
   */
  protected buildSystemPrompt(options: TInput): string {
    const props = this.getTemplateProps(options);
    return renderTemplate(this.systemPromptTemplate, props);
  }

  /**
   * Extract memory from messages
   */
  async extract(messages: Message[], options: TInput = {} as TInput): Promise<TOutput> {
    await this.loadPromptTemplate();

    const system = this.buildSystemPrompt(options);
    const conversation = conversationToText(messages);
    const user = this.buildUserPrompt(conversation);

    const result = await this.runtime.generateObject({
      messages: [
        { content: system, role: 'system' },
        { content: user, role: 'user' },
      ],
      model: this.model,
      schema: this.getSchema?.(options),
      tools: this.getTools?.(options),
    });

    return this.getResultSchema().parse(result);
  }
}
