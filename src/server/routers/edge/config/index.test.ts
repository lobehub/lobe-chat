// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory } from '@/libs/trpc';
import { AuthContext, createContextInner } from '@/server/context';
import { GlobalServerConfig } from '@/types/serverConfig';

import { configRouter } from './index';

const createCaller = createCallerFactory(configRouter);
let ctx: AuthContext;
let router: ReturnType<typeof createCaller>;

beforeEach(async () => {
  vi.resetAllMocks();
  ctx = await createContextInner();
  router = createCaller(ctx);
});

describe('configRouter', () => {
  describe('getGlobalConfig', () => {
    describe('Model Provider env', () => {
      describe('OPENAI_MODEL_LIST', () => {
        it('custom deletion, addition, and renaming of models', async () => {
          process.env.OPENAI_MODEL_LIST =
            '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-0125-preview=gpt-4-turbo,gpt-4-0125-preview=gpt-4-32k';

          const response = await router.getGlobalConfig();

          // Assert
          const result = response.languageModel?.openai;

          expect(result).toMatchSnapshot();
          process.env.OPENAI_MODEL_LIST = '';
        });

        it('should work correct with gpt-4', async () => {
          process.env.OPENAI_MODEL_LIST =
            '-all,+gpt-3.5-turbo-1106,+gpt-3.5-turbo,+gpt-3.5-turbo-16k,+gpt-4,+gpt-4-32k,+gpt-4-1106-preview,+gpt-4-vision-preview';

          const response = await router.getGlobalConfig();

          const result = response.languageModel?.openai?.serverModelCards;

          expect(result).toMatchSnapshot();

          process.env.OPENAI_MODEL_LIST = '';
        });

        it('duplicate naming model', async () => {
          process.env.OPENAI_MODEL_LIST =
            'gpt-4-0125-preview=gpt-4-turbo，gpt-4-0125-preview=gpt-4-32k';

          const response = await router.getGlobalConfig();

          const result = response.languageModel?.openai?.serverModelCards;

          expect(result?.find((s) => s.id === 'gpt-4-0125-preview')?.displayName).toEqual(
            'gpt-4-32k',
          );

          process.env.OPENAI_MODEL_LIST = '';
        });

        it('should delete model', async () => {
          process.env.OPENAI_MODEL_LIST = '-gpt-4';

          const response = await router.getGlobalConfig();

          const result = response.languageModel?.openai?.serverModelCards;

          expect(result?.find((r) => r.id === 'gpt-4')).toBeUndefined();

          process.env.OPENAI_MODEL_LIST = '';
        });

        it('show the hidden model', async () => {
          process.env.OPENAI_MODEL_LIST = '+gpt-4-1106-preview';

          const response = await router.getGlobalConfig();

          const result = response.languageModel?.openai?.serverModelCards;

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

          const response = await router.getGlobalConfig();

          const result = response.languageModel?.openai?.serverModelCards;

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

      describe('OPENROUTER_MODEL_LIST', () => {
        it('custom deletion, addition, and renaming of models', async () => {
          process.env.OPENROUTER_MODEL_LIST =
            '-all,+google/gemma-7b-it:free,+mistralai/mistral-7b-instruct:free';

          const response = await router.getGlobalConfig();

          // Assert
          const result = response.languageModel?.openrouter;

          expect(result).toMatchSnapshot();

          process.env.OPENROUTER_MODEL_LIST = '';
        });
      });
    });
  });

  describe('getDefaultAgentConfig', () => {
    it('should return the default agent config', async () => {
      process.env.DEFAULT_AGENT_CONFIG =
        'plugins=search-engine,lobe-image-designer;enableAutoCreateTopic=true;model=gemini-pro;provider=google;';

      const response = await router.getDefaultAgentConfig();

      expect(response).toEqual({
        enableAutoCreateTopic: true,
        model: 'gemini-pro',
        plugins: ['search-engine', 'lobe-image-designer'],
        provider: 'google',
      });

      process.env.DEFAULT_AGENT_CONFIG = '';
    });

    it('should return another config', async () => {
      process.env.DEFAULT_AGENT_CONFIG =
        'model=meta-11ama/11ama-3-70b-instruct:nitro;provider=openrouter;enableAutoCreateTopic=true;params.max_tokens=700';

      const response = await router.getDefaultAgentConfig();

      expect(response).toEqual({
        enableAutoCreateTopic: true,
        model: 'meta-11ama/11ama-3-70b-instruct:nitro',
        params: { max_tokens: 700 },
        provider: 'openrouter',
      });

      process.env.DEFAULT_AGENT_CONFIG = '';
    });
  });
});
