import { describe, expect, it } from 'vitest';

import { testService } from '~test-utils';
import { PluginService, pluginService } from './index';

describe('PluginService', () => {
  describe('service instance', () => {
    it('should export pluginService instance', () => {
      expect(pluginService).toBeInstanceOf(PluginService);
    });
  });

  describe('instance methods', () => {
    testService(PluginService, { checkAsync: false });
  });
});
