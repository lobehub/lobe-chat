import { ChatImageItem, ChatVideoItem, UIChatMessage } from '@lobechat/types';
import { describe, expect, it, vi } from 'vitest';

import type { PipelineContext } from '../../types';
import { MessageContentProcessor } from '../MessageContent';

vi.mock('@lobechat/utils/imageToBase64', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lobechat/utils/imageToBase64')>();
  return {
    ...actual,
    imageUrlToBase64: vi.fn().mockResolvedValue({
      base64: 'base64-data',
      mimeType: 'image/png',
    }),
  };
});

const createContext = (messages: UIChatMessage[]): PipelineContext => ({
  initialState: { messages: [] } as any,
  messages,
  metadata: { model: 'gpt-4', provider: 'openai', maxTokens: 100000 },
  isAborted: false,
});

const mockIsCanUseVision = vi.fn();
const mockIsCanUseVideo = vi.fn();

describe('MessageContentProcessor', () => {
  describe('Image processing functionality', () => {
    it('should return empty content parts if model cannot use vision', async () => {
      mockIsCanUseVision.mockReturnValue(false);

      const processor = new MessageContentProcessor({
        model: 'any-model',
        provider: 'any-provider',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Since vision is not supported, should return plain text content
      expect(result.messages[0].content).toBe('Hello');
    });

    it('should process images if model can use vision', async () => {
      mockIsCanUseVision.mockReturnValue(true);

      const processor = new MessageContentProcessor({
        model: 'gpt-4-vision',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          imageList: [
            { url: 'http://example.com/image.jpg', alt: '', id: 'test' } as ChatImageItem,
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should return structured content with image
      expect(Array.isArray(result.messages[0].content)).toBe(true);
      const content = result.messages[0].content as any[];
      expect(content).toHaveLength(2);
      expect(content[0].type).toBe('text');
      expect(content[1].type).toBe('image_url');
      expect(content[1].image_url.url).toBe('http://example.com/image.jpg');
    });

    it('should handle vision disabled scenario correctly', async () => {
      mockIsCanUseVision.mockReturnValue(false);

      const processor = new MessageContentProcessor({
        model: 'text-model',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      expect(mockIsCanUseVision).toHaveBeenCalledWith('text-model', 'openai');
      // Should return plain text since vision is not supported
      expect(result.messages[0].content).toBe('Hello');
    });

    it('should process local image URLs to base64', async () => {
      mockIsCanUseVision.mockReturnValue(true);

      const processor = new MessageContentProcessor({
        model: 'gpt-4-vision',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          imageList: [
            { url: 'http://127.0.0.1:3000/image.jpg', alt: '', id: 'test' } as ChatImageItem,
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as any[];
      expect(content[1].image_url.url).toBe('data:image/png;base64,base64-data');
    });
  });

  describe('Assistant message with images', () => {
    it('should handle assistant message with imageList and content', async () => {
      mockIsCanUseVision.mockReturnValue(true);

      const processor = new MessageContentProcessor({
        model: 'gpt-4-vision',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'Here is an image.',
          imageList: [
            { id: 'img1', url: 'http://example.com/image.png', alt: 'test.png' } as ChatImageItem,
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as any[];
      expect(content).toEqual([
        { text: 'Here is an image.', type: 'text' },
        { image_url: { detail: 'auto', url: 'http://example.com/image.png' }, type: 'image_url' },
      ]);
    });

    it('should handle assistant message with imageList but no content', async () => {
      mockIsCanUseVision.mockReturnValue(true);

      const processor = new MessageContentProcessor({
        model: 'gpt-4-vision',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: '',
          imageList: [
            { id: 'img1', url: 'http://example.com/image.png', alt: 'test.png' } as ChatImageItem,
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as any[];
      expect(content).toEqual([
        { image_url: { detail: 'auto', url: 'http://example.com/image.png' }, type: 'image_url' },
      ]);
    });
  });

  describe('File context processing', () => {
    it('should add file context when enabled', async () => {
      mockIsCanUseVision.mockReturnValue(false);

      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: true },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          imageList: [{ id: 'img1', url: 'http://example.com/image.jpg', alt: 'test.png' }],
          fileList: [
            {
              id: 'file1',
              name: 'test.txt',
              fileType: 'text/plain',
              size: 100,
              url: 'http://example.com/test.txt',
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should return structured content when has files and images
      expect(Array.isArray(result.messages[0].content)).toBe(true);
      const content = result.messages[0].content as any[];
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toContain('SYSTEM CONTEXT');
      expect(content[0].text).toContain('Hello');
    });

    it('should not add file context when disabled', async () => {
      mockIsCanUseVision.mockReturnValue(false);

      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          fileList: [
            {
              id: 'file1',
              name: 'test.txt',
              fileType: 'text/plain',
              size: 100,
              url: 'http://example.com/test.txt',
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should not include file context
      expect(result.messages[0].content).toBe('Hello');
    });
  });

  describe('Reasoning/thinking content', () => {
    it('should handle assistant messages with reasoning correctly', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is 42.',
          reasoning: {
            content: 'I need to calculate the answer to life, universe, and everything.',
            signature: 'thinking_process',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as any[];
      expect(content).toEqual([
        {
          signature: 'thinking_process',
          thinking: 'I need to calculate the answer to life, universe, and everything.',
          type: 'thinking',
        },
        {
          text: 'The answer is 42.',
          type: 'text',
        },
      ]);
    });
  });

  describe('Message processing metadata', () => {
    it('should update processing metadata correctly', async () => {
      mockIsCanUseVision.mockReturnValue(false);

      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: true },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test1',
          role: 'user',
          content: 'Hello',
          imageList: [{ id: 'img1', url: 'http://example.com/image.jpg', alt: 'test.png' }],
          fileList: [
            {
              id: 'file1',
              name: 'test.txt',
              fileType: 'text/plain',
              size: 100,
              url: 'http://example.com/test.txt',
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
        {
          id: 'test2',
          role: 'assistant',
          content: 'Response',
          reasoning: {
            content: 'Thinking...',
            signature: 'thinking',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      expect(result.metadata.messageContentProcessed).toBe(2);
      expect(result.metadata.userMessagesProcessed).toBe(1);
      expect(result.metadata.assistantMessagesProcessed).toBe(1);
    });
  });

  describe('Video processing functionality', () => {
    it('should return empty video content parts if model cannot use video', async () => {
      mockIsCanUseVideo.mockReturnValue(false);

      const processor = new MessageContentProcessor({
        model: 'any-model',
        provider: 'any-provider',
        isCanUseVideo: mockIsCanUseVideo,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          videoList: [{ url: 'video_url', alt: 'test video', id: 'test' } as ChatVideoItem],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should return plain text when video is not supported
      expect(result.messages[0].content).toBe('Hello');
    });

    it('should process videos if model can use video', async () => {
      mockIsCanUseVideo.mockReturnValue(true);

      const processor = new MessageContentProcessor({
        model: 'gpt-4-vision',
        provider: 'openai',
        isCanUseVideo: mockIsCanUseVideo,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          videoList: [
            { url: 'http://example.com/video.mp4', alt: 'test video', id: 'test1' },
            { url: 'http://example.com/video2.mp4', alt: 'test video 2', id: 'test2' },
          ] as ChatVideoItem[],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as any[];
      expect(content).toHaveLength(3); // text + 2 videos
      expect(content[0].type).toBe('text');
      expect(content[0].text).toBe('Hello');
      expect(content[1].type).toBe('video_url');
      expect(content[1].video_url.url).toBe('http://example.com/video.mp4');
      expect(content[2].type).toBe('video_url');
      expect(content[2].video_url.url).toBe('http://example.com/video2.mp4');
    });

    it('should handle video disabled scenario correctly', async () => {
      mockIsCanUseVideo.mockReturnValue(false);

      const processor = new MessageContentProcessor({
        model: 'text-model',
        provider: 'openai',
        isCanUseVideo: mockIsCanUseVideo,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Analyze this video',
          videoList: [
            { url: 'http://example.com/video.mp4', alt: 'test video', id: 'test' },
          ] as ChatVideoItem[],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should return plain text only when video not supported
      expect(result.messages[0].content).toBe('Analyze this video');
    });

    it('should include videos in file context when enabled', async () => {
      mockIsCanUseVideo.mockReturnValue(false); // Video processing disabled but file context enabled

      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVideo: mockIsCanUseVideo,
        fileContext: { enabled: true, includeFileUrl: true },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Hello',
          videoList: [
            {
              id: 'video1',
              url: 'http://example.com/video.mp4',
              alt: 'Test video',
            },
          ] as ChatVideoItem[],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should return structured content when has videos and file context enabled
      expect(Array.isArray(result.messages[0].content)).toBe(true);
      const content = result.messages[0].content as any[];
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toContain('SYSTEM CONTEXT');
      expect(content[0].text).toContain('Hello');
    });

    it('should handle mixed images and videos correctly', async () => {
      mockIsCanUseVision.mockReturnValue(true);
      mockIsCanUseVideo.mockReturnValue(true);

      const processor = new MessageContentProcessor({
        model: 'gpt-4-vision',
        provider: 'openai',
        isCanUseVideo: mockIsCanUseVideo,
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'user',
          content: 'Analyze these media files',
          imageList: [
            { url: 'http://example.com/image.jpg', alt: 'test image', id: 'img1' },
          ] as ChatImageItem[],
          videoList: [
            { url: 'http://example.com/video.mp4', alt: 'test video', id: 'vid1' },
          ] as ChatVideoItem[],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as any[];
      expect(content).toHaveLength(3); // text + image + video
      expect(content[0].type).toBe('text');
      expect(content[0].text).toBe('Analyze these media files');
      expect(content[1].type).toBe('image_url');
      expect(content[1].image_url.url).toBe('http://example.com/image.jpg');
      expect(content[2].type).toBe('video_url');
      expect(content[2].video_url.url).toBe('http://example.com/video.mp4');
    });
  });

  describe('Include historical thinking content', () => {
    it('should embed historical thinking content when enabled', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this carefully.',
            signature: undefined, // non-signature mode
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      expect(content).toBe(
        '<think>Let me think about this carefully.</think>\nThe answer is correct.',
      );
    });

    it('should not embed thinking content when disabled', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: false,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this carefully.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      expect(content).toBe('The answer is correct.');
    });

    it('should prioritize signature thinking over historical thinking', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Signature thinking content',
            signature: 'thinking_sig', // has signature
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // When signature exists, should use thinking mode (structured content) instead of embedding
      const content = result.messages[0].content as any[];
      expect(Array.isArray(content)).toBe(true);
      expect(content[0].type).toBe('thinking');
      expect(content[0].signature).toBe('thinking_sig');
      expect(content[1].type).toBe('text');
    });

    it('should not embed thinking content for Anthropic provider', async () => {
      const processor = new MessageContentProcessor({
        model: 'claude-3',
        provider: 'anthropic',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      // Should NOT embed thinking content for Anthropic
      expect(content).toBe('The answer is correct.');
      // Should NOT preserve reasoning field (Anthropic has its own format)
      expect(result.messages[0].reasoning).toBeUndefined();
    });

    it('should not embed thinking content for Google provider', async () => {
      const processor = new MessageContentProcessor({
        model: 'gemini-pro',
        provider: 'google',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      // Should NOT embed thinking content for Google
      expect(content).toBe('The answer is correct.');
      // Should NOT preserve reasoning field (Google has its own format)
      expect(result.messages[0].reasoning).toBeUndefined();
    });

    it('should not embed thinking content for Vertex provider', async () => {
      const processor = new MessageContentProcessor({
        model: 'gemini-pro',
        provider: 'vertex',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      // Should NOT embed thinking content for Vertex
      expect(content).toBe('The answer is correct.');
      // Should NOT preserve reasoning field (Vertex has its own format)
      expect(result.messages[0].reasoning).toBeUndefined();
    });

    it('should not embed thinking content when reasoning content is missing', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          // no reasoning
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      expect(content).toBe('The answer is correct.');
    });

    it('should not embed empty reasoning content', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'openai',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: '', // empty reasoning content
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      expect(content).toBe('The answer is correct.');
    });

    it('should work correctly with case-insensitive provider names', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'Anthropic', // uppercase
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      // Should recognize 'Anthropic' (uppercase) as excluded provider
      expect(content).toBe('The answer is correct.');
    });

    it('should embed thinking content for other OpenAI-compatible providers', async () => {
      const processor = new MessageContentProcessor({
        model: 'gpt-4',
        provider: 'azure-openai', // OpenAI-compatible but not excluded
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      const content = result.messages[0].content as string;
      // Should embed thinking for azure-openai (not in excluded list)
      expect(content).toBe('<think>Let me think about this.</think>\nThe answer is correct.');
    });

    it('should preserve reasoning field for MiniMax provider when includeHistoricalThinking is enabled', async () => {
      const processor = new MessageContentProcessor({
        model: 'MiniMax-M2',
        provider: 'minimax',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this carefully.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should preserve the original reasoning field for minimax
      expect(result.messages[0].content).toBe('The answer is correct.');
      expect(result.messages[0].reasoning).toEqual({
        content: 'Let me think about this carefully.',
        signature: undefined,
      });
    });

    it('should preserve reasoning field for Moonshot provider when includeHistoricalThinking is enabled', async () => {
      const processor = new MessageContentProcessor({
        model: 'moonshot-v1',
        provider: 'moonshot',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: true,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Analyzing the problem step by step.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // Should preserve the original reasoning field for moonshot
      expect(result.messages[0].content).toBe('The answer is correct.');
      expect(result.messages[0].reasoning).toEqual({
        content: 'Analyzing the problem step by step.',
        signature: undefined,
      });
    });

    it('should not preserve reasoning field for excluded providers when includeHistoricalThinking is disabled', async () => {
      const processor = new MessageContentProcessor({
        model: 'MiniMax-M2',
        provider: 'minimax',
        isCanUseVision: mockIsCanUseVision,
        fileContext: { enabled: false },
        includeHistoricalThinking: false,
      });

      const messages: UIChatMessage[] = [
        {
          id: 'test',
          role: 'assistant',
          content: 'The answer is correct.',
          reasoning: {
            content: 'Let me think about this.',
            signature: undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ];

      const result = await processor.process(createContext(messages));

      // When includeHistoricalThinking is false, reasoning field will be removed
      expect(result.messages[0].content).toBe('The answer is correct.');
      expect(result.messages[0].reasoning).toBeUndefined();
    });
  });
});
