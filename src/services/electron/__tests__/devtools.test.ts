import { dispatch } from '@lobechat/electron-client-ipc';
import { describe, expect, it, vi } from 'vitest';

import { electronDevtoolsService } from '../devtools';

vi.mock('@lobechat/electron-client-ipc', () => ({
  dispatch: vi.fn(),
}));

describe('DevtoolsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openDevtools', () => {
    it('should call dispatch with openDevtools', async () => {
      await electronDevtoolsService.openDevtools();
      expect(dispatch).toHaveBeenCalledWith('openDevtools');
    });

    it('should return void when dispatch succeeds', async () => {
      vi.mocked(dispatch).mockResolvedValueOnce();
      const result = await electronDevtoolsService.openDevtools();
      expect(result).toBeUndefined();
    });

    it('should throw error when dispatch fails', async () => {
      const error = new Error('Failed to open devtools');
      vi.mocked(dispatch).mockRejectedValueOnce(error);

      await expect(electronDevtoolsService.openDevtools()).rejects.toThrow(error);
    });
  });
});
