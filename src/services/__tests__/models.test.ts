import { Mock, describe, expect, it, vi } from 'vitest';

import { ModelsService } from '../models';

vi.stubGlobal('fetch', vi.fn());

// 创建一个测试用的 ModelsService 实例

const modelsService = new ModelsService();

describe('ModelsService', () => {
  describe('getModels', () => {
    it('should call the appropriate endpoint for a generic provider', async () => {
      (fetch as Mock).mockResolvedValueOnce(new Response(JSON.stringify({ models: [] })));

      await modelsService.getModels('openai');

      expect(fetch).toHaveBeenCalled();
    });
  });
});
