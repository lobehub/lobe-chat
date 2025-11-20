import { LocalFileItem, LocalMoveFilesResultItem } from '@lobechat/electron-client-ipc';
import { describe, expect, it, vi } from 'vitest';

import { localFileService } from '@/services/electron/localFileService';
import { ChatStore } from '@/store/chat';

import { localSystemSlice } from '../localSystem';

vi.mock('@/services/electron/localFileService', () => ({
  localFileService: {
    listLocalFiles: vi.fn(),
    moveLocalFiles: vi.fn(),
    readLocalFile: vi.fn(),
    readLocalFiles: vi.fn(),
    renameLocalFile: vi.fn(),
    searchLocalFiles: vi.fn(),
    writeFile: vi.fn(),
  },
}));

const mockSet = vi.fn();

const mockStore = {
  completeOperation: vi.fn(),
  failOperation: vi.fn(),
  internal_triggerLocalFileToolCalling: vi.fn(),
  messageOperationMap: {},
  optimisticUpdateMessageContent: vi.fn(),
  optimisticUpdateMessagePluginError: vi.fn(),
  optimisticUpdatePluginArguments: vi.fn(),
  optimisticUpdatePluginState: vi.fn(),
  set: mockSet,
  startOperation: vi.fn().mockReturnValue({
    abortController: new AbortController(),
    operationId: 'test-op-id',
  }),
} as unknown as ChatStore;

const createStore = () => {
  return localSystemSlice(
    (set) => ({
      ...mockStore,
      set,
    }),
    () => mockStore,
    {} as any,
  );
};

describe('localFileSlice', () => {
  const store = createStore();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('internal_triggerLocalFileToolCalling', () => {
    it('should handle successful calling', async () => {
      const mockContent = 'result content';
      const mockState = { state: 'test' };
      const mockService = vi
        .fn()
        .mockResolvedValue({ content: mockContent, state: mockState, success: true });

      await store.internal_triggerLocalFileToolCalling('test-id', mockService);

      expect(mockStore.startOperation).toBeCalled();
      expect(mockStore.completeOperation).toBeCalled();
      expect(mockStore.optimisticUpdatePluginState).toBeCalled();
      expect(mockStore.optimisticUpdateMessageContent).toBeCalled();
    });

    it('should handle error', async () => {
      const mockError = new Error('test error');
      const mockService = vi.fn().mockRejectedValue(mockError);

      await store.internal_triggerLocalFileToolCalling('test-id', mockService);

      expect(mockStore.optimisticUpdateMessagePluginError).toBeCalledWith(
        'test-id',
        {
          body: mockError,
          message: 'test error',
          type: 'PluginServerError',
        },
        { operationId: 'test-op-id' },
      );
    });
  });

  describe('listLocalFiles', () => {
    it('should call listLocalFiles service and update state', async () => {
      const mockResult: LocalFileItem[] = [
        {
          name: 'test.txt',
          path: '/test.txt',
          isDirectory: false,
          createdTime: new Date(),
          lastAccessTime: new Date(),
          modifiedTime: new Date(),
          size: 100,
          type: 'file',
        },
      ];
      vi.mocked(localFileService.listLocalFiles).mockResolvedValue(mockResult);

      await store.listLocalFiles('test-id', { path: '/test' });

      expect(mockStore.internal_triggerLocalFileToolCalling).toBeCalled();
    });
  });

  describe('moveLocalFiles', () => {
    it('should handle successful move', async () => {
      const mockResults = [
        {
          sourcePath: '/test.txt',
          destinationPath: '/target/test.txt',
          success: true,
        },
      ] as unknown as LocalMoveFilesResultItem[];

      vi.mocked(localFileService.moveLocalFiles).mockResolvedValue(mockResults);

      await store.moveLocalFiles('test-id', {
        sourcePaths: ['/test.txt'],
        destinationDir: '/target',
      } as any);

      expect(mockStore.internal_triggerLocalFileToolCalling).toBeCalled();
    });
  });

  describe('writeLocalFile', () => {
    it('should handle successful write', async () => {
      vi.mocked(localFileService.writeFile).mockResolvedValue({
        success: true,
        newPath: '/test.txt',
      });

      await store.writeLocalFile('test-id', { path: '/test.txt', content: 'test' });

      expect(mockStore.internal_triggerLocalFileToolCalling).toBeCalled();
    });

    it('should handle write error', async () => {
      vi.mocked(localFileService.writeFile).mockResolvedValue({
        success: false,
        error: 'Write failed',
        newPath: '/test.txt',
      });

      await store.writeLocalFile('test-id', { path: '/test.txt', content: 'test' });

      expect(mockStore.internal_triggerLocalFileToolCalling).toBeCalled();
    });
  });

  describe('renameLocalFile', () => {
    it('should handle successful rename', async () => {
      vi.mocked(localFileService.renameLocalFile).mockResolvedValue({
        success: true,
        newPath: '/new.txt',
      });

      await store.renameLocalFile('test-id', { path: '/test.txt', newName: 'new.txt' });

      expect(mockStore.internal_triggerLocalFileToolCalling).toBeCalled();
    });

    it('should handle rename error', async () => {
      vi.mocked(localFileService.renameLocalFile).mockResolvedValue({
        success: false,
        error: 'Rename failed',
        newPath: '/test.txt',
      });

      await store.renameLocalFile('test-id', { path: '/test.txt', newName: 'new.txt' });

      expect(mockStore.internal_triggerLocalFileToolCalling).toBeCalled();
    });

    it('should validate new filename', async () => {
      vi.mocked(localFileService.renameLocalFile).mockRejectedValue(
        new Error('Invalid new name provided'),
      );

      await store.renameLocalFile('test-id', {
        path: '/test.txt',
        newName: '../invalid.txt',
      });

      expect(mockStore.internal_triggerLocalFileToolCalling).toBeCalledWith(
        'test-id',
        expect.any(Function),
      );
    });
  });

  // toggleLocalFileLoading is no longer needed as we use operation-based state management
});
