import { ChatImageItem, ChatMessage, OpenAIChatMessage } from '@lobechat/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { contextEngineering, processImageList } from './contextEngineering';
import * as helpers from './helper';

// 默认设置 isServerMode 为 false
let isServerMode = false;

vi.mock('@lobechat/const', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    get isServerMode() {
      return isServerMode;
    },
    isDeprecatedEdition: false,
    isDesktop: false,
  };
});

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('processImageList', () => {
  it('should return empty array if model cannot use vision (non-deprecated)', async () => {
    vi.spyOn(helpers, 'isCanUseVision').mockReturnValue(false);

    const result = await processImageList({
      imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
      model: 'any-model',
      provider: 'any-provider',
    });
    expect(result).toEqual([]);
  });

  it('should process images if model can use vision (non-deprecated)', async () => {
    vi.spyOn(helpers, 'isCanUseVision').mockReturnValue(true);

    const result = await processImageList({
      imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
      model: 'any-model',
      provider: 'any-provider',
    });
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('image_url');
  });

  it('should return empty array when vision disabled in deprecated edition', async () => {
    const spy = vi.spyOn(helpers, 'isCanUseVision').mockReturnValue(false);

    const result = await processImageList({
      imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
      model: 'any-model',
      provider: 'any-provider',
    });

    expect(spy).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

describe('processMessages', () => {
  describe('handle with files content in server mode', () => {
    it('should includes files', async () => {
      isServerMode = true;
      // Mock isCanUseVision to return true for vision models
      vi.spyOn(helpers, 'isCanUseVision').mockReturnValue(true);

      const messages = [
        {
          content: 'Hello',
          role: 'user',
          imageList: [
            {
              id: 'imagecx1',
              url: 'http://example.com/xxx0asd-dsd.png',
              alt: 'ttt.png',
            },
          ],
          fileList: [
            {
              fileType: 'plain/txt',
              size: 100000,
              id: 'file1',
              url: 'http://abc.com/abc.txt',
              name: 'abc.png',
            },
            {
              id: 'file_oKMve9qySLMI',
              name: '2402.16667v1.pdf',
              type: 'application/pdf',
              size: 11256078,
              url: 'https://xxx.com/ppp/480497/5826c2b8-fde0-4de1-a54b-a224d5e3d898.pdf',
            },
          ],
        }, // Message with files
        { content: 'Hey', role: 'assistant' }, // Regular user message
      ] as ChatMessage[];

      const output = await contextEngineering({
        messages,
        model: 'gpt-4o',
        provider: 'openai',
      });

      expect(output).toEqual([
        {
          content: [
            {
              text: `Hello

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>
<images>
<images_docstring>here are user upload images you can refer to</images_docstring>
<image name="ttt.png" url="http://example.com/xxx0asd-dsd.png"></image>
</images>
<files>
<files_docstring>here are user upload files you can refer to</files_docstring>
<file id="file1" name="abc.png" type="plain/txt" size="100000" url="http://abc.com/abc.txt"></file>
<file id="file_oKMve9qySLMI" name="2402.16667v1.pdf" type="undefined" size="11256078" url="https://xxx.com/ppp/480497/5826c2b8-fde0-4de1-a54b-a224d5e3d898.pdf"></file>
</files>
</files_info>
<!-- END SYSTEM CONTEXT -->`,
              type: 'text',
            },
            {
              image_url: { detail: 'auto', url: 'http://example.com/xxx0asd-dsd.png' },
              type: 'image_url',
            },
          ],
          role: 'user',
        },
        {
          content: 'Hey',
          role: 'assistant',
        },
      ]);

      isServerMode = false;
    });

    it('should include image files in server mode', async () => {
      isServerMode = true;

      vi.spyOn(helpers, 'isCanUseVision').mockReturnValue(false);

      const messages = [
        {
          content: 'Hello',
          role: 'user',
          imageList: [
            {
              id: 'file1',
              url: 'http://example.com/image.jpg',
              alt: 'abc.png',
            },
          ],
        }, // Message with files
        { content: 'Hey', role: 'assistant' }, // Regular user message
      ] as ChatMessage[];
      const output = await contextEngineering({
        messages,
        provider: 'openai',
        model: 'gpt-4-vision-preview',
      });

      expect(output).toEqual([
        {
          content: [
            {
              text: `Hello

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>
<images>
<images_docstring>here are user upload images you can refer to</images_docstring>
<image name="abc.png" url="http://example.com/image.jpg"></image>
</images>

</files_info>
<!-- END SYSTEM CONTEXT -->`,
              type: 'text',
            },
          ],
          role: 'user',
        },
        {
          content: 'Hey',
          role: 'assistant',
        },
      ]);

      isServerMode = false;
    });
  });

  it('should handle empty tool calls messages correctly', async () => {
    const messages = [
      {
        content: '## Tools\n\nYou can use these tools',
        role: 'system',
      },
      {
        content: '',
        role: 'assistant',
        tool_calls: [],
      },
    ] as ChatMessage[];

    const result = await contextEngineering({
      messages,
      model: 'gpt-4',
      provider: 'openai',
    });

    expect(result).toEqual([
      {
        content: '## Tools\n\nYou can use these tools',
        role: 'system',
      },
      {
        content: '',
        role: 'assistant',
      },
    ]);
  });

  it('should handle assistant messages with reasoning correctly', async () => {
    const messages = [
      {
        role: 'assistant',
        content: 'The answer is 42.',
        reasoning: {
          content: 'I need to calculate the answer to life, universe, and everything.',
          signature: 'thinking_process',
        },
      },
    ] as ChatMessage[];

    const result = await contextEngineering({
      messages,
      model: 'gpt-4',
      provider: 'openai',
    });

    expect(result).toEqual([
      {
        content: [
          {
            signature: 'thinking_process',
            thinking: 'I need to calculate the answer to life, universe, and everything.',
            type: 'thinking',
          },
          {
            text: 'The answer is 42.',
            type: 'text',
          },
        ],
        role: 'assistant',
      },
    ]);
  });

  it('should inject INBOX_GUIDE_SYSTEMROLE for welcome questions in inbox session', async () => {
    // Don't mock INBOX_GUIDE_SYSTEMROLE, use the real one
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: 'Hello, this is my first question',
        createdAt: Date.now(),
        id: 'test-welcome',
        meta: {},
        updatedAt: Date.now(),
      },
    ];

    const result = await contextEngineering(
      {
        messages,
        model: 'gpt-4',
        provider: 'openai',
      },
      {
        isWelcomeQuestion: true,
        trace: { sessionId: 'inbox' },
      },
    );

    // Should have system message with inbox guide content
    const systemMessage = result.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeDefined();
    // Check for characteristic content of the actual INBOX_GUIDE_SYSTEMROLE
    expect(systemMessage!.content).toContain('LobeChat Support Assistant');
    expect(systemMessage!.content).toContain('LobeHub');
    expect(Object.keys(systemMessage!).length).toEqual(2);
  });

  it('should inject historySummary into system message when provided', async () => {
    const historySummary = 'Previous conversation summary: User discussed AI topics.';

    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: 'Continue our discussion',
        createdAt: Date.now(),
        id: 'test-history',
        meta: {},
        updatedAt: Date.now(),
      },
    ];

    const result = await contextEngineering(
      {
        messages,
        model: 'gpt-4',
        provider: 'openai',
      },
      {
        historySummary,
      },
    );

    // Should have system message with history summary
    const systemMessage = result.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeDefined();
    expect(systemMessage!.content).toContain(historySummary);
    expect(Object.keys(systemMessage!).length).toEqual(2);
  });
  describe('getAssistantContent', () => {
    it('should handle assistant message with imageList and content', async () => {
      // Mock isCanUseVision to return true for vision models
      vi.spyOn(helpers, 'isCanUseVision').mockReturnValue(true);

      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: 'Here is an image.',
          imageList: [{ id: 'img1', url: 'http://example.com/image.png', alt: 'test.png' }],
          createdAt: Date.now(),
          id: 'test-id',
          meta: {},
          updatedAt: Date.now(),
        },
      ];
      const result = await contextEngineering({
        messages,
        model: 'gpt-4-vision-preview',
        provider: 'openai',
      });

      expect(result[0].content).toEqual([
        { text: 'Here is an image.', type: 'text' },
        { image_url: { detail: 'auto', url: 'http://example.com/image.png' }, type: 'image_url' },
      ]);
    });

    it('should handle assistant message with imageList but no content', async () => {
      // Mock isCanUseVision to return true for vision models
      vi.spyOn(helpers, 'isCanUseVision').mockReturnValue(true);

      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: '',
          imageList: [{ id: 'img1', url: 'http://example.com/image.png', alt: 'test.png' }],
          createdAt: Date.now(),
          id: 'test-id-2',
          meta: {},
          updatedAt: Date.now(),
        },
      ];
      const result = await contextEngineering({
        messages,
        model: 'gpt-4-vision-preview',
        provider: 'openai',
      });

      expect(result[0].content).toEqual([
        { image_url: { detail: 'auto', url: 'http://example.com/image.png' }, type: 'image_url' },
      ]);
    });
  });

  it('should not include tool_calls for assistant message if model does not support tools', async () => {
    // Mock isCanUseFC to return false
    vi.spyOn(helpers, 'isCanUseFC').mockReturnValue(false);

    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: 'I have a tool call.',
        tools: [
          {
            id: 'tool_123',
            type: 'default',
            apiName: 'testApi',
            arguments: '{}',
            identifier: 'test-plugin',
          },
        ],
        createdAt: Date.now(),
        id: 'test-id-3',
        meta: {},
        updatedAt: Date.now(),
      },
    ];

    const result = await contextEngineering({
      messages,
      model: 'some-model-without-fc',
      provider: 'openai',
    });

    expect(result[0].tool_calls).toBeUndefined();
    expect(result[0].content).toBe('I have a tool call.');
  });
});
