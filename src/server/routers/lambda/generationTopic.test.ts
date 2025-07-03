import { describe, expect, it, vi } from 'vitest';

import { GenerationTopicModel } from '@/database/models/generationTopic';
import { GenerationTopicItem } from '@/database/schemas/generation';
import { FileService } from '@/server/services/file';
import { GenerationService } from '@/server/services/generation';

import { generationTopicRouter } from './generationTopic';

vi.mock('@/database/models/generationTopic');
vi.mock('@/server/services/file');
vi.mock('@/server/services/generation');

describe('generationTopicRouter', () => {
  const mockCtx = {
    userId: 'test-user',
    serverDB: {} as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new topic', async () => {
    const mockTopicId = 'topic-123';
    const mockCreatedTopic = {
      id: mockTopicId,
      title: '',
      userId: 'test-user',
      coverUrl: null,
      accessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCreate = vi.fn().mockResolvedValue(mockCreatedTopic);
    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          create: mockCreate,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.createTopic();

    expect(result).toBe(mockTopicId);
    expect(mockCreate).toHaveBeenCalledWith('');
  });

  it('should get all generation topics', async () => {
    const mockTopics: GenerationTopicItem[] = [
      {
        id: 'topic-1',
        title: 'Test Topic 1',
        userId: 'test-user',
        coverUrl: 'cover-url-1',
        accessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'topic-2',
        title: 'Test Topic 2',
        userId: 'test-user',
        coverUrl: null,
        accessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockQueryAll = vi.fn().mockResolvedValue(mockTopics);
    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          queryAll: mockQueryAll,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.getAllGenerationTopics();

    expect(result).toEqual(mockTopics);
    expect(mockQueryAll).toHaveBeenCalled();
  });

  it('should update a topic', async () => {
    const mockTopicId = 'topic-123';
    const mockUpdateValue = {
      title: 'Updated Title',
      coverUrl: 'updated-cover-url',
    };
    const mockUpdatedTopic = {
      id: mockTopicId,
      ...mockUpdateValue,
      userId: 'test-user',
      accessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUpdate = vi.fn().mockResolvedValue(mockUpdatedTopic);
    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          update: mockUpdate,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.updateTopic({
      id: mockTopicId,
      value: mockUpdateValue,
    });

    expect(result).toEqual(mockUpdatedTopic);
    expect(mockUpdate).toHaveBeenCalledWith(mockTopicId, mockUpdateValue);
  });

  it('should update topic cover', async () => {
    const mockTopicId = 'topic-123';
    const mockCoverUrl = 'https://example.com/cover.jpg';
    const mockNewCoverKey = 'generations/covers/new-cover-key.webp';
    const mockUpdatedTopic = {
      id: mockTopicId,
      title: 'Test Topic',
      userId: 'test-user',
      coverUrl: mockNewCoverKey,
      accessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCreateCoverFromUrl = vi.fn().mockResolvedValue(mockNewCoverKey);
    const mockUpdate = vi.fn().mockResolvedValue(mockUpdatedTopic);

    vi.mocked(GenerationService).mockImplementation(
      () =>
        ({
          createCoverFromUrl: mockCreateCoverFromUrl,
        }) as any,
    );

    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          update: mockUpdate,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.updateTopicCover({
      id: mockTopicId,
      coverUrl: mockCoverUrl,
    });

    expect(result).toEqual(mockUpdatedTopic);
    expect(mockCreateCoverFromUrl).toHaveBeenCalledWith(mockCoverUrl);
    expect(mockUpdate).toHaveBeenCalledWith(mockTopicId, { coverUrl: mockNewCoverKey });
  });

  it('should delete a topic without cover', async () => {
    const mockTopicId = 'topic-123';
    const mockDeletedTopic = {
      id: mockTopicId,
      title: 'Deleted Topic',
      userId: 'test-user',
      coverUrl: null,
      accessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDelete = vi.fn().mockResolvedValue(mockDeletedTopic);
    const mockDeleteFile = vi.fn();

    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          delete: mockDelete,
        }) as any,
    );

    vi.mocked(FileService).mockImplementation(
      () =>
        ({
          deleteFile: mockDeleteFile,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.deleteTopic({ id: mockTopicId });

    expect(result).toEqual(mockDeletedTopic);
    expect(mockDelete).toHaveBeenCalledWith(mockTopicId);
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });

  it('should delete a topic with cover and remove the cover file', async () => {
    const mockTopicId = 'topic-123';
    const mockCoverUrl = 'generations/covers/cover-key.webp';
    const mockDeletedTopic = {
      id: mockTopicId,
      title: 'Deleted Topic',
      userId: 'test-user',
      coverUrl: mockCoverUrl,
      accessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDelete = vi.fn().mockResolvedValue(mockDeletedTopic);
    const mockDeleteFile = vi.fn().mockResolvedValue(true);

    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          delete: mockDelete,
        }) as any,
    );

    vi.mocked(FileService).mockImplementation(
      () =>
        ({
          deleteFile: mockDeleteFile,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.deleteTopic({ id: mockTopicId });

    expect(result).toEqual(mockDeletedTopic);
    expect(mockDelete).toHaveBeenCalledWith(mockTopicId);
    expect(mockDeleteFile).toHaveBeenCalledWith(mockCoverUrl);
  });

  it('should handle edge cases for update with partial data', async () => {
    const mockTopicId = 'topic-123';
    const mockUpdateValue = {
      title: 'Only Title Updated',
    };
    const mockUpdatedTopic = {
      id: mockTopicId,
      title: 'Only Title Updated',
      userId: 'test-user',
      coverUrl: null,
      accessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUpdate = vi.fn().mockResolvedValue(mockUpdatedTopic);
    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          update: mockUpdate,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.updateTopic({
      id: mockTopicId,
      value: mockUpdateValue,
    });

    expect(result).toEqual(mockUpdatedTopic);
    expect(mockUpdate).toHaveBeenCalledWith(mockTopicId, mockUpdateValue);
  });

  it('should handle null values in update', async () => {
    const mockTopicId = 'topic-123';
    const mockUpdateValue = {
      title: null,
      coverUrl: null,
    };
    const mockUpdatedTopic = {
      id: mockTopicId,
      title: null,
      userId: 'test-user',
      coverUrl: null,
      accessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUpdate = vi.fn().mockResolvedValue(mockUpdatedTopic);
    vi.mocked(GenerationTopicModel).mockImplementation(
      () =>
        ({
          update: mockUpdate,
        }) as any,
    );

    const caller = generationTopicRouter.createCaller(mockCtx);
    const result = await caller.updateTopic({
      id: mockTopicId,
      value: mockUpdateValue,
    });

    expect(result).toEqual(mockUpdatedTopic);
    expect(mockUpdate).toHaveBeenCalledWith(mockTopicId, mockUpdateValue);
  });
});
