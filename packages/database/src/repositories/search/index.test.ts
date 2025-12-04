// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../models/__tests__/_util';
import { NewAgent, agents } from '../../schemas/agent';
import { NewFile, files } from '../../schemas/file';
import { NewTopic, topics } from '../../schemas/topic';
import { users } from '../../schemas/user';
import { LobeChatDatabase } from '../../type';
import { SearchRepo } from './index';

const userId = 'search-test-user';
const otherUserId = 'other-search-user';

let searchRepo: SearchRepo;

const serverDB: LobeChatDatabase = await getTestDB();

beforeEach(async () => {
  // Clean up
  await serverDB.delete(users);

  // Create test users
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);

  // Initialize repo
  searchRepo = new SearchRepo(serverDB, userId);
});

describe('SearchRepo', () => {
  describe('search - empty query', () => {
    it('should return empty array for empty query', async () => {
      const results = await searchRepo.search({ query: '' });
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace query', async () => {
      const results = await searchRepo.search({ query: '   ' });
      expect(results).toEqual([]);
    });
  });

  describe('search - basic search', () => {
    beforeEach(async () => {
      // Create test agents
      const testAgents: NewAgent[] = [
        {
          description: 'A helpful React coding assistant',
          slug: 'react-helper',
          tags: ['react', 'frontend', 'coding'],
          title: 'React Helper',
          userId,
        },
        {
          description: 'Python development assistant',
          slug: 'python-dev',
          tags: ['python', 'backend'],
          title: 'Python Developer',
          userId,
        },
      ];
      await serverDB.insert(agents).values(testAgents);

      // Create test topics
      const testTopics: NewTopic[] = [
        {
          content: 'Discussion about React hooks and best practices',
          title: 'React Hooks Guide',
          userId,
        },
        {
          content: 'Notes on Python async programming',
          title: 'Python Async Notes',
          userId,
        },
      ];
      await serverDB.insert(topics).values(testTopics);

      // Create test files
      const testFiles: NewFile[] = [
        {
          fileType: 'application/javascript',
          name: 'react-component.jsx',
          size: 1024,
          url: 'file://react-component.jsx',
          userId,
        },
        {
          fileType: 'text/python',
          name: 'python-script.py',
          size: 2048,
          url: 'file://python-script.py',
          userId,
        },
      ];
      await serverDB.insert(files).values(testFiles);
    });

    it('should find agents by title', async () => {
      const results = await searchRepo.search({ query: 'React Helper' });

      const agentResults = results.filter((r) => r.type === 'agent');
      expect(agentResults).toHaveLength(1);
      expect(agentResults[0].title).toBe('React Helper');
    });

    it('should find topics by title', async () => {
      const results = await searchRepo.search({ query: 'React Hooks' });

      const topicResults = results.filter((r) => r.type === 'topic');
      expect(topicResults).toHaveLength(1);
      expect(topicResults[0].title).toBe('React Hooks Guide');
    });

    it('should find files by name', async () => {
      const results = await searchRepo.search({ query: 'react-component' });

      const fileResults = results.filter((r) => r.type === 'file');
      expect(fileResults).toHaveLength(1);
      expect(fileResults[0].title).toBe('react-component.jsx');
    });

    it('should find results across all types', async () => {
      const results = await searchRepo.search({ query: 'react' });

      // Should find: 1 agent, 1 topic, 1 file
      expect(results.length).toBeGreaterThanOrEqual(3);

      const types = new Set(results.map((r) => r.type));
      expect(types.has('agent')).toBe(true);
      expect(types.has('topic')).toBe(true);
      expect(types.has('file')).toBe(true);
    });

    it('should search in agent description', async () => {
      const results = await searchRepo.search({ query: 'coding assistant' });

      const agentResults = results.filter((r) => r.type === 'agent');
      expect(agentResults.length).toBeGreaterThanOrEqual(1);
      expect(agentResults[0].description).toContain('coding');
    });

    it('should search in topic content', async () => {
      const results = await searchRepo.search({ query: 'async programming' });

      const topicResults = results.filter((r) => r.type === 'topic');
      expect(topicResults.length).toBeGreaterThanOrEqual(1);
      expect(topicResults[0].description).toContain('async');
    });

    it('should search in agent tags', async () => {
      const results = await searchRepo.search({ query: 'frontend' });

      const agentResults = results.filter((r) => r.type === 'agent');
      expect(agentResults.length).toBeGreaterThanOrEqual(1);
      expect(agentResults[0].tags).toContain('frontend');
    });
  });

  describe('search - relevance ranking', () => {
    beforeEach(async () => {
      const testAgents: NewAgent[] = [
        {
          slug: 'exact',
          title: 'test',
          userId,
        },
        {
          slug: 'prefix',
          title: 'testing',
          userId,
        },
        {
          slug: 'contains',
          title: 'my test agent',
          userId,
        },
      ];
      await serverDB.insert(agents).values(testAgents);
    });

    it('should prioritize exact match (relevance=1)', async () => {
      const results = await searchRepo.search({ query: 'test' });

      const exactMatch = results.find((r) => r.type === 'agent' && r.slug === 'exact');
      expect(exactMatch).toBeDefined();
      expect(exactMatch?.relevance).toBe(1);
    });

    it('should rank prefix match second (relevance=2)', async () => {
      const results = await searchRepo.search({ query: 'test' });

      const prefixMatch = results.find((r) => r.type === 'agent' && r.slug === 'prefix');
      expect(prefixMatch).toBeDefined();
      expect(prefixMatch?.relevance).toBe(2);
    });

    it('should rank contains match third (relevance=3)', async () => {
      const results = await searchRepo.search({ query: 'test' });

      const containsMatch = results.find((r) => r.type === 'agent' && r.slug === 'contains');
      expect(containsMatch).toBeDefined();
      expect(containsMatch?.relevance).toBe(3);
    });

    it('should order results by relevance', async () => {
      const results = await searchRepo.search({ query: 'test' });

      const agentResults = results.filter((r) => r.type === 'agent');

      // Exact match should come first
      expect(agentResults[0].slug).toBe('exact');
      expect(agentResults[0].relevance).toBe(1);

      // Prefix match should come second
      expect(agentResults[1].slug).toBe('prefix');
      expect(agentResults[1].relevance).toBe(2);

      // Contains match should come third
      expect(agentResults[2].slug).toBe('contains');
      expect(agentResults[2].relevance).toBe(3);
    });
  });

  describe('search - user isolation', () => {
    beforeEach(async () => {
      // Create agent for current user
      await serverDB.insert(agents).values({
        slug: 'user-agent',
        title: 'User Agent',
        userId,
      });

      // Create agent for other user
      await serverDB.insert(agents).values({
        slug: 'other-agent',
        title: 'Other Agent',
        userId: otherUserId,
      });

      // Create topic for current user
      await serverDB.insert(topics).values({
        title: 'User Topic',
        userId,
      });

      // Create topic for other user
      await serverDB.insert(topics).values({
        title: 'Other Topic',
        userId: otherUserId,
      });

      // Create file for current user
      await serverDB.insert(files).values({
        fileType: 'text/plain',
        name: 'user-file.txt',
        size: 100,
        url: 'file://user-file.txt',
        userId,
      });

      // Create file for other user
      await serverDB.insert(files).values({
        fileType: 'text/plain',
        name: 'other-file.txt',
        size: 100,
        url: 'file://other-file.txt',
        userId: otherUserId,
      });
    });

    it('should only return current user results', async () => {
      const results = await searchRepo.search({ query: 'agent' });

      expect(results.length).toBeGreaterThan(0);

      // All results should be from current user
      results.forEach((result) => {
        expect(result.title).not.toContain('Other');
      });
    });

    it('should not return other user agents', async () => {
      const results = await searchRepo.search({ query: 'agent' });

      const otherAgent = results.find((r) => r.title === 'Other Agent');
      expect(otherAgent).toBeUndefined();
    });

    it('should not return other user topics', async () => {
      const results = await searchRepo.search({ query: 'topic' });

      const otherTopic = results.find((r) => r.title === 'Other Topic');
      expect(otherTopic).toBeUndefined();
    });

    it('should not return other user files', async () => {
      const results = await searchRepo.search({ query: 'file' });

      const otherFile = results.find((r) => r.title === 'other-file.txt');
      expect(otherFile).toBeUndefined();
    });
  });

  describe('search - type filtering', () => {
    beforeEach(async () => {
      await serverDB.insert(agents).values({
        slug: 'test-agent',
        title: 'Test Agent',
        userId,
      });

      await serverDB.insert(topics).values({
        title: 'Test Topic',
        userId,
      });

      await serverDB.insert(files).values({
        fileType: 'text/plain',
        name: 'test-file.txt',
        size: 100,
        url: 'file://test-file.txt',
        userId,
      });
    });

    it('should filter by agent type', async () => {
      const results = await searchRepo.search({ query: 'test', type: 'agent' });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result.type).toBe('agent');
      });
    });

    it('should filter by topic type', async () => {
      const results = await searchRepo.search({ query: 'test', type: 'topic' });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result.type).toBe('topic');
      });
    });

    it('should filter by file type', async () => {
      const results = await searchRepo.search({ query: 'test', type: 'file' });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result.type).toBe('file');
      });
    });
  });

  describe('search - limit per type', () => {
    beforeEach(async () => {
      // Create 10 agents
      const testAgents: NewAgent[] = Array.from({ length: 10 }, (_, i) => ({
        slug: `agent-${i}`,
        title: `Test Agent ${i}`,
        userId,
      }));
      await serverDB.insert(agents).values(testAgents);
    });

    it('should respect default limit of 5 per type', async () => {
      const results = await searchRepo.search({ query: 'test' });

      const agentResults = results.filter((r) => r.type === 'agent');
      expect(agentResults.length).toBeLessThanOrEqual(5);
    });

    it('should respect custom limit per type', async () => {
      const results = await searchRepo.search({ limitPerType: 3, query: 'test' });

      const agentResults = results.filter((r) => r.type === 'agent');
      expect(agentResults.length).toBeLessThanOrEqual(3);
    });
  });

  describe('search - case insensitivity', () => {
    beforeEach(async () => {
      await serverDB.insert(agents).values({
        description: 'React Development Assistant',
        slug: 'react-agent',
        title: 'React Agent',
        userId,
      });
    });

    it('should search case-insensitively', async () => {
      const upperResults = await searchRepo.search({ query: 'REACT' });
      const lowerResults = await searchRepo.search({ query: 'react' });
      const mixedResults = await searchRepo.search({ query: 'ReAcT' });

      expect(upperResults.length).toBeGreaterThan(0);
      expect(lowerResults.length).toBeGreaterThan(0);
      expect(mixedResults.length).toBeGreaterThan(0);

      // All should return the same agent
      expect(upperResults[0].id).toBe(lowerResults[0].id);
      expect(lowerResults[0].id).toBe(mixedResults[0].id);
    });
  });

  describe('search - result structure', () => {
    beforeEach(async () => {
      await serverDB.insert(agents).values({
        avatar: 'avatar-url',
        backgroundColor: '#ff0000',
        description: 'Test description',
        slug: 'test-agent',
        tags: ['tag1', 'tag2'],
        title: 'Test Agent',
        userId,
      });

      await serverDB.insert(topics).values({
        content: 'Test content',
        favorite: true,
        title: 'Test Topic',
        userId,
      });

      await serverDB.insert(files).values({
        fileType: 'text/plain',
        name: 'test.txt',
        size: 100,
        url: 'file://test.txt',
        userId,
      });
    });

    it('should return correct agent result structure', async () => {
      const results = await searchRepo.search({ query: 'test', type: 'agent' });

      expect(results.length).toBeGreaterThan(0);
      const agent = results[0];

      expect(agent.type).toBe('agent');
      expect(agent.id).toBeDefined();
      expect(agent.title).toBeDefined();
      expect(agent.relevance).toBeGreaterThan(0);
      expect(agent.createdAt).toBeInstanceOf(Date);
      expect(agent.updatedAt).toBeInstanceOf(Date);

      if (agent.type === 'agent') {
        expect(agent.slug).toBeDefined();
        expect(agent.tags).toBeInstanceOf(Array);
      }
    });

    it('should return correct topic result structure', async () => {
      const results = await searchRepo.search({ query: 'test', type: 'topic' });

      expect(results.length).toBeGreaterThan(0);
      const topic = results[0];

      expect(topic.type).toBe('topic');
      expect(topic.id).toBeDefined();
      expect(topic.title).toBeDefined();
      expect(topic.relevance).toBeGreaterThan(0);
      expect(topic.createdAt).toBeInstanceOf(Date);
      expect(topic.updatedAt).toBeInstanceOf(Date);

      if (topic.type === 'topic') {
        expect(topic.favorite).toBeDefined();
      }
    });

    it('should return correct file result structure', async () => {
      const results = await searchRepo.search({ query: 'test', type: 'file' });

      expect(results.length).toBeGreaterThan(0);
      const file = results[0];

      expect(file.type).toBe('file');
      expect(file.id).toBeDefined();
      expect(file.title).toBeDefined();
      expect(file.relevance).toBeGreaterThan(0);
      expect(file.createdAt).toBeInstanceOf(Date);
      expect(file.updatedAt).toBeInstanceOf(Date);

      if (file.type === 'file') {
        expect(file.name).toBeDefined();
        expect(file.fileType).toBeDefined();
        expect(file.size).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
