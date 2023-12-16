import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ShareGPTConversation } from '@/types/share';
import { parseMarkdown } from '@/utils/parseMarkdown';

import { SHARE_GPT_URL, shareGPTService } from '../share';

// Mock dependencies
vi.mock('@/utils/parseMarkdown', () => ({
  parseMarkdown: vi.fn(),
}));

global.fetch = vi.fn();

describe('ShareGPTService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create and return a ShareGPT URL when fetch is successful', async () => {
    // Arrange
    const mockId = '123abc';
    const conversation: ShareGPTConversation = {
      items: [
        { from: 'human', value: 'Hello' },
        { from: 'gpt', value: 'Hi there!' },
      ],
    };
    (parseMarkdown as Mock).mockResolvedValue('Parsed markdown');
    (fetch as Mock).mockResolvedValue({
      json: () => Promise.resolve({ id: mockId }),
    });

    // Act
    const url = await shareGPTService.createShareGPTUrl(conversation);

    // Assert
    expect(parseMarkdown).toHaveBeenCalledWith('Hi there!');
    expect(fetch).toHaveBeenCalledWith(SHARE_GPT_URL, expect.anything());
    expect(url).toBe(`https://shareg.pt/${mockId}`);
  });

  it('should throw an error when the fetch call fails', async () => {
    // Arrange
    const conversation: ShareGPTConversation = {
      items: [{ from: 'human', value: 'Hello' }],
    };
    (fetch as Mock).mockRejectedValue(new Error('Network error'));

    // Act & Assert
    await expect(shareGPTService.createShareGPTUrl(conversation)).rejects.toThrow('Network error');
  });

  it('should not parse markdown for items not from gpt', async () => {
    // Arrange
    const mockId = '123abc';
    const conversation: ShareGPTConversation = {
      items: [
        { from: 'human', value: 'Hello' },
        { from: 'human', value: 'How are you?' },
      ],
    };
    (fetch as Mock).mockResolvedValue({
      json: () => Promise.resolve({ id: mockId }),
    });

    // Act
    await shareGPTService.createShareGPTUrl(conversation);

    // Assert
    expect(parseMarkdown).not.toHaveBeenCalled();
  });

  it('should throw an error if the response does not contain an id', async () => {
    // Arrange
    const conversation: ShareGPTConversation = {
      items: [{ from: 'human', value: 'Hello' }],
    };
    (fetch as Mock).mockResolvedValue({
      json: () => Promise.resolve({}),
    });

    // Act & Assert
    await expect(shareGPTService.createShareGPTUrl(conversation)).rejects.toThrow();
  });
});
