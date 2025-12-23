import { promptUserMemory } from '@lobechat/prompts';
import type { UserMemoryData } from '@lobechat/prompts';
import debug from 'debug';

import { BaseFirstUserContentProvider } from '../base/BaseFirstUserContentProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:UserMemoryInjector');

export interface UserMemoryInjectorConfig {
  /** When the memories were fetched */
  fetchedAt?: number;
  /** User memories data */
  memories?: UserMemoryData;
}

/**
 * User Memory Injector
 * Responsible for injecting user memories into context before the first user message
 */
export class UserMemoryInjector extends BaseFirstUserContentProvider {
  readonly name = 'UserMemoryInjector';

  constructor(
    private config: UserMemoryInjectorConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected buildContent(_context: PipelineContext): string | null {
    const { memories, fetchedAt } = this.config;
    if (!memories) return null;

    const content = promptUserMemory({ fetchedAt, memories });

    if (!content) {
      log('No user memories to inject');
      return null;
    }

    const contextsCount = memories.contexts?.length || 0;
    const experiencesCount = memories.experiences?.length || 0;
    const preferencesCount = memories.preferences?.length || 0;

    log(
      `User memories prepared: ${contextsCount} context(s), ${experiencesCount} experience(s), ${preferencesCount} preference(s)`,
    );

    return content;
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const result = await super.doProcess(context);

    // Update metadata
    if (this.config.memories) {
      result.metadata.userMemoryInjected = true;
    }

    return result;
  }
}
