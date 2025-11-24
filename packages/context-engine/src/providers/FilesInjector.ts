import { promptFileContents } from '@lobechat/prompts';
import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:FilesInjector');

export interface FileContent {
  content: string;
  error?: string;
  fileId: string;
  filename: string;
}

export interface FilesInjectorConfig {
  /** File contents to inject */
  fileContents?: FileContent[];
}

/**
 * Files Injector
 * Responsible for injecting files' full content into system context
 */
export class FilesInjector extends BaseProvider {
  readonly name = 'FilesInjector';

  constructor(
    private config: FilesInjectorConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    const fileContents = this.config.fileContents || [];

    // Skip injection if no files
    if (fileContents.length === 0) {
      log('No files to inject');
      return this.markAsExecuted(clonedContext);
    }

    // Format file contents as XML prompt
    const formattedContent = promptFileContents(fileContents);

    // Find the first user message index
    const firstUserIndex = clonedContext.messages.findIndex((msg) => msg.role === 'user');

    if (firstUserIndex === -1) {
      log('No user messages found, skipping injection');
      return this.markAsExecuted(clonedContext);
    }

    // Insert a new user message with file contents before the first user message
    // Mark it as application-level system injection
    const filesMessage = {
      content: formattedContent,
      createdAt: Date.now(),
      id: `files-${Date.now()}`,
      meta: {
        _systemInjection: 'files',
      },
      role: 'user' as const,
      updatedAt: Date.now(),
    };

    clonedContext.messages.splice(firstUserIndex, 0, filesMessage);

    // Update metadata
    clonedContext.metadata.filesInjected = true;
    clonedContext.metadata.filesCount = fileContents.length;

    log(`Files injected as new user message: ${fileContents.length} file(s)`);

    return this.markAsExecuted(clonedContext);
  }
}
