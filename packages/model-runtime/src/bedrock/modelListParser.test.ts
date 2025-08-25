import { describe, expect, it } from 'vitest';

import { parseModelList, validateModelListSyntax } from './modelListParser';

describe('parseModelList', () => {
  const availableModels = [
    'claude-v1',
    'claude-v2',
    'claude-v3',
    'titan-text',
    'titan-embed',
    // Cross-region inference profile IDs
    'us.amazon.nova-premier-v1:0',
    'us.amazon.nova-pro-v1:0',
    'us.amazon.nova-lite-v1:0',
    'eu.amazon.nova-pro-v1:0',
    'apac.amazon.nova-lite-v1:0',
    'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
    'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
    'us.meta.llama3-1-405b-instruct-v1:0',
    'us.meta.llama3-2-90b-instruct-v1:0',
    'us.deepseek.r1-v1:0',
    'us.mistral.pixtral-large-2502-v1:0',
    'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
  ];

  describe('basic functionality', () => {
    it('should return empty array for empty input', () => {
      expect(parseModelList('', availableModels)).toEqual([]);
      expect(parseModelList('   ', availableModels)).toEqual([]);
    });

    it('should handle simple model list', () => {
      expect(parseModelList('claude-v1,claude-v2', availableModels)).toEqual([
        'claude-v1',
        'claude-v2',
      ]);
    });

    it('should filter out unavailable models', () => {
      expect(parseModelList('claude-v1,nonexistent-model', availableModels)).toEqual(['claude-v1']);
    });

    it('should handle whitespace', () => {
      expect(parseModelList(' claude-v1 , claude-v2 ', availableModels)).toEqual([
        'claude-v1',
        'claude-v2',
      ]);
    });
  });

  describe('inclusion syntax', () => {
    it('should handle + prefix for inclusions', () => {
      expect(parseModelList('+claude-v1,+claude-v2', availableModels)).toEqual([
        'claude-v1',
        'claude-v2',
      ]);
    });

    it('should mix + prefix and regular names', () => {
      expect(parseModelList('+claude-v1,claude-v2', availableModels)).toEqual([
        'claude-v1',
        'claude-v2',
      ]);
    });
  });

  describe('exclusion syntax', () => {
    it('should handle - prefix for exclusions with explicit inclusions', () => {
      expect(parseModelList('claude-v1,claude-v2,-claude-v1', availableModels)).toEqual([
        'claude-v2',
      ]);
    });

    it('should handle exclusions with all', () => {
      const result = parseModelList('all,-claude-v1', availableModels);
      expect(result).toEqual([
        'claude-v2',
        'claude-v3',
        'titan-text',
        'titan-embed',
        'us.amazon.nova-premier-v1:0',
        'us.amazon.nova-pro-v1:0',
        'us.amazon.nova-lite-v1:0',
        'eu.amazon.nova-pro-v1:0',
        'apac.amazon.nova-lite-v1:0',
        'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
        'us.meta.llama3-1-405b-instruct-v1:0',
        'us.meta.llama3-2-90b-instruct-v1:0',
        'us.deepseek.r1-v1:0',
        'us.mistral.pixtral-large-2502-v1:0',
        'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
      ]);
    });

    it('should handle multiple exclusions', () => {
      const result = parseModelList('all,-claude-v1,-titan-text', availableModels);
      expect(result).toEqual([
        'claude-v2',
        'claude-v3',
        'titan-embed',
        'us.amazon.nova-premier-v1:0',
        'us.amazon.nova-pro-v1:0',
        'us.amazon.nova-lite-v1:0',
        'eu.amazon.nova-pro-v1:0',
        'apac.amazon.nova-lite-v1:0',
        'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
        'us.meta.llama3-1-405b-instruct-v1:0',
        'us.meta.llama3-2-90b-instruct-v1:0',
        'us.deepseek.r1-v1:0',
        'us.mistral.pixtral-large-2502-v1:0',
        'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
      ]);
    });
  });

  describe('all keyword', () => {
    it('should include all models when using "all"', () => {
      expect(parseModelList('all', availableModels)).toEqual(availableModels);
    });

    it('should handle all with exclusions', () => {
      const result = parseModelList('all,-claude-v1,-claude-v2', availableModels);
      expect(result).toEqual([
        'claude-v3',
        'titan-text',
        'titan-embed',
        'us.amazon.nova-premier-v1:0',
        'us.amazon.nova-pro-v1:0',
        'us.amazon.nova-lite-v1:0',
        'eu.amazon.nova-pro-v1:0',
        'apac.amazon.nova-lite-v1:0',
        'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
        'us.meta.llama3-1-405b-instruct-v1:0',
        'us.meta.llama3-2-90b-instruct-v1:0',
        'us.deepseek.r1-v1:0',
        'us.mistral.pixtral-large-2502-v1:0',
        'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
      ]);
    });
  });

  describe('cross-region inference profiles', () => {
    it('should handle US region models', () => {
      expect(
        parseModelList(
          'us.amazon.nova-premier-v1:0,us.anthropic.claude-3-7-sonnet-20250219-v1:0',
          availableModels,
        ),
      ).toEqual(['us.amazon.nova-premier-v1:0', 'us.anthropic.claude-3-7-sonnet-20250219-v1:0']);
    });

    it('should handle EU region models', () => {
      expect(
        parseModelList(
          'eu.amazon.nova-pro-v1:0,eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
          availableModels,
        ),
      ).toEqual(['eu.amazon.nova-pro-v1:0', 'eu.anthropic.claude-3-7-sonnet-20250219-v1:0']);
    });

    it('should handle APAC region models', () => {
      expect(
        parseModelList(
          'apac.amazon.nova-lite-v1:0,apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
          availableModels,
        ),
      ).toEqual(['apac.amazon.nova-lite-v1:0', 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0']);
    });

    it('should handle US-Gov region models', () => {
      expect(
        parseModelList('us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0', availableModels),
      ).toEqual(['us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0']);
    });

    it('should handle mixed regional and regular models', () => {
      expect(
        parseModelList(
          'claude-v1,us.amazon.nova-premier-v1:0,eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
          availableModels,
        ),
      ).toEqual([
        'claude-v1',
        'us.amazon.nova-premier-v1:0',
        'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
      ]);
    });

    it('should exclude cross-region models with - prefix', () => {
      expect(
        parseModelList(
          'all,-us.amazon.nova-premier-v1:0,-eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
          availableModels,
        ),
      ).toEqual([
        'claude-v1',
        'claude-v2',
        'claude-v3',
        'titan-text',
        'titan-embed',
        'us.amazon.nova-pro-v1:0',
        'us.amazon.nova-lite-v1:0',
        'eu.amazon.nova-pro-v1:0',
        'apac.amazon.nova-lite-v1:0',
        'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
        'us.meta.llama3-1-405b-instruct-v1:0',
        'us.meta.llama3-2-90b-instruct-v1:0',
        'us.deepseek.r1-v1:0',
        'us.mistral.pixtral-large-2502-v1:0',
        'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty exclusion prefix', () => {
      expect(parseModelList('claude-v1,-', availableModels)).toEqual(['claude-v1']);
    });

    it('should handle empty inclusion prefix', () => {
      expect(parseModelList('claude-v1,+', availableModels)).toEqual(['claude-v1']);
    });

    it('should handle duplicate models', () => {
      expect(parseModelList('claude-v1,claude-v1,claude-v2', availableModels)).toEqual([
        'claude-v1',
        'claude-v2',
      ]);
    });

    it('should handle complex mixed syntax', () => {
      expect(parseModelList('all,+claude-v1,-titan-text,-claude-v2', availableModels)).toEqual([
        'claude-v1',
        'claude-v3',
        'titan-embed',
        'us.amazon.nova-premier-v1:0',
        'us.amazon.nova-pro-v1:0',
        'us.amazon.nova-lite-v1:0',
        'eu.amazon.nova-pro-v1:0',
        'apac.amazon.nova-lite-v1:0',
        'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
        'us.meta.llama3-1-405b-instruct-v1:0',
        'us.meta.llama3-2-90b-instruct-v1:0',
        'us.deepseek.r1-v1:0',
        'us.mistral.pixtral-large-2502-v1:0',
        'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
      ]);
    });
  });
});

describe('validateModelListSyntax', () => {
  it('should validate empty input as valid', () => {
    expect(validateModelListSyntax('')).toEqual({ valid: true });
    expect(validateModelListSyntax('   ')).toEqual({ valid: true });
  });

  it('should validate simple model names', () => {
    expect(validateModelListSyntax('claude-v1,claude-v2')).toEqual({ valid: true });
  });

  it('should validate all keyword', () => {
    expect(validateModelListSyntax('all')).toEqual({ valid: true });
  });

  it('should validate inclusion/exclusion syntax', () => {
    expect(validateModelListSyntax('+claude-v1,-claude-v2')).toEqual({ valid: true });
  });

  it('should reject empty prefixes', () => {
    expect(validateModelListSyntax('claude-v1,-')).toEqual({
      valid: false,
      error: "Invalid syntax: '-' - prefix must be followed by model ID",
    });

    expect(validateModelListSyntax('claude-v1,+')).toEqual({
      valid: false,
      error: "Invalid syntax: '+' - prefix must be followed by model ID",
    });
  });

  it('should reject invalid characters', () => {
    expect(validateModelListSyntax('claude@v1')).toEqual({
      valid: false,
      error: "Invalid model ID: 'claude@v1' - contains invalid characters",
    });
  });

  it('should accept valid characters', () => {
    expect(validateModelListSyntax('claude-v1_test.model+variant')).toEqual({ valid: true });
  });

  it('should validate cross-region inference profile IDs', () => {
    expect(validateModelListSyntax('us.amazon.nova-premier-v1:0')).toEqual({ valid: true });
    expect(validateModelListSyntax('eu.anthropic.claude-3-7-sonnet-20250219-v1:0')).toEqual({
      valid: true,
    });
    expect(validateModelListSyntax('apac.meta.llama3-1-405b-instruct-v1:0')).toEqual({
      valid: true,
    });
    expect(validateModelListSyntax('us-gov.anthropic.claude-3-haiku-20240307-v1:0')).toEqual({
      valid: true,
    });
  });

  it('should validate mixed cross-region and regular model syntax', () => {
    expect(
      validateModelListSyntax(
        'all,-us.amazon.nova-premier-v1:0,+eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
      ),
    ).toEqual({ valid: true });
  });
});
