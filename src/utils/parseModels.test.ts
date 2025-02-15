import { describe, expect, it } from 'vitest';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import { openaiChatModels } from '@/config/aiModels/openai';
import { AiFullModelCard } from '@/types/aiModel';

import { parseModelString, transformToAiChatModelList } from './parseModels';

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

  it('empty string model', () => {
    const result = parseModelString('gpt-4-1106-preview=gpt-4-turbo,,  ,\n  ，+claude-2');
    expect(result).toMatchSnapshot();
  });

  describe('extension capabilities', () => {
    it('with token', () => {
      const result = parseModelString('chatglm-6b=ChatGLM 6B<4096>');

      expect(result.add[0]).toEqual({
        displayName: 'ChatGLM 6B',
        id: 'chatglm-6b',
        contextWindowTokens: 4096,
        abilities: {},
        type: 'chat',
      });
    });

    it('token and function calling', () => {
      const result = parseModelString('spark-v3.5=讯飞星火 v3.5<8192:fc>');

      expect(result.add[0]).toEqual({
        displayName: '讯飞星火 v3.5',
        abilities: {
          functionCall: true,
        },
        id: 'spark-v3.5',
        contextWindowTokens: 8192,
        type: 'chat',
      });
    });

    it('token and reasoning', () => {
      const result = parseModelString('deepseek-r1=Deepseek R1<65536:reasoning>');

      expect(result.add[0]).toEqual({
        displayName: 'Deepseek R1',
        abilities: {
          reasoning: true,
        },
        id: 'deepseek-r1',
        contextWindowTokens: 65_536,
        type: 'chat',
      });
    });

    it('multi models', () => {
      const result = parseModelString(
        'gemini-1.5-flash-latest=Gemini 1.5 Flash<16000:vision>,gpt-4-all=ChatGPT Plus<128000:fc:vision:file>',
      );

      expect(result.add).toEqual([
        {
          displayName: 'Gemini 1.5 Flash',
          abilities: {
            vision: true,
          },
          id: 'gemini-1.5-flash-latest',
          contextWindowTokens: 16000,
          type: 'chat',
        },
        {
          displayName: 'ChatGPT Plus',
          abilities: {
            vision: true,
            functionCall: true,
            files: true,
          },
          type: 'chat',
          id: 'gpt-4-all',
          contextWindowTokens: 128000,
        },
      ]);
    });

    it('should have file with builtin models like gpt-4-0125-preview', () => {
      const result = parseModelString(
        '-all,+gpt-4-0125-preview=ChatGPT-4<128000:fc:file>,+gpt-4-turbo-2024-04-09=ChatGPT-4 Vision<128000:fc:vision:file>',
      );
      expect(result.add).toEqual([
        {
          displayName: 'ChatGPT-4',
          abilities: {
            functionCall: true,
            files: true,
          },
          type: 'chat',
          id: 'gpt-4-0125-preview',
          contextWindowTokens: 128000,
        },
        {
          displayName: 'ChatGPT-4 Vision',
          abilities: {
            functionCall: true,
            files: true,
            vision: true,
          },
          type: 'chat',
          id: 'gpt-4-turbo-2024-04-09',
          contextWindowTokens: 128000,
        },
      ]);
    });

    it('should handle empty extension capability value', () => {
      const result = parseModelString('model1<1024:>');
      expect(result.add[0]).toEqual({
        abilities: {},
        type: 'chat',
        id: 'model1',
        contextWindowTokens: 1024,
      });
    });

    it('should handle empty extension capability name', () => {
      const result = parseModelString('model1<1024::file>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          files: true,
        },
        type: 'chat',
      });
    });

    it('should handle duplicate extension capabilities', () => {
      const result = parseModelString('model1<1024:vision:vision>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          vision: true,
        },
        type: 'chat',
      });
    });

    it('should handle case-sensitive extension capability names', () => {
      const result = parseModelString('model1<1024:VISION:FC:file>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          files: true,
        },
        type: 'chat',
      });
    });

    it('should handle case-sensitive extension capability values', () => {
      const result = parseModelString('model1<1024:vision:Fc:File>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          vision: true,
        },
        type: 'chat',
      });
    });

    it('should handle empty angle brackets', () => {
      const result = parseModelString('model1<>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle not close angle brackets', () => {
      const result = parseModelString('model1<,model2');
      expect(result.add).toEqual([
        { id: 'model1', abilities: {}, type: 'chat' },
        { id: 'model2', abilities: {}, type: 'chat' },
      ]);
    });

    it('should handle multi close angle brackets', () => {
      const result = parseModelString('model1<>>,model2');
      expect(result.add).toEqual([
        { id: 'model1', abilities: {}, type: 'chat' },
        { id: 'model2', abilities: {}, type: 'chat' },
      ]);
    });

    it('should handle only colon inside angle brackets', () => {
      const result = parseModelString('model1<:>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle only non-digit characters inside angle brackets', () => {
      const result = parseModelString('model1<abc>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle non-digit characters followed by digits inside angle brackets', () => {
      const result = parseModelString('model1<abc123>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle digits followed by non-colon characters inside angle brackets', () => {
      const result = parseModelString('model1<1024abc>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by multiple colons inside angle brackets', () => {
      const result = parseModelString('model1<1024::>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by a colon and non-letter characters inside angle brackets', () => {
      const result = parseModelString('model1<1024:123>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by a colon and spaces inside angle brackets', () => {
      const result = parseModelString('model1<1024: vision>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by multiple colons and spaces inside angle brackets', () => {
      const result = parseModelString('model1<1024: : vision>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });
  });

  describe('deployment name', () => {
    it('should have same deployment name as id', () => {
      const result = parseModelString('model1=Model 1', true);
      expect(result.add[0]).toEqual({
        id: 'model1',
        displayName: 'Model 1',
        abilities: {},
        type: 'chat',
        config: {
          deploymentName: 'model1',
        },
      });
    });

    it('should have diff deployment name as id', () => {
      const result = parseModelString('gpt-35-turbo->my-deploy=GPT 3.5 Turbo', true);
      expect(result.add[0]).toEqual({
        id: 'gpt-35-turbo',
        displayName: 'GPT 3.5 Turbo',
        abilities: {},
        type: 'chat',
        config: {
          deploymentName: 'my-deploy',
        },
      });
    });
  });
});

describe('transformToChatModelCards', () => {
  const defaultChatModels: AiFullModelCard[] = [
    { id: 'model1', displayName: 'Model 1', enabled: true, type: 'chat' },
    { id: 'model2', displayName: 'Model 2', enabled: false, type: 'chat' },
  ];

  it('should return undefined when modelString is empty', () => {
    const result = transformToAiChatModelList({
      modelString: '',
      defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toBeUndefined();
  });

  it('should remove all models when removeAll is true', () => {
    const result = transformToAiChatModelList({
      modelString: '-all',
      defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toEqual([]);
  });

  it('should remove specified models', () => {
    const result = transformToAiChatModelList({
      modelString: '-model1',
      defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toEqual([
      { id: 'model2', displayName: 'Model 2', enabled: false, type: 'chat' },
    ]);
  });

  it('should add a new known model', () => {
    const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => m.providerId === 'ai21')!;
    const result = transformToAiChatModelList({
      modelString: `${knownModel.id}`,
      defaultChatModels,
      providerId: 'ai21',
    });

    expect(result).toContainEqual({
      ...knownModel,
      displayName: knownModel.displayName || knownModel.id,
      enabled: true,
    });
  });

  it('should update an existing known model', () => {
    const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => m.providerId === 'openai')!;
    const result = transformToAiChatModelList({
      modelString: `+${knownModel.id}=Updated Model`,
      defaultChatModels: [knownModel],
      providerId: 'openai',
    });

    expect(result).toContainEqual({
      ...knownModel,
      displayName: 'Updated Model',
      enabled: true,
    });
  });

  it('should add a new custom model', () => {
    const result = transformToAiChatModelList({
      modelString: '+custom_model=Custom Model',
      defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toContainEqual({
      id: 'custom_model',
      displayName: 'Custom Model',
      enabled: true,
      abilities: {},
      type: 'chat',
    });
  });

  it('should have file with builtin models like gpt-4-0125-preview', () => {
    const result = transformToAiChatModelList({
      modelString:
        '-all,+gpt-4-0125-preview=ChatGPT-4<128000:fc:file>,+gpt-4-turbo-2024-04-09=ChatGPT-4 Vision<128000:fc:vision:file>',
      defaultChatModels: openaiChatModels,
      providerId: 'openai',
    });

    expect(result).toMatchSnapshot();
  });
});
