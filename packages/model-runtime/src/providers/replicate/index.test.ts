import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeReplicateAI } from './index';

describe('LobeReplicateAI', () => {
  describe('Constructor', () => {
    it('should initialize with API key', () => {
      const provider = new LobeReplicateAI({
        apiKey: 'test-key',
      });

      expect(provider).toBeDefined();
      expect(provider.baseURL).toBe('https://api.replicate.com');
    });

    it('should throw error without API key', () => {
      expect(() => {
        new LobeReplicateAI({});
      }).toThrow();
    });

    it('should accept custom baseURL', () => {
      const customURL = 'https://custom.replicate.com';
      const provider = new LobeReplicateAI({
        apiKey: 'test-key',
        baseURL: customURL,
      });

      expect(provider.baseURL).toBe(customURL);
    });
  });

  describe('chat', () => {
    it('should have chat method defined', async () => {
      const provider = new LobeReplicateAI({
        apiKey: process.env.REPLICATE_API_TOKEN || 'test-key',
      });

      expect(provider.chat).toBeDefined();
    });
  });

  describe('textToImage', () => {
    it('should have textToImage method defined', async () => {
      const provider = new LobeReplicateAI({
        apiKey: process.env.REPLICATE_API_TOKEN || 'test-key',
      });

      expect(provider.textToImage).toBeDefined();
    });
  });

  describe('models', () => {
    it('should return list of models', async () => {
      const provider = new LobeReplicateAI({
        apiKey: 'test-key',
      });

      const models = await provider.models();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('should include Llama 2 model', async () => {
      const provider = new LobeReplicateAI({
        apiKey: 'test-key',
      });

      const models = await provider.models();
      const llamaModel = models.find((m) => m.id === 'meta/llama-2-70b-chat');
      expect(llamaModel).toBeDefined();
      expect(llamaModel?.displayName).toBe('Llama 2 70B Chat');
    });

    it('should include FLUX model', async () => {
      const provider = new LobeReplicateAI({
        apiKey: 'test-key',
      });

      const models = await provider.models();
      const fluxModel = models.find((m) => m.id === 'black-forest-labs/flux-1.1-pro');
      expect(fluxModel).toBeDefined();
      expect(fluxModel?.displayName).toBe('FLUX 1.1 Pro');
    });
  });
});
