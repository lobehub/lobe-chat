import { LanguageModel } from '@/types/llm';

import { GlobalStore } from '../store';
import { settingsSelectors } from './settings';

describe('settingsSelectors', () => {
  describe('currentSettings', () => {
    it('should merge DEFAULT_SETTINGS and s.settings correctly', () => {
      const s = {
        settings: {
          avatar: 'avatar.jpg',
          fontSize: 14,
          language: 'en-US',
          neutralColor: 'sand',
          password: 'password123',
          primaryColor: 'blue',
          themeMode: 'light',
          defaultAgent: {
            config: {
              systemRole: '',
              model: LanguageModel.GPT3_5,
              params: {},
              tts: {
                showAllLocaleVoice: false,
                sttLocale: 'auto',
                ttsService: 'openai',
                voice: {
                  openai: 'alloy',
                },
              },
            },
            meta: {
              avatar: 'Default Agent',
              description: 'Default agent for testing',
            },
          },
          tts: {
            openAI: {
              sttModel: 'whisper-1',
              ttsModel: 'tts-1',
            },
            sttAutoStop: true,
            sttServer: 'openai',
          },
          languageModel: {
            openAI: {
              OPENAI_API_KEY: 'openai-api-key',
              endpoint: 'https://openai-endpoint.com',
              models: ['gpt-3.5-turbo'],
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.currentSettings(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('CUSTOM_MODELS', () => {
    it('custom deletion, addition, and renaming of models', () => {
      const s = {
        settings: {
          languageModel: {
            openAI: {
              customModelName:
                '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo,gpt-4-1106-preview=gpt-4-32k',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.modelList(s);

      expect(result).toMatchSnapshot();
    });

    it('duplicate naming model', () => {
      const s = {
        settings: {
          languageModel: {
            openAI: {
              customModelName: 'gpt-4-1106-preview=gpt-4-turbo，gpt-4-1106-preview=gpt-4-32k',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.modelList(s);

      expect(result).toMatchSnapshot();
    });

    it('only add the model', () => {
      const s = {
        settings: {
          languageModel: {
            openAI: {
              customModelName: 'model1,model2,model3，model4',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.modelList(s);

      expect(result).toMatchSnapshot();
    });
  });

  // describe('defaultAgent', () => {
  //   it('should merge DEFAULT_AGENT and s.settings.defaultAgent correctly', () => {
  //     const s: GlobalStore = {
  //       settings: {
  //         defaultAgent: {
  //           config: {
  //             model: 'gpt-3.5-turbo',
  //             maxTokens: 100,
  //           },
  //           meta: {
  //             name: 'Default Agent',
  //             description: 'Default agent for testing',
  //           },
  //         },
  //       },
  //     };
  //
  //     const result = settingsSelectors.defaultAgent(s);
  //
  //     expect(result).toEqual(expected);
  //   });
  // });
  //
  // describe('defaultAgentConfig', () => {
  //   it('should merge DEFAULT_AGENT_CONFIG and defaultAgent(s).config correctly', () => {
  //     const s: GlobalStore = {
  //       settings: {
  //         defaultAgent: {
  //           config: {
  //             model: 'gpt-3.5-turbo',
  //             maxTokens: 100,
  //           },
  //         },
  //       },
  //     };
  //
  //     const result = settingsSelectors.defaultAgentConfig(s);
  //
  //     const defaultAgent = settingsSelectors.defaultAgent(s);
  //     const expected = merge({}, DEFAULT_AGENT_CONFIG, defaultAgent.config);
  //
  //     expect(result).toEqual(expected);
  //   });
  // });
  //
  // describe('defaultAgentMeta', () => {
  //   it('should merge DEFAULT_AGENT_META and defaultAgent(s).meta correctly', () => {
  //     const s: GlobalStore = {
  //       settings: {
  //         defaultAgent: {
  //           meta: {
  //             name: 'Default Agent',
  //             description: 'Default agent for testing',
  //           },
  //         },
  //       },
  //     };
  //
  //     const result = settingsSelectors.defaultAgentMeta(s);
  //
  //     const defaultAgent = settingsSelectors.defaultAgent(s);
  //     const expected = merge({}, DEFAULT_AGENT_META, defaultAgent.meta);
  //
  //     expect(result).toEqual(expected);
  //   });
  // });
  //
  // describe('exportSettings', () => {
  //   it('should remove OPENAI_API_KEY and password fields from s.settings', () => {
  //     const s: GlobalStore = {
  //       settings: {
  //         OPENAI_API_KEY: 'openai-api-key',
  //         password: 'password123',
  //         avatar: 'avatar.jpg',
  //         fontSize: 14,
  //         language: 'en',
  //         neutralColor: 'white',
  //         primaryColor: 'blue',
  //         themeMode: 'light',
  //         defaultAgent: {
  //           config: {
  //             model: 'gpt-3.5-turbo',
  //             maxTokens: 100,
  //           },
  //           meta: {
  //             name: 'Default Agent',
  //             description: 'Default agent for testing',
  //           },
  //         },
  //         languageModel: {
  //           azureOpenAI: {
  //             AZURE_API_KEY: 'azure-api-key',
  //             apiVersion: 'v1',
  //             endpoint: 'https://azure-openai-endpoint.com',
  //             models: ['gpt-3.5-turbo'],
  //           },
  //           openAI: {
  //             OPENAI_API_KEY: 'openai-api-key',
  //             endpoint: 'https://openai-endpoint.com',
  //             models: ['gpt-3.5-turbo'],
  //           },
  //         },
  //       },
  //     };
  //
  //     const result = settingsSelectors.exportSettings(s);
  //
  //     const expected = {
  //       avatar: 'avatar.jpg',
  //       fontSize: 14,
  //       language: 'en',
  //       neutralColor: 'white',
  //       primaryColor: 'blue',
  //       themeMode: 'light',
  //       defaultAgent: {
  //         config: {
  //           model: 'gpt-3.5-turbo',
  //           maxTokens: 100,
  //         },
  //         meta: {
  //           name: 'Default Agent',
  //           description: 'Default agent for testing',
  //         },
  //       },
  //       languageModel: {
  //         azureOpenAI: {
  //           AZURE_API_KEY: 'azure-api-key',
  //           apiVersion: 'v1',
  //           endpoint: 'https://azure-openai-endpoint.com',
  //           models: ['gpt-3.5-turbo'],
  //         },
  //         openAI: {
  //           endpoint: 'https://openai-endpoint.com',
  //           models: ['gpt-3.5-turbo'],
  //         },
  //       },
  //     };
  //
  //     expect(result).toEqual(expected);
  //   });
  //
  //   it('should return the result as GlobalSettings type', () => {
  //     const s: GlobalStore = {
  //       settings: {
  //         avatar: 'avatar.jpg',
  //         fontSize: 14,
  //         language: 'en',
  //         neutralColor: 'white',
  //         password: 'password123',
  //         primaryColor: 'blue',
  //         themeMode: 'light',
  //         defaultAgent: {
  //           config: {
  //             model: 'gpt-3.5-turbo',
  //             maxTokens: 100,
  //           },
  //           meta: {
  //             name: 'Default Agent',
  //             description: 'Default agent for testing',
  //           },
  //         },
  //         languageModel: {
  //           azureOpenAI: {
  //             AZURE_API_KEY: 'azure-api-key',
  //             apiVersion: 'v1',
  //             endpoint: 'https://azure-openai-endpoint.com',
  //             models: ['gpt-3.5-turbo'],
  //           },
  //           openAI: {
  //             OPENAI_API_KEY: 'openai-api-key',
  //             endpoint: 'https://openai-endpoint.com',
  //             models: ['gpt-3.5-turbo'],
  //           },
  //         },
  //       },
  //     };
  //
  //     const result = settingsSelectors.exportSettings(s);
  //
  //     expect(result).toBeInstanceOf(GlobalSettings);
  //   });
  // });
});
