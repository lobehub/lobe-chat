import { DeepPartial } from 'utility-types';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOBE_URL_IMPORT_NAME } from '@/const/url';
import { UserSettings } from '@/types/user/settings';

import { shareService } from '../share';

// Mock dependencies
vi.mock('@/utils/parseMarkdown', () => ({
  parseMarkdown: vi.fn(),
}));

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});
describe('ShareGPTService', () => {
  describe('ShareViaUrl', () => {
    describe('createShareSettingsUrl', () => {
      it('should create a share settings URL with the provided settings', () => {
        const settings: DeepPartial<UserSettings> = {
          keyVaults: {
            openai: {
              apiKey: 'user-key',
            },
          },
        };
        const url = shareService.createShareSettingsUrl(settings);
        expect(url).toBe(
          `/?${LOBE_URL_IMPORT_NAME}=%7B%22keyVaults%22:%7B%22openai%22:%7B%22apiKey%22:%22user-key%22%7D%7D%7D`,
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
});
