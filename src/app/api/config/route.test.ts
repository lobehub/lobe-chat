import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GlobalServerConfig } from '@/types/serverConfig';

import { GET } from './route';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/config', () => {
  describe('Model Provider env', () => {
    describe('OPENAI_MODEL_LIST', () => {
      it('custom deletion, addition, and renaming of models', async () => {
        process.env.OPENAI_MODEL_LIST =
          '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-0125-preview=gpt-4-turbo,gpt-4-0125-preview=gpt-4-32k';

        const response = await GET();

        // Assert
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);

        const jsonResponse: GlobalServerConfig = await response.json();

        const result = jsonResponse.languageModel?.openai;

        expect(result).toMatchSnapshot();
        process.env.OPENAI_MODEL_LIST = '';
      });

      it('should work correct with gpt-4', async () => {
        process.env.OPENAI_MODEL_LIST =
          '-all,+gpt-3.5-turbo-1106,+gpt-3.5-turbo,+gpt-3.5-turbo-16k,+gpt-4,+gpt-4-32k,+gpt-4-1106-preview,+gpt-4-vision-preview';

        const response = await GET();
        const jsonResponse: GlobalServerConfig = await response.json();

        const result = jsonResponse.languageModel?.openai?.serverModelCards;

        expect(result).toMatchSnapshot();

        process.env.OPENAI_MODEL_LIST = '';
      });

      it('duplicate naming model', async () => {
        process.env.OPENAI_MODEL_LIST =
          'gpt-4-0125-preview=gpt-4-turbo，gpt-4-0125-preview=gpt-4-32k';

        const response = await GET();
        const jsonResponse: GlobalServerConfig = await response.json();

        const result = jsonResponse.languageModel?.openai?.serverModelCards;

        expect(result?.find((s) => s.id === 'gpt-4-0125-preview')?.displayName).toEqual(
          'gpt-4-32k',
        );

        process.env.OPENAI_MODEL_LIST = '';
      });

      it('should delete model', async () => {
        process.env.OPENAI_MODEL_LIST = '-gpt-4';

        const res = await GET();
        const data: GlobalServerConfig = await res.json();

        const result = data.languageModel?.openai?.serverModelCards;

        expect(result?.find((r) => r.id === 'gpt-4')).toBeUndefined();

        process.env.OPENAI_MODEL_LIST = '';
      });

      it('show the hidden model', async () => {
        process.env.OPENAI_MODEL_LIST = '+gpt-4-1106-preview';

        const res = await GET();
        const data: GlobalServerConfig = await res.json();

        const result = data.languageModel?.openai?.serverModelCards;

        expect(result?.find((o) => o.id === 'gpt-4-1106-preview')).toEqual({
          displayName: 'GPT-4 Turbo Preview (1106)',
          functionCall: true,
          enabled: true,
          id: 'gpt-4-1106-preview',
          tokens: 128000,
        });

        process.env.OPENAI_MODEL_LIST = '';
      });

      it('only add the model', async () => {
        process.env.OPENAI_MODEL_LIST = 'model1,model2,model3，model4';

        const res = await GET();
        const data: GlobalServerConfig = await res.json();

        const result = data.languageModel?.openai?.serverModelCards;

        expect(result).toContainEqual({
          displayName: 'model1',
          id: 'model1',
          enabled: true,
        });
        expect(result).toContainEqual({
          displayName: 'model2',
          enabled: true,
          id: 'model2',
        });
        expect(result).toContainEqual({
          displayName: 'model3',
          enabled: true,
          id: 'model3',
        });
        expect(result).toContainEqual({
          displayName: 'model4',
          enabled: true,
          id: 'model4',
        });

        process.env.OPENAI_MODEL_LIST = '';
      });
    });

    describe('CUSTOM_MODELS', () => {
      it('custom deletion, addition, and renaming of models', async () => {
        process.env.CUSTOM_MODELS =
          '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-0125-preview=gpt-4-turbo,gpt-4-0125-preview=gpt-4-32k';

        const response = await GET();

        // Assert
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);

        const jsonResponse: GlobalServerConfig = await response.json();

        const result = jsonResponse.languageModel?.openai?.serverModelCards;

        expect(result).toMatchSnapshot();
      });
    });

    describe('OPENROUTER_MODEL_LIST', () => {
      it('custom deletion, addition, and renaming of models', async () => {
        process.env.OPENROUTER_MODEL_LIST =
          '-all,+google/gemma-7b-it,+mistralai/mistral-7b-instruct=Mistral-7B-Instruct';

        const res = await GET();
        const data: GlobalServerConfig = await res.json();

        const result = data.languageModel?.openrouter;

        expect(result).toMatchSnapshot();

        process.env.OPENROUTER_MODEL_LIST = '';
      });
    });
  });
});
