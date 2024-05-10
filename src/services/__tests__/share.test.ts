import { DeepPartial } from 'utility-types';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOBE_URL_IMPORT_NAME } from '@/const/url';
import { GlobalSettings } from '@/types/settings';
import { ShareGPTConversation } from '@/types/share';
import { parseMarkdown } from '@/utils/parseMarkdown';

import { SHARE_GPT_URL, shareService } from '../share';

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
    const url = await shareService.createShareGPTUrl(conversation);

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
    await expect(shareService.createShareGPTUrl(conversation)).rejects.toThrow('Network error');
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
    await shareService.createShareGPTUrl(conversation);

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
    await expect(shareService.createShareGPTUrl(conversation)).rejects.toThrow();
  });
});

describe('ShareViaUrl', () => {
  describe('createShareSettingsUrl', () => {
    it('should create a share settings URL with the provided settings', () => {
      const settings: DeepPartial<GlobalSettings> = {
        languageModel: {
          openai: {
            apiKey: 'user-key',
          },
        },
      };
      const url = shareService.createShareSettingsUrl(settings);
      expect(url).toBe(
        `/?${LOBE_URL_IMPORT_NAME}=%7B%22languageModel%22:%7B%22openai%22:%7B%22apiKey%22:%22user-key%22%7D%7D%7D`,
      );
    });
  });

  describe('decodeShareSettings', () => {
    it('should decode share settings from search params', () => {
      const settings = '{"languageModel":{"openai":{"apiKey":"user-key"}}}';
      const decodedSettings = shareService.decodeShareSettings(settings);
      expect(decodedSettings).toEqual({
        data: {
          languageModel: {
            openai: {
              apiKey: 'user-key',
            },
          },
        },
      });
    });

    it('should return an error message if decoding fails', () => {
      const settings = '%7B%22theme%22%3A%22dark%22%2C%22fontSize%22%3A16%';
      const decodedSettings = shareService.decodeShareSettings(settings);
      expect(decodedSettings).toEqual({
        message: expect.any(String),
      });
    });
  });
});
