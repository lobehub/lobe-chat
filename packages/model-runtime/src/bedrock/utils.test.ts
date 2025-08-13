import { describe, expect, it } from 'vitest';

import {
  CLAUDE_MODEL_REGEX,
  VALID_BEDROCK_REGIONS,
  createBedrockRequestOptions,
  parseModelList,
} from './utils';

describe('parseModelList', () => {
  const availableModels = ['claude-3', 'claude-2', 'llama-2', 'titan-text'];

  it('should handle "all" keyword', () => {
    const result = parseModelList('all', availableModels);
    expect(result).toEqual(availableModels);
  });

  it('should handle exclusions with "all"', () => {
    const result = parseModelList('all,-claude-2', availableModels);
    expect(result).toEqual(['claude-3', 'llama-2', 'titan-text']);
  });

  it('should handle explicit inclusions', () => {
    const result = parseModelList('claude-3,llama-2', availableModels);
    expect(result).toEqual(['claude-3', 'llama-2']);
  });

  it('should handle + prefix for inclusions', () => {
    const result = parseModelList('+claude-3,+llama-2', availableModels);
    expect(result).toEqual(['claude-3', 'llama-2']);
  });

  it('should handle mixed inclusions and exclusions', () => {
    const result = parseModelList('claude-3,llama-2,-claude-3', availableModels);
    expect(result).toEqual(['llama-2']);
  });

  it('should handle empty string', () => {
    const result = parseModelList('', availableModels);
    expect(result).toEqual([]);
  });

  it('should handle whitespace and empty entries', () => {
    const result = parseModelList(' claude-3 , , llama-2 ', availableModels);
    expect(result).toEqual(['claude-3', 'llama-2']);
  });
});

describe('CLAUDE_MODEL_REGEX', () => {
  it('should match Claude model names', () => {
    expect(CLAUDE_MODEL_REGEX.test('claude-3')).toBe(true);
    expect(CLAUDE_MODEL_REGEX.test('claude-2')).toBe(true);
    expect(CLAUDE_MODEL_REGEX.test('claude-instant')).toBe(true);
    expect(CLAUDE_MODEL_REGEX.test('claude-3:latest')).toBe(true);
  });

  it('should not match non-Claude models', () => {
    expect(CLAUDE_MODEL_REGEX.test('llama-2')).toBe(false);
    expect(CLAUDE_MODEL_REGEX.test('titan-text')).toBe(false);
    expect(CLAUDE_MODEL_REGEX.test('gpt-4')).toBe(false);
  });
});

describe('createBedrockRequestOptions', () => {
  it('should create proper request options', () => {
    const body = { test: 'data' };
    const token = 'test-token';
    const { options, cleanup } = createBedrockRequestOptions(body, token);

    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({
      'Authorization': 'Bearer test-token',
      'Content-Type': 'application/json',
    });
    expect(options.body).toBe(JSON.stringify(body));
    expect(typeof cleanup).toBe('function');
  });
});

describe('VALID_BEDROCK_REGIONS', () => {
  it('should contain all official AWS Bedrock regions', () => {
    const expectedRegions = [
      'us-east-1',
      'us-east-2',
      'us-west-2',
      'ap-south-1',
      'ap-south-2',
      'ap-northeast-1',
      'ap-northeast-2',
      'ap-northeast-3',
      'ap-southeast-1',
      'ap-southeast-2',
      'ca-central-1',
      'eu-central-1',
      'eu-central-2',
      'eu-west-1',
      'eu-west-2',
      'eu-west-3',
      'eu-north-1',
      'eu-south-1',
      'eu-south-2',
      'sa-east-1',
      'us-gov-east-1',
      'us-gov-west-1',
    ];

    expectedRegions.forEach((region) => {
      expect(VALID_BEDROCK_REGIONS.has(region)).toBe(true);
    });

    expect(VALID_BEDROCK_REGIONS.size).toBe(expectedRegions.length);
    expect(VALID_BEDROCK_REGIONS.has('invalid-region')).toBe(false);
  });
});
