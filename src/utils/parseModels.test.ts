import { describe, expect, it } from 'vitest';

import { parseModelString } from './parseModels';

describe('parseModelString', () => {
  it('custom deletion, addition, and renaming of models', () => {
    const result = parseModelString(
      '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo,gpt-4-1106-preview=gpt-4-32k',
    );

    expect(result).toMatchSnapshot();
  });

  it('duplicate naming model', () => {
    const result = parseModelString('gpt-4-1106-preview=gpt-4-turbo，gpt-4-1106-preview=gpt-4-32k');
    expect(result).toMatchSnapshot();
  });

  it('only add the model', () => {
    const result = parseModelString('model1,model2,model3，model4');

    expect(result).toMatchSnapshot();
  });

  describe('extension capabilities', () => {
    it('with token', () => {
      const result = parseModelString('chatglm-6b=ChatGLM 6B<4096>');

      expect(result.add[0]).toEqual({
        displayName: 'ChatGLM 6B',
        id: 'chatglm-6b',
        tokens: 4096,
      });
    });

    it('token and function calling', () => {
      const result = parseModelString('spark-v3.5=讯飞星火 v3.5<8192:fc>');

      expect(result.add[0]).toEqual({
        displayName: '讯飞星火 v3.5',
        functionCall: true,
        id: 'spark-v3.5',
        tokens: 8192,
      });
    });

    it('multi models', () => {
      const result = parseModelString(
        'gemini-pro-vision=Gemini Pro Vision<16000:vision>,gpt-4-all=ChatGPT Plus<128000:fc:vision:file>',
      );

      expect(result.add).toEqual([
        {
          displayName: 'Gemini Pro Vision',
          vision: true,
          id: 'gemini-pro-vision',
          tokens: 16000,
        },
        {
          displayName: 'ChatGPT Plus',
          vision: true,
          functionCall: true,
          files: true,
          id: 'gpt-4-all',
          tokens: 128000,
        },
      ]);
    });

    it('should handle empty extension capability value', () => {
      const result = parseModelString('model1<1024:>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024 });
    });

    it('should handle empty extension capability name', () => {
      const result = parseModelString('model1<1024::file>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024, files: true });
    });

    it('should handle duplicate extension capabilities', () => {
      const result = parseModelString('model1<1024:vision:vision>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024, vision: true });
    });

    it('should handle case-sensitive extension capability names', () => {
      const result = parseModelString('model1<1024:VISION:FC:file>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024, files: true });
    });

    it('should handle case-sensitive extension capability values', () => {
      const result = parseModelString('model1<1024:vision:Fc:File>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024, vision: true });
    });

    it('should handle empty angle brackets', () => {
      const result = parseModelString('model1<>');
      expect(result.add[0]).toEqual({ id: 'model1' });
    });

    it('should handle not close angle brackets', () => {
      const result = parseModelString('model1<,model2');
      expect(result.add).toEqual([{ id: 'model1' }, { id: 'model2' }]);
    });

    it('should handle multi close angle brackets', () => {
      const result = parseModelString('model1<>>,model2');
      expect(result.add).toEqual([{ id: 'model1' }, { id: 'model2' }]);
    });

    it('should handle only colon inside angle brackets', () => {
      const result = parseModelString('model1<:>');
      expect(result.add[0]).toEqual({ id: 'model1' });
    });

    it('should handle only non-digit characters inside angle brackets', () => {
      const result = parseModelString('model1<abc>');
      expect(result.add[0]).toEqual({ id: 'model1' });
    });

    it('should handle non-digit characters followed by digits inside angle brackets', () => {
      const result = parseModelString('model1<abc123>');
      expect(result.add[0]).toEqual({ id: 'model1' });
    });

    it('should handle digits followed by non-colon characters inside angle brackets', () => {
      const result = parseModelString('model1<1024abc>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024 });
    });

    it('should handle digits followed by multiple colons inside angle brackets', () => {
      const result = parseModelString('model1<1024::>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024 });
    });

    it('should handle digits followed by a colon and non-letter characters inside angle brackets', () => {
      const result = parseModelString('model1<1024:123>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024 });
    });

    it('should handle digits followed by a colon and spaces inside angle brackets', () => {
      const result = parseModelString('model1<1024: vision>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024 });
    });

    it('should handle digits followed by multiple colons and spaces inside angle brackets', () => {
      const result = parseModelString('model1<1024: : vision>');
      expect(result.add[0]).toEqual({ id: 'model1', tokens: 1024 });
    });
  });

  describe('deployment name', () => {
    it('should have same deployment name as id', () => {
      const result = parseModelString('model1=Model 1', true);
      expect(result.add[0]).toEqual({
        id: 'model1',
        displayName: 'Model 1',
        deploymentName: 'model1',
      });
    });

    it('should have diff deployment name as id', () => {
      const result = parseModelString('gpt-35-turbo->my-deploy=GPT 3.5 Turbo', true);
      expect(result.add[0]).toEqual({
        id: 'gpt-35-turbo',
        displayName: 'GPT 3.5 Turbo',
        deploymentName: 'my-deploy',
      });
    });
  });
});
