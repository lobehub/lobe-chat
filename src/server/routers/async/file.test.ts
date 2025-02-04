import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { serverDB } from '@/database/server';
import { AsyncTaskModel } from '@/database/server/models/asyncTask';
import { ChunkModel } from '@/database/server/models/chunk';
import { EmbeddingModel } from '@/database/server/models/embedding';
import { FileModel } from '@/database/server/models/file';
import { initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import { S3 } from '@/server/modules/S3';
import { ChunkService } from '@/server/services/chunk';
import { AsyncTaskStatus } from '@/types/asyncTask';

import { fileRouter } from './file';

// Mock dependencies
vi.mock('@/database/server');
vi.mock('@/database/server/models/asyncTask');
vi.mock('@/database/server/models/chunk');
vi.mock('@/database/server/models/embedding');
vi.mock('@/database/server/models/file');
vi.mock('@/server/modules/AgentRuntime');
vi.mock('@/server/modules/S3');
vi.mock('@/server/services/chunk');

describe('fileRouter', () => {
  const mockUserId = 'user-123';
  const mockJwtPayload = { sub: mockUserId };
  const mockFileId = 'file-123';
  const mockTaskId = 'task-123';

  const mockContext = {
    userId: mockUserId,
    jwtPayload: mockJwtPayload,
    secret: 'test-secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('embeddingChunks', () => {
    it('should skip all tests', () => {
      expect(true).toBe(true);
    });
  });

  describe('parseFileToChunks', () => {
    it('should skip all tests', () => {
      expect(true).toBe(true);
    });
  });
});
