// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as desensitizeTool from '../utils/desensitizeUrl';
import {
  CloudflareStreamTransformer,
  desensitizeCloudflareUrl,
  fillUrl,
  getModelBeta,
  getModelDisplayName,
  getModelFunctionCalling,
  getModelTokens,
} from './cloudflareHelpers';

//const {
//  getModelBeta,
//  getModelDisplayName,
//  getModelFunctionCalling,
//  getModelTokens,
//} = require('./cloudflareHelpers');

//const cloudflareHelpers = require('./cloudflareHelpers');
//const getModelBeta = cloudflareHelpers.__get__('getModelBeta');
//const getModelDisplayName = cloudflareHelpers.__get__('getModelDisplayName');
//const getModelFunctionCalling = cloudflareHelpers.__get__('getModelFunctionCalling');
//const getModelTokens = cloudflareHelpers.__get__('getModelTokens');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('cloudflareHelpers', () => {
  describe('CloudflareStreamTransformer', () => {
    let transformer: CloudflareStreamTransformer;
    beforeEach(() => {
      transformer = new CloudflareStreamTransformer();
    });

    describe('parseChunk', () => {
      let chunks: string[];
      let controller: TransformStreamDefaultController;

      beforeEach(() => {
        chunks = [];
        controller = Object.create(TransformStreamDefaultController.prototype);
        vi.spyOn(controller, 'enqueue').mockImplementation((chunk) => {
          chunks.push(chunk);
        });
      });

      it('should parse chunk', () => {
        // Arrange
        const chunk = 'data: {"key": "value", "response": "response1"}';
        const textDecoder = new TextDecoder();

        // Act
        transformer['parseChunk'](chunk, controller);

        // Assert
        expect(chunks.length).toBe(2);
        expect(chunks[0]).toBe('event: text\n');
        expect(chunks[1]).toBe('data: "response1"\n\n');
      });

      it('should not replace `data` in text', () => {
        // Arrange
        const chunk = 'data: {"key": "value", "response": "data: a"}';
        const textDecoder = new TextDecoder();

        // Act
        transformer['parseChunk'](chunk, controller);

        // Assert
        expect(chunks.length).toBe(2);
        expect(chunks[0]).toBe('event: text\n');
        expect(chunks[1]).toBe('data: "data: a"\n\n');
      });
    });

    describe('transform', () => {
      const textDecoder = new TextDecoder();
      const textEncoder = new TextEncoder();
      let chunks: string[];

      beforeEach(() => {
        chunks = [];
        vi.spyOn(
          transformer as any as {
            parseChunk: (chunk: string, controller: TransformStreamDefaultController) => void;
          },
          'parseChunk',
        ).mockImplementation((chunk: string, _) => {
          chunks.push(chunk);
        });
      });

      it('should split single chunk', async () => {
        // Arrange
        const chunk = textEncoder.encode('data: {"key": "value", "response": "response1"}\n\n');

        // Act
        await transformer.transform(chunk, undefined!);

        // Assert
        expect(chunks.length).toBe(1);
        expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
      });

      it('should split multiple chunks', async () => {
        // Arrange
        const chunk = textEncoder.encode(
          'data: {"key": "value", "response": "response1"}\n\n' +
            'data: {"key": "value", "response": "response2"}\n\n',
        );

        // Act
        await transformer.transform(chunk, undefined!);

        // Assert
        expect(chunks.length).toBe(2);
        expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
        expect(chunks[1]).toBe('data: {"key": "value", "response": "response2"}');
      });

      it('should ignore empty chunk', async () => {
        // Arrange
        const chunk = textEncoder.encode('\n\n');

        // Act
        await transformer.transform(chunk, undefined!);

        // Assert
        expect(chunks.join()).toBe('');
      });

      it('should split and concat delayed chunks', async () => {
        // Arrange
        const chunk1 = textEncoder.encode('data: {"key": "value", "respo');
        const chunk2 = textEncoder.encode('nse": "response1"}\n\ndata: {"key": "val');
        const chunk3 = textEncoder.encode('ue", "response": "response2"}\n\n');

        // Act & Assert
        await transformer.transform(chunk1, undefined!);
        expect(transformer['parseChunk']).not.toHaveBeenCalled();
        expect(chunks.length).toBe(0);
        expect(transformer['buffer']).toBe('data: {"key": "value", "respo');

        await transformer.transform(chunk2, undefined!);
        expect(chunks.length).toBe(1);
        expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
        expect(transformer['buffer']).toBe('data: {"key": "val');

        await transformer.transform(chunk3, undefined!);
        expect(chunks.length).toBe(2);
        expect(chunks[1]).toBe('data: {"key": "value", "response": "response2"}');
        expect(transformer['buffer']).toBe('');
      });

      it('should ignore standalone [DONE]', async () => {
        // Arrange
        const chunk = textEncoder.encode('data: [DONE]\n\n');

        // Act
        await transformer.transform(chunk, undefined!);

        // Assert
        expect(transformer['parseChunk']).not.toHaveBeenCalled();
        expect(chunks.length).toBe(0);
        expect(transformer['buffer']).toBe('');
      });

      it('should ignore [DONE] in chunk', async () => {
        // Arrange
        const chunk = textEncoder.encode(
          'data: {"key": "value", "response": "response1"}\n\ndata: [DONE]\n\n',
        );

        // Act
        await transformer.transform(chunk, undefined!);

        // Assert
        expect(chunks.length).toBe(1);
        expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
        expect(transformer['buffer']).toBe('');
      });
    });
  });

  describe('fillUrl', () => {
    it('should return URL with account id', () => {
      const url = fillUrl('80009000a000b000c000d000e000f000');
      expect(url).toBe(
        'https://api.cloudflare.com/client/v4/accounts/80009000a000b000c000d000e000f000/ai/run/',
      );
    });
  });

  describe('maskAccountId', () => {
    describe('desensitizeAccountId', () => {
      it('should replace account id with **** in official API endpoint', () => {
        const url =
          'https://api.cloudflare.com/client/v4/accounts/80009000a000b000c000d000e000f000/ai/run/';
        const maskedUrl = desensitizeCloudflareUrl(url);
        expect(maskedUrl).toBe('https://api.cloudflare.com/client/v4/accounts/****/ai/run/');
      });

      it('should replace account id with **** in custom API endpoint', () => {
        const url =
          'https://api.cloudflare.com/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/';
        const maskedUrl = desensitizeCloudflareUrl(url);
        expect(maskedUrl).toBe('https://api.cloudflare.com/custom/prefix/****/custom/suffix/');
      });
    });

    describe('desensitizeCloudflareUrl', () => {
      it('should mask account id in official API endpoint', () => {
        const url =
          'https://api.cloudflare.com/client/v4/accounts/80009000a000b000c000d000e000f000/ai/run/';
        const maskedUrl = desensitizeCloudflareUrl(url);
        expect(maskedUrl).toBe('https://api.cloudflare.com/client/v4/accounts/****/ai/run/');
      });

      it('should call desensitizeUrl for custom API endpoint', () => {
        const url = 'https://custom.url/path';
        vi.spyOn(desensitizeTool, 'desensitizeUrl').mockImplementation(
          (_) => 'https://custom.mocked.url',
        );
        const maskedUrl = desensitizeCloudflareUrl(url);
        expect(desensitizeTool.desensitizeUrl).toHaveBeenCalledWith('https://custom.url');
        expect(maskedUrl).toBe('https://custom.mocked.url/path');
      });

      it('should mask account id in custom API endpoint', () => {
        const url =
          'https://custom.url/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/';
        const maskedUrl = desensitizeCloudflareUrl(url);
        expect(maskedUrl).toBe('https://cu****om.url/custom/prefix/****/custom/suffix/');
      });

      it('should mask account id in custom API endpoint with query params', () => {
        const url =
          'https://custom.url/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/?query=param';
        const maskedUrl = desensitizeCloudflareUrl(url);
        expect(maskedUrl).toBe(
          'https://cu****om.url/custom/prefix/****/custom/suffix/?query=param',
        );
      });

      it('should mask account id in custom API endpoint with port', () => {
        const url =
          'https://custom.url:8080/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/';
        const maskedUrl = desensitizeCloudflareUrl(url);
        expect(maskedUrl).toBe('https://cu****om.url:****/custom/prefix/****/custom/suffix/');
      });
    });
  });

  describe('modelManifest', () => {
    describe('getModelBeta', () => {
      it('should get beta property', () => {
        const model = { properties: [{ property_id: 'beta', value: 'true' }] };
        const beta = getModelBeta(model);
        expect(beta).toBe(true);
      });

      it('should return false if beta property is false', () => {
        const model = { properties: [{ property_id: 'beta', value: 'false' }] };
        const beta = getModelBeta(model);
        expect(beta).toBe(false);
      });

      it('should return false if beta property is not present', () => {
        const model = { properties: [] };
        const beta = getModelBeta(model);
        expect(beta).toBe(false);
      });
    });

    describe('getModelDisplayName', () => {
      it('should return display name with beta suffix', () => {
        const model = { name: 'model', properties: [{ property_id: 'beta', value: 'true' }] };
        const name = getModelDisplayName(model, true);
        expect(name).toBe('model (Beta)');
      });

      it('should return display name without beta suffix', () => {
        const model = { name: 'model', properties: [] };
        const name = getModelDisplayName(model, false);
        expect(name).toBe('model');
      });

      it('should return model["name"]', () => {
        const model = { id: 'modelID', name: 'modelName' };
        const name = getModelDisplayName(model, false);
        expect(name).toBe('modelName');
      });

      it('should return last part of model["name"]', () => {
        const model = { name: '@provider/modelFamily/modelName' };
        const name = getModelDisplayName(model, false);
        expect(name).toBe('modelName');
      });
    });

    describe('getModelFunctionCalling', () => {
      it('should return true if function_calling property is true', () => {
        const model = { properties: [{ property_id: 'function_calling', value: 'true' }] };
        const functionCalling = getModelFunctionCalling(model);
        expect(functionCalling).toBe(true);
      });

      it('should return false if function_calling property is false', () => {
        const model = { properties: [{ property_id: 'function_calling', value: 'false' }] };
        const functionCalling = getModelFunctionCalling(model);
        expect(functionCalling).toBe(false);
      });

      it('should return false if function_calling property is not set', () => {
        const model = { properties: [] };
        const functionCalling = getModelFunctionCalling(model);
        expect(functionCalling).toBe(false);
      });
    });

    describe('getModelTokens', () => {
      it('should return tokens property value', () => {
        const model = { properties: [{ property_id: 'max_total_tokens', value: '100' }] };
        const tokens = getModelTokens(model);
        expect(tokens).toBe(100);
      });

      it('should return undefined if tokens property is not present', () => {
        const model = { properties: [] };
        const tokens = getModelTokens(model);
        expect(tokens).toBeUndefined();
      });
    });
  });
});
