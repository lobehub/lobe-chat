// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChangelogIndexItem } from '@/types/changelog';

import { ChangelogService } from './index';

// Mock external dependencies
vi.mock('dayjs', () => ({
  default: (date: string) => ({
    format: vi.fn().mockReturnValue(date),
  }),
}));

vi.mock('gray-matter', () => ({
  default: vi.fn().mockImplementation((text) => ({
    data: { date: '2023-01-01' },
    content: text,
  })),
}));

vi.mock('markdown-to-txt', () => ({
  markdownToTxt: vi.fn().mockImplementation((text) => text),
}));

vi.mock('semver', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    rcompare: vi.fn().mockImplementation((a, b) => b.localeCompare(a)),
    lt: vi.fn().mockImplementation((a, b) => a < b),
    gt: vi.fn().mockImplementation((a, b) => a > b),
    parse: vi.fn().mockImplementation((v) => ({ toString: () => v })),
  };
});
describe('ChangelogService', () => {
  let service: ChangelogService;

  beforeEach(() => {
    service = new ChangelogService();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('getLatestChangelogId', () => {
    it('should return the id of the first changelog item', async () => {
      const mockIndex = [{ id: 'latest' }, { id: 'older' }];
      vi.spyOn(service, 'getChangelogIndex').mockResolvedValue(mockIndex as ChangelogIndexItem[]);

      const result = await service.getLatestChangelogId();
      expect(result).toBe('latest');
    });

    it('should return undefined if the index is empty', async () => {
      vi.spyOn(service, 'getChangelogIndex').mockResolvedValue([]);

      const result = await service.getLatestChangelogId();
      expect(result).toBeUndefined();
    });
  });

  describe('getChangelogIndex', () => {
    it('should fetch and merge changelog data', async () => {
      const mockResponse = {
        json: vi.fn().mockResolvedValue({
          cloud: [{ id: 'cloud1', date: '2023-01-01', versionRange: ['1.0.0'] }],
          community: [{ id: 'community1', date: '2023-01-02', versionRange: ['1.1.0'] }],
        }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await service.getChangelogIndex();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('community1');
      expect(result[1].id).toBe('cloud1');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Fetch failed'));

      const result = await service.getChangelogIndex();
      expect(result).toBe(false);
    });
  });

  describe('getIndexItemById', () => {
    it('should return the correct item by id', async () => {
      const mockIndex = [
        { id: 'item1', date: '2023-01-01', versionRange: ['1.0.0'] },
        { id: 'item2', date: '2023-01-02', versionRange: ['1.1.0'] },
      ];
      vi.spyOn(service, 'getChangelogIndex').mockResolvedValue(mockIndex as ChangelogIndexItem[]);

      const result = await service.getIndexItemById('item2');
      expect(result).toEqual({ id: 'item2', date: '2023-01-02', versionRange: ['1.1.0'] });
    });

    it('should return undefined for non-existent id', async () => {
      vi.spyOn(service, 'getChangelogIndex').mockResolvedValue([]);

      const result = await service.getIndexItemById('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getPostById', () => {
    it('should fetch and parse post content', async () => {
      vi.spyOn(service, 'getIndexItemById').mockResolvedValue({
        id: 'post1',
        date: '2023-01-01',
        versionRange: ['1.0.0'],
      } as ChangelogIndexItem);

      const mockResponse = {
        text: vi.fn().mockResolvedValue('# Post Title\nPost content'),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await service.getPostById('post1');
      expect(result).toMatchObject({
        content: 'Post content',
        date: '2023-01-01',
        description: 'Post content',
        image: undefined,
        rawTitle: 'Post Title',
        tags: ['changelog'],
        title: 'Post Title',
      });
    });

    it('should handle fetch errors', async () => {
      vi.spyOn(service, 'getIndexItemById').mockResolvedValue({} as ChangelogIndexItem);
      (global.fetch as any).mockRejectedValue(new Error('Fetch failed'));

      const result = await service.getPostById('error');
      expect(result).toBe(false);
    });
  });

  // Additional tests for private methods if they were public
  describe('mergeChangelogs', () => {
    it('should merge and sort changelogs correctly', () => {
      const cloud = [{ id: 'cloud1', date: '2023-01-01', versionRange: ['1.0.0'] }];
      const community = [{ id: 'community1', date: '2023-01-02', versionRange: ['1.1.0'] }];

      // @ts-ignore - accessing private method for testing
      const result = service.mergeChangelogs(cloud, community);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('community1');
      expect(result[1].id).toBe('cloud1');
    });
  });

  describe('formatVersionRange', () => {
    it('should format version range correctly', () => {
      // @ts-ignore - accessing private method for testing
      const result = service.formatVersionRange(['1.0.0', '1.1.0']);
      expect(result).toEqual(['1.1.0', '1.0.0']);
    });

    it('should return single version as is', () => {
      // @ts-ignore - accessing private method for testing
      const result = service.formatVersionRange(['1.0.0']);
      expect(result).toEqual(['1.0.0']);
    });
  });
});
