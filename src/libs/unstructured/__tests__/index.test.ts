// @vitest-environment node
import { UnstructuredClient } from 'unstructured-client';
import { Strategy } from 'unstructured-client/sdk/models/shared';
import { ChunkingStrategy } from 'unstructured-client/sdk/models/shared/partitionparameters';
import { PartitionResponse } from 'unstructured-client/src/sdk/models/operations';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Unstructured } from '../index';
import AutoWithChunkingOutput from './fixtures/table-parse/auto-partition-basic-output.json';
import AutoWithChunkingRaw from './fixtures/table-parse/auto-partition-basic-raw.json';
import AutoWithoutChunking from './fixtures/table-parse/auto-partition-raw.json';
import FastWithoutChunkingRaw from './fixtures/table-parse/fast-partition-raw.json';

// Mock the external dependencies
let UNSTRUCTURED_API_KEY = 'test-api-key';

vi.mock('@/config/knowledge', () => ({
  knowledgeEnv: {
    get UNSTRUCTURED_API_KEY() {
      return UNSTRUCTURED_API_KEY;
    },

    UNSTRUCTURED_SERVER_URL: 'http://test-server.com',
  },
}));

let client: Unstructured;

beforeEach(() => {
  client = new Unstructured();
});

afterEach(() => {
  vi.clearAllMocks();
});

const mockPartitionResponse = (elements: any[]) =>
  ({
    statusCode: 200,
    elements,
    rawResponse: new Response(),
    contentType: 'application/json',
  }) as PartitionResponse;

describe('Unstructured', () => {
  describe('init', () => {
    it('should create an instance with API key from environment', () => {
      expect(client).toBeInstanceOf(Unstructured);
    });

    it('should create an instance with provided API key', () => {
      const customUnstructured = new Unstructured('custom-api-key');
      expect(customUnstructured).toBeInstanceOf(Unstructured);
    });
  });

  describe('basic partition', () => {
    it('should return empty arrays if partition response is not successful', async () => {
      vi.spyOn(UnstructuredClient.prototype.general, 'partition').mockResolvedValue({
        statusCode: 400,
      } as any);

      const result = await client.partition({
        fileContent: new Uint8Array(),
        filename: 'test.txt',
      });

      expect(result.compositeElements).toEqual([]);
      expect(result.originElements).toEqual([]);
    });

    it('should partition content successfully with default strategy', async () => {
      vi.spyOn(UnstructuredClient.prototype.general, 'partition').mockResolvedValue(
        mockPartitionResponse(AutoWithoutChunking),
      );

      const result = await client.partition({
        fileContent: new Uint8Array(),
        filename: 'test.txt',
      });

      expect(result.compositeElements).toHaveLength(0);
      expect(result.originElements).toHaveLength(12);

      expect(result.originElements[0].text).toBe('Multiple Sclerosis Journal 29(6)');
      expect(result.originElements[2].type).toBe('Table');
    });

    it('should partition content successfully with fast strategy', async () => {
      vi.spyOn(UnstructuredClient.prototype.general, 'partition').mockResolvedValue(
        mockPartitionResponse(FastWithoutChunkingRaw),
      );

      const result = await client.partition({
        fileContent: new Uint8Array(),
        filename: 'test.txt',
        strategy: Strategy.Fast,
      });

      expect(result.compositeElements).toHaveLength(0);
      expect(result.originElements).toHaveLength(82);

      expect(result.originElements[0].text).toBe('Multiple Sclerosis Journal 29(6)');
      expect(result.originElements.every((item) => item.text !== 'Table')).toBeTruthy();
    });
  });

  describe('partition with chunk strategy', () => {
    it('should use provided chunking strategy with Table', async () => {
      vi.spyOn(UnstructuredClient.prototype.general, 'partition').mockResolvedValue(
        mockPartitionResponse(AutoWithChunkingRaw),
      );

      const result = await client.partition({
        fileContent: new Uint8Array(),
        filename: 'test.txt',
        chunkingStrategy: ChunkingStrategy.Basic,
      });

      expect(result.compositeElements).toHaveLength(6);
      expect(result.originElements).toHaveLength(12);

      expect(result.originElements).toEqual(AutoWithChunkingOutput.originElements);
      expect(result.originElements).toEqual(AutoWithChunkingOutput.originElements);
    });

    it.skip('should error', async () => {
      vi.spyOn(UnstructuredClient.prototype.general, 'partition').mockResolvedValue(
        mockPartitionResponse([
          {
            type: 'CompositeElement',
            element_id: '32855cf6-5605-4a8e-97a3-3ac0b509b725',
            text: 'abc',
            metadata: {
              filetype: 'application/pdf',
              languages: ['eng'],
              page_number: 1,
              orig_elements: 'e==',
              filename: 'table-parse.pdf',
            },
          },
        ]),
      );
      try {
        await client.partition({
          fileContent: new Uint8Array(),
          filename: 'test.txt',
          chunkingStrategy: ChunkingStrategy.Basic,
        });
      } catch (e) {
        expect(e).toThrowError('unexpected end of file');
      }
    });
  });
});
