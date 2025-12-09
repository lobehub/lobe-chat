import { u } from 'unist-builder';
import { toXml } from 'xast-util-to-xml';
import type { Child } from 'xastscript';
import { x } from 'xastscript';

import { BaseProvider } from '../base/BaseProvider';
import type { UserMemoryData } from '../engine/messages/types';
import type { PipelineContext, ProcessorOptions } from '../types';

export interface UserMemoryInjectorConfig {
  /** When the memories were fetched */
  fetchedAt?: number;
  /** User memories data */
  memories?: UserMemoryData;
}

export class UserMemoryInjector extends BaseProvider {
  readonly name = 'UserMemoryInjector';

  constructor(
    private config: UserMemoryInjectorConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const { memories } = this.config;
    if (!memories) return context;

    const contextsCount = memories.contexts?.length || 0;
    const experiencesCount = memories.experiences?.length || 0;
    const preferencesCount = memories.preferences?.length || 0;
    if (contextsCount + experiencesCount + preferencesCount === 0) return context;

    const userMemoriesChildren: Child[] = [];
    if (memories.contexts) {
      memories.contexts.forEach((ctx) => {
        userMemoriesChildren.push(
          x('user_memories_context', { id: ctx.id || '' }, [
            x('context_title', ctx.title || ''),
            x('context_description', ctx.description || ''),
          ]),
        );
      });
    }
    if (memories.experiences) {
      memories.experiences.forEach((experience) => {
        userMemoriesChildren.push(
          x('user_memories_experience', { id: experience.id || '' }, [
            x('experience_situation', experience.situation || ''),
            x('experience_key_learning', experience.keyLearning || ''),
          ]),
        );
      });
    }
    if (memories.preferences) {
      memories.preferences.forEach((preference) => {
        userMemoriesChildren.push(
          x('user_memories_preference', { id: preference.id || '' }, [
            x('preference_conclusion_directives', preference.conclusionDirectives || ''),
          ]),
        );
      });
    }

    const memoryMessage = {
      content: toXml(
        u('root', [
          x(
            'user_memories',
            {
              contexts: contextsCount.toString(),
              experiences: experiencesCount.toString(),
              memory_fetched_at: new Date(this.config.fetchedAt || Date.now()).toISOString(),
              preferences: preferencesCount.toString(),
            },
            ...userMemoriesChildren,
          ),
        ]),
      ),
      createdAt: Date.now(),
      id: `user-memory-${Date.now()}`,
      meta: { source: 'userMemory' },
      role: 'system' as const,
      updatedAt: Date.now(),
    };

    const clonedContext = this.cloneContext(context);
    clonedContext.messages.unshift(memoryMessage);
    clonedContext.metadata.userMemoryInjected = true;

    return this.markAsExecuted(clonedContext);
  }
}
