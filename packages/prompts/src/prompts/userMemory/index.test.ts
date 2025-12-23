import { describe, expect, it } from 'vitest';

import { promptUserMemory } from './index';

// Fixed timestamp for consistent snapshots: Jan 15, 2024, 10:00 AM UTC
const FIXED_TIMESTAMP = 1705312800000;

describe('promptUserMemory', () => {
  describe('empty cases', () => {
    it('should return empty string when no memories at all', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {},
      });
      expect(result).toBe('');
    });

    it('should return empty string when all memory arrays are empty', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [],
          experiences: [],
          preferences: [],
        },
      });
      expect(result).toBe('');
    });
  });

  describe('contexts only', () => {
    it('should format single context', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: 'User is a software engineer working on web applications',
              id: 'ctx-1',
              title: 'Professional Background',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format multiple contexts', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: 'User prefers TypeScript over JavaScript',
              id: 'ctx-1',
              title: 'Language Preference',
            },
            {
              description: 'User is building a SaaS product',
              id: 'ctx-2',
              title: 'Current Project',
            },
            {
              description: 'User is based in San Francisco timezone',
              id: 'ctx-3',
              title: 'Location',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should handle context with null/undefined values', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: null,
              id: 'ctx-1',
              title: null,
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should handle context without id', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: 'Some context description',
              title: 'Some Title',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });
  });

  describe('experiences only', () => {
    it('should format single experience', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          experiences: [
            {
              id: 'exp-1',
              keyLearning: 'User prefers concise explanations with code examples',
              situation: 'User asked about React hooks implementation',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format multiple experiences', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          experiences: [
            {
              id: 'exp-1',
              keyLearning: 'User likes step-by-step debugging guidance',
              situation: 'Debugging a memory leak in Node.js',
            },
            {
              id: 'exp-2',
              keyLearning: 'User appreciates alternative approaches being mentioned',
              situation: 'Discussing database schema design',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should handle experience with null/undefined values', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          experiences: [
            {
              id: 'exp-1',
              keyLearning: null,
              situation: null,
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });
  });

  describe('preferences only', () => {
    it('should format single preference', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          preferences: [
            {
              conclusionDirectives: 'Always use TypeScript strict mode',
              id: 'pref-1',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format multiple preferences', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          preferences: [
            {
              conclusionDirectives: 'Prefer functional programming patterns',
              id: 'pref-1',
            },
            {
              conclusionDirectives: 'Use ESLint with Prettier for formatting',
              id: 'pref-2',
            },
            {
              conclusionDirectives: 'Write unit tests for all new features',
              id: 'pref-3',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should skip preference with null conclusionDirectives', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          preferences: [
            {
              conclusionDirectives: null,
              id: 'pref-1',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should skip preference with empty conclusionDirectives', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          preferences: [
            {
              conclusionDirectives: '',
              id: 'pref-1',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should filter out empty preferences and keep valid ones', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          preferences: [
            {
              conclusionDirectives: null,
              id: 'pref-1',
            },
            {
              conclusionDirectives: 'Valid preference',
              id: 'pref-2',
            },
            {
              conclusionDirectives: '',
              id: 'pref-3',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });
  });

  describe('mixed memory types', () => {
    it('should format all memory types together', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: 'Senior developer with 10 years experience',
              id: 'ctx-1',
              title: 'Experience Level',
            },
          ],
          experiences: [
            {
              id: 'exp-1',
              keyLearning: 'Prefers detailed architectural discussions',
              situation: 'System design conversation',
            },
          ],
          preferences: [
            {
              conclusionDirectives: 'Use design patterns when appropriate',
              id: 'pref-1',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format contexts and experiences without preferences', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: 'Working on mobile app development',
              id: 'ctx-1',
              title: 'Current Focus',
            },
          ],
          experiences: [
            {
              id: 'exp-1',
              keyLearning: 'Likes React Native examples',
              situation: 'Mobile development discussion',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format contexts and preferences without experiences', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: 'Backend developer specializing in APIs',
              id: 'ctx-1',
              title: 'Specialization',
            },
          ],
          preferences: [
            {
              conclusionDirectives: 'Always include error handling in examples',
              id: 'pref-1',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format experiences and preferences without contexts', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          experiences: [
            {
              id: 'exp-1',
              keyLearning: 'Appreciates performance optimization tips',
              situation: 'Database query optimization',
            },
          ],
          preferences: [
            {
              conclusionDirectives: 'Mention time complexity for algorithms',
              id: 'pref-1',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });
  });

  describe('timestamp formatting', () => {
    it('should format timestamp for morning hours (AM)', () => {
      // Jan 15, 2024, 3:00 AM UTC
      const morningTimestamp = 1705287600000;
      const result = promptUserMemory({
        fetchedAt: morningTimestamp,
        memories: {
          contexts: [{ description: 'Test', id: 'ctx-1', title: 'Test' }],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format timestamp for afternoon hours (PM)', () => {
      // Jan 15, 2024, 3:00 PM UTC
      const afternoonTimestamp = 1705330800000;
      const result = promptUserMemory({
        fetchedAt: afternoonTimestamp,
        memories: {
          contexts: [{ description: 'Test', id: 'ctx-1', title: 'Test' }],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format timestamp for noon (12:00 PM)', () => {
      // Jan 15, 2024, 12:00 PM UTC
      const noonTimestamp = 1705320000000;
      const result = promptUserMemory({
        fetchedAt: noonTimestamp,
        memories: {
          contexts: [{ description: 'Test', id: 'ctx-1', title: 'Test' }],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should format timestamp for midnight (12:00 AM)', () => {
      // Jan 15, 2024, 12:00 AM UTC
      const midnightTimestamp = 1705276800000;
      const result = promptUserMemory({
        fetchedAt: midnightTimestamp,
        memories: {
          contexts: [{ description: 'Test', id: 'ctx-1', title: 'Test' }],
        },
      });
      expect(result).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in content', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: 'Uses <React/> & Vue.js frameworks with "strict" mode',
              id: 'ctx-1',
              title: 'Tech Stack & Tools',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should handle multiline content', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: `Line 1: First point
Line 2: Second point
Line 3: Third point`,
              id: 'ctx-1',
              title: 'Multi-line Context',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should handle very long content', () => {
      const longDescription = 'A'.repeat(500);
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: longDescription,
              id: 'ctx-1',
              title: 'Long Content Test',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('should handle unicode characters', () => {
      const result = promptUserMemory({
        fetchedAt: FIXED_TIMESTAMP,
        memories: {
          contexts: [
            {
              description: '用户偏好中文回复 🚀 with émojis and spëcial chàracters',
              id: 'ctx-1',
              title: '语言偏好 🌍',
            },
          ],
        },
      });
      expect(result).toMatchSnapshot();
    });
  });
});
