import { describe, expect, it, vi } from 'vitest';

import { KnowledgeInjector } from '../KnowledgeInjector';

// Mock the promptAgentKnowledge function
vi.mock('@lobechat/prompts', () => ({
  promptAgentKnowledge: vi.fn(({ fileContents, knowledgeBases }) => {
    if (
      (!fileContents || fileContents.length === 0) &&
      (!knowledgeBases || knowledgeBases.length === 0)
    ) {
      return '';
    }
    return `Knowledge: ${fileContents?.length || 0} files, ${knowledgeBases?.length || 0} knowledge bases`;
  }),
}));

describe('KnowledgeInjector', () => {
  const createContext = (messages: any[] = []) => ({
    initialState: {
      messages: [],
      model: 'gpt-4',
      provider: 'openai',
      systemRole: '',
      tools: [],
    },
    messages,
    metadata: {
      model: 'gpt-4',
      maxTokens: 4096,
    },
    isAborted: false,
  });

  it('should inject knowledge before the first user message', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [{ fileId: 'file-1', filename: 'doc.txt', content: 'File content' }],
      knowledgeBases: [{ id: 'kb-1', name: 'KB1', description: 'Knowledge base 1' }],
    });

    const context = createContext([
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]).toEqual(
      expect.objectContaining({
        role: 'user',
        content: 'Knowledge: 1 files, 1 knowledge bases',
        meta: { injectType: 'knowledge', systemInjection: true },
      }),
    );
    expect(result.messages[1]).toEqual(
      expect.objectContaining({
        id: '1',
        role: 'user',
        content: 'Hello',
      }),
    );
    expect(result.metadata.knowledgeInjected).toBe(true);
    expect(result.metadata.filesCount).toBe(1);
    expect(result.metadata.knowledgeBasesCount).toBe(1);
  });

  it('should inject knowledge with only file contents', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [
        { fileId: 'file-1', filename: 'doc1.txt', content: 'Content 1' },
        { fileId: 'file-2', filename: 'doc2.txt', content: 'Content 2' },
      ],
    });

    const context = createContext([
      {
        id: '1',
        role: 'user',
        content: 'Question',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].content).toBe('Knowledge: 2 files, 0 knowledge bases');
    expect(result.metadata.filesCount).toBe(2);
    expect(result.metadata.knowledgeBasesCount).toBe(0);
  });

  it('should inject knowledge with only knowledge bases', async () => {
    const provider = new KnowledgeInjector({
      knowledgeBases: [
        { id: 'kb-1', name: 'KB1', description: 'Base 1' },
        { id: 'kb-2', name: 'KB2', description: 'Base 2' },
        { id: 'kb-3', name: 'KB3', description: 'Base 3' },
      ],
    });

    const context = createContext([
      {
        id: '1',
        role: 'user',
        content: 'Query',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].content).toBe('Knowledge: 0 files, 3 knowledge bases');
    expect(result.metadata.filesCount).toBe(0);
    expect(result.metadata.knowledgeBasesCount).toBe(3);
  });

  it('should skip injection when no knowledge is configured', async () => {
    const provider = new KnowledgeInjector({});

    const context = createContext([
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].id).toBe('1');
    expect(result.metadata.knowledgeInjected).toBeUndefined();
  });

  it('should skip injection when empty arrays are provided', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [],
      knowledgeBases: [],
    });

    const context = createContext([
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].id).toBe('1');
    expect(result.metadata.knowledgeInjected).toBeUndefined();
  });

  it('should skip injection when no user messages exist', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [{ fileId: 'file-1', filename: 'doc.txt', content: 'Content' }],
    });

    const context = createContext([
      {
        id: '1',
        role: 'system',
        content: 'System message',
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Assistant message',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].id).toBe('1');
    expect(result.messages[1].id).toBe('2');
    expect(result.metadata.knowledgeInjected).toBeUndefined();
  });

  it('should handle empty message array', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [{ fileId: 'file-1', filename: 'doc.txt', content: 'Content' }],
    });

    const context = createContext([]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(0);
    expect(result.metadata.knowledgeInjected).toBeUndefined();
  });

  it('should inject before first user message when mixed message types exist', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [{ fileId: 'file-1', filename: 'doc.txt', content: 'Content' }],
    });

    const context = createContext([
      {
        id: '1',
        role: 'system',
        content: 'System',
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Assistant',
        createdAt: 2000,
        updatedAt: 2000,
      },
      {
        id: '3',
        role: 'user',
        content: 'First user message',
        createdAt: 3000,
        updatedAt: 3000,
      },
      {
        id: '4',
        role: 'user',
        content: 'Second user message',
        createdAt: 4000,
        updatedAt: 4000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(5);
    expect(result.messages[0].id).toBe('1');
    expect(result.messages[1].id).toBe('2');
    expect(result.messages[2]).toEqual(
      expect.objectContaining({
        role: 'user',
        content: 'Knowledge: 1 files, 0 knowledge bases',
        meta: { injectType: 'knowledge', systemInjection: true },
      }),
    );
    expect(result.messages[3].id).toBe('3');
    expect(result.messages[4].id).toBe('4');
  });

  it('should create unique message IDs based on timestamp', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [{ fileId: 'file-1', filename: 'doc.txt', content: 'Content' }],
    });

    const context = createContext([
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    const knowledgeMessage = result.messages[0];
    expect(knowledgeMessage.id).toMatch(/^knowledge-\d+$/);
    expect(knowledgeMessage.createdAt).toBeTypeOf('number');
    expect(knowledgeMessage.updatedAt).toBeTypeOf('number');
    expect(knowledgeMessage.createdAt).toBe(knowledgeMessage.updatedAt);
  });

  it('should not mutate the original context', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [{ fileId: 'file-1', filename: 'doc.txt', content: 'Content' }],
    });

    const originalMessages = [
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    const context = createContext(originalMessages);
    const originalLength = context.messages.length;
    const originalMetadata = { ...context.metadata };

    await provider.process(context);

    expect(context.messages.length).toBe(originalLength);
    expect(context.metadata).toEqual(originalMetadata);
  });

  it('should handle multiple files and knowledge bases correctly', async () => {
    const provider = new KnowledgeInjector({
      fileContents: [
        { fileId: 'file-1', filename: 'doc1.txt', content: 'Content 1' },
        { fileId: 'file-2', filename: 'doc2.txt', content: 'Content 2' },
        { fileId: 'file-3', filename: 'doc3.txt', content: 'Content 3' },
      ],
      knowledgeBases: [
        { id: 'kb-1', name: 'KB1', description: 'Base 1' },
        { id: 'kb-2', name: 'KB2', description: 'Base 2' },
      ],
    });

    const context = createContext([
      {
        id: '1',
        role: 'user',
        content: 'Question',
        createdAt: 1000,
        updatedAt: 1000,
      },
    ]);

    const result = await provider.process(context);

    expect(result.metadata.filesCount).toBe(3);
    expect(result.metadata.knowledgeBasesCount).toBe(2);
    expect(result.metadata.knowledgeInjected).toBe(true);
  });
});
