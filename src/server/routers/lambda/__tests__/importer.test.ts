import { TRPCError } from '@trpc/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataImporterRepos } from '@/database/repositories/dataImporter';
import { FileService } from '@/server/services/file';
import { ImportResultData } from '@/types/importer';

import { importerRouter } from '../importer';

// Mock implementations
const mockImportData = vi.fn();
const mockImportPgData = vi.fn();
const mockGetFileContent = vi.fn();

vi.mock('@/database/repositories/dataImporter', () => ({
  DataImporterRepos: vi.fn().mockImplementation(() => ({
    importData: mockImportData,
    importPgData: mockImportPgData,
  })),
}));

vi.mock('@/server/services/file', () => ({
  FileService: vi.fn().mockImplementation(() => ({
    getFileContent: mockGetFileContent,
  })),
}));

describe('importerRouter', () => {
  const mockFileContent = '{"version": 1}';
  const mockImportResult: ImportResultData = { success: true, results: {} };
  const mockImportPgResult: ImportResultData = { success: true, results: {} };

  const mockContext = {
    userId: 'test-user',
    serverDB: {},
  };

  beforeEach(() => {
    mockImportData.mockResolvedValue(mockImportResult);
    mockImportPgData.mockResolvedValue(mockImportPgResult);
    mockGetFileContent.mockResolvedValue(mockFileContent);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('importByFile', () => {
    it('should handle valid JSON file import', async () => {
      const caller = importerRouter.createCaller(mockContext);
      const result = await caller.importByFile({ pathname: 'test.json' });

      expect(result).toEqual(mockImportResult);
      expect(mockGetFileContent).toHaveBeenCalledWith('test.json');
      expect(mockImportData).toHaveBeenCalledWith(JSON.parse(mockFileContent));
    });

    it('should handle PG data import', async () => {
      const pgData = { schemaHash: 'hash', data: {} };
      mockGetFileContent.mockResolvedValueOnce(JSON.stringify(pgData));

      const caller = importerRouter.createCaller(mockContext);
      const result = await caller.importByFile({ pathname: 'test.json' });

      expect(result).toEqual(mockImportPgResult);
      expect(mockImportPgData).toHaveBeenCalledWith(pgData);
    });

    it('should throw error for invalid file content', async () => {
      mockGetFileContent.mockRejectedValueOnce(new Error());

      const caller = importerRouter.createCaller(mockContext);
      await expect(caller.importByFile({ pathname: 'invalid.json' })).rejects.toThrow(TRPCError);
    });
  });

  describe('importByPost', () => {
    it('should import data from post request', async () => {
      const postData = {
        data: {
          version: 1,
          messages: [],
          sessions: [],
        },
      };

      const caller = importerRouter.createCaller(mockContext);
      const result = await caller.importByPost(postData);

      expect(result).toEqual(mockImportResult);
      expect(mockImportData).toHaveBeenCalledWith(postData.data);
    });
  });

  describe('importPgByPost', () => {
    it('should import PG data from post request', async () => {
      const pgPostData = {
        data: { table1: [] },
        mode: 'pglite' as const,
        schemaHash: 'hash123',
      };

      const caller = importerRouter.createCaller(mockContext);
      const result = await caller.importPgByPost(pgPostData);

      expect(result).toEqual(mockImportPgResult);
      expect(mockImportPgData).toHaveBeenCalledWith(pgPostData);
    });
  });
});
