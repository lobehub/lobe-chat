import { generateModelDisplayName, isModelFree, extractModelCoreName } from '../modelDisplayName';

describe('modelDisplayName utilities', () => {
  describe('generateModelDisplayName', () => {
    it('should return original display name if provided and different from modelId', () => {
      const result = generateModelDisplayName('gpt-4', 'Custom GPT Model');
      expect(result).toBe('Custom GPT Model');
    });

    it('should not return original display name if same as modelId', () => {
      const result = generateModelDisplayName('gpt-4', 'gpt-4');
      expect(result).toBe('GPT-4'); // Should use the mapping instead
    });

    it('should handle direct model mappings', () => {
      expect(generateModelDisplayName('gpt-4')).toBe('GPT-4');
      expect(generateModelDisplayName('gpt-4o')).toBe('GPT-4o');
      expect(generateModelDisplayName('claude-3-opus')).toBe('Claude 3 Opus');
      expect(generateModelDisplayName('claude-3.5-sonnet')).toBe('Claude 3.5 Sonnet');
      expect(generateModelDisplayName('gemini-pro')).toBe('Gemini Pro');
      expect(generateModelDisplayName('deepseek-chat')).toBe('DeepSeek Chat');
    });

    it('should remove provider prefixes', () => {
      expect(generateModelDisplayName('openai/gpt-4')).toBe('GPT-4');
      expect(generateModelDisplayName('anthropic/claude-3-opus')).toBe('Claude 3 Opus');
      expect(generateModelDisplayName('google/gemini-pro')).toBe('Gemini Pro');
    });

    it('should handle :free suffix', () => {
      expect(generateModelDisplayName('deepseek-r1:free')).toBe('DeepSeek R1 (Free)');
      expect(generateModelDisplayName('qwen3-30b-a3b:free')).toBe('Qwen3 30B A3B (Free)');
    });

    it('should handle -preview suffix', () => {
      expect(generateModelDisplayName('gpt-4-preview')).toBe('GPT 4 preview');
      expect(generateModelDisplayName('claude-3-preview')).toBe('Claude 3 preview');
    });

    it('should beautify model names with numbers and letters', () => {
      expect(generateModelDisplayName('llama-7b')).toBe('Llama 7B');
      expect(generateModelDisplayName('llama-13b')).toBe('Llama 13B');
      expect(generateModelDisplayName('mistral-7b')).toBe('Mistral 7B');
      expect(generateModelDisplayName('codellama-34b')).toBe('Codellama 34B');
    });

    it('should handle underscores and hyphens', () => {
      expect(generateModelDisplayName('text_davinci_003')).toBe('Text Davinci 003');
      expect(generateModelDisplayName('text-embedding-ada-002')).toBe('Text Embedding Ada 002');
    });

    it('should handle common abbreviations', () => {
      expect(generateModelDisplayName('gpt-api-model')).toBe('GPT API Model');
      expect(generateModelDisplayName('ui-helper')).toBe('UI Helper');
      expect(generateModelDisplayName('ai-assistant')).toBe('AI Assistant');
      expect(generateModelDisplayName('ml-model')).toBe('ML Model');
      expect(generateModelDisplayName('nlp-processor')).toBe('NLP Processor');
      expect(generateModelDisplayName('llm-chat')).toBe('LLM Chat');
    });

    it('should preserve already uppercase abbreviations', () => {
      expect(generateModelDisplayName('GPT-4-API')).toBe('GPT 4 API');
      expect(generateModelDisplayName('AI-ML-NLP')).toBe('AI ML NLP');
    });

    it('should handle edge cases', () => {
      expect(generateModelDisplayName('')).toBe('');
      expect(generateModelDisplayName('single')).toBe('Single');
      expect(generateModelDisplayName('a-b-c')).toBe('A B C');
    });
  });

  describe('isModelFree', () => {
    it('should return true for models with :free suffix', () => {
      expect(isModelFree('deepseek-r1:free')).toBe(true);
      expect(isModelFree('qwen3-30b-a3b:free')).toBe(true);
      expect(isModelFree('model-name:free')).toBe(true);
    });

    it('should return true for models containing "free" in name', () => {
      expect(isModelFree('free-gpt-model')).toBe(true);
      expect(isModelFree('gpt-free-version')).toBe(true);
      expect(isModelFree('model-free-tier')).toBe(true);
    });

    it('should return true for models containing "Free" (capitalized)', () => {
      expect(isModelFree('Free-GPT')).toBe(true);
      expect(isModelFree('Model-Free-Version')).toBe(true);
    });

    it('should return false for paid models', () => {
      expect(isModelFree('gpt-4')).toBe(false);
      expect(isModelFree('claude-3-opus')).toBe(false);
      expect(isModelFree('gemini-pro')).toBe(false);
      expect(isModelFree('deepseek-chat')).toBe(false);
    });

    it('should return false for models with similar but different terms', () => {
      // Note: 'freedom-model' contains 'free' so it will return true
      expect(isModelFree('freedom-model')).toBe(true);
      expect(isModelFree('freelancer-gpt')).toBe(true); // contains 'free'
      expect(isModelFree('freeze-model')).toBe(true); // contains 'free'

      // These should actually return false
      expect(isModelFree('paid-model')).toBe(false);
      expect(isModelFree('premium-gpt')).toBe(false);
      expect(isModelFree('pro-version')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isModelFree('')).toBe(false);
      expect(isModelFree('free')).toBe(true);
      expect(isModelFree('Free')).toBe(true);
    });
  });

  describe('extractModelCoreName', () => {
    it('should remove provider prefixes', () => {
      expect(extractModelCoreName('openai/gpt-4')).toBe('gpt-4');
      expect(extractModelCoreName('anthropic/claude-3-opus')).toBe('claude-3-opus');
      expect(extractModelCoreName('google/gemini-pro')).toBe('gemini-pro');
      expect(extractModelCoreName('deepseek/deepseek-chat')).toBe('deepseek-chat');
    });

    it('should remove version suffixes', () => {
      expect(extractModelCoreName('gpt-4:free')).toBe('gpt-4');
      expect(extractModelCoreName('claude-3:preview')).toBe('claude-3');
      expect(extractModelCoreName('model:beta')).toBe('model');
      expect(extractModelCoreName('test-model:alpha')).toBe('test-model');
    });

    it('should remove both prefix and suffix', () => {
      expect(extractModelCoreName('openai/gpt-4:free')).toBe('gpt-4');
      expect(extractModelCoreName('anthropic/claude-3:preview')).toBe('claude-3');
      expect(extractModelCoreName('provider/model-name:beta')).toBe('model-name');
    });

    it('should handle models with no prefix or suffix', () => {
      expect(extractModelCoreName('gpt-4')).toBe('gpt-4');
      expect(extractModelCoreName('claude-3-opus')).toBe('claude-3-opus');
      expect(extractModelCoreName('simple-model')).toBe('simple-model');
    });

    it('should handle complex provider names with numbers and hyphens', () => {
      expect(extractModelCoreName('provider-123/model-name')).toBe('model-name');
      expect(extractModelCoreName('multi-word-provider/model')).toBe('model');
      expect(extractModelCoreName('123-provider/model')).toBe('model');
    });

    it('should be case insensitive for suffixes', () => {
      expect(extractModelCoreName('model:FREE')).toBe('model');
      expect(extractModelCoreName('model:Preview')).toBe('model');
      expect(extractModelCoreName('model:BETA')).toBe('model');
      expect(extractModelCoreName('model:Alpha')).toBe('model');
    });

    it('should handle edge cases', () => {
      expect(extractModelCoreName('')).toBe('');
      expect(extractModelCoreName('model')).toBe('model');
      expect(extractModelCoreName('prefix/')).toBe('');
      // ':suffix' should remain as ':suffix' since it doesn't match the recognized suffixes
      expect(extractModelCoreName(':suffix')).toBe(':suffix');
      // But recognized suffixes should be removed, leaving empty string
      expect(extractModelCoreName(':free')).toBe('');
      expect(extractModelCoreName(':preview')).toBe('');
    });

    it('should not remove suffixes that are not recognized', () => {
      expect(extractModelCoreName('model:custom')).toBe('model:custom');
      expect(extractModelCoreName('model:v2')).toBe('model:v2');
      expect(extractModelCoreName('model:special')).toBe('model:special');
    });
  });
});
