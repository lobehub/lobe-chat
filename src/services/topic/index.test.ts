import { describe, expect, it } from 'vitest';

import { testService } from '~test-utils';
import { TopicService, topicService } from './index';

describe('TopicService', () => {
  describe('service instance', () => {
    it('should export topicService instance', () => {
      expect(topicService).toBeInstanceOf(TopicService);
    });
  });

  describe('instance methods', () => {
    testService(TopicService, { checkAsync: false });
  });
});
