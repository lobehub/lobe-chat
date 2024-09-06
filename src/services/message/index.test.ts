import { Mock, describe, expect, it, vi } from 'vitest';

import { CreateMessageParams, MessageModel } from '@/database/client/models/message';
import { ChatMessage, ChatMessageError, ChatPluginPayload } from '@/types/message';

import { messageService } from './index';

// Mock the MessageModel
vi.mock('@/database/client/models/message', () => {
  return {
    MessageModel: {
      count: vi.fn(),
    },
  };
});

describe('MessageService', () => {
  beforeEach(() => {
    // Reset all mocks before running each test case
    vi.resetAllMocks();
  });

  describe('hasMessages', () => {
    it('should return true if there are messages', async () => {
      // Setup
      (MessageModel.count as Mock).mockResolvedValue(1);

      // Execute
      const hasMessages = await messageService.hasMessages();

      // Assert
      expect(MessageModel.count).toHaveBeenCalled();
      expect(hasMessages).toBe(true);
    });

    it('should return false if there are no messages', async () => {
      // Setup
      (MessageModel.count as Mock).mockResolvedValue(0);

      // Execute
      const hasMessages = await messageService.hasMessages();

      // Assert
      expect(MessageModel.count).toHaveBeenCalled();
      expect(hasMessages).toBe(false);
    });
  });
});
