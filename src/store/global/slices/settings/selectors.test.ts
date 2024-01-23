import { LanguageModel } from '@/types/llm';

import { GlobalStore } from '../../store';
import { settingsSelectors } from './selectors';

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
        serverConfig: {
          customModelName:
            '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo,gpt-4-1106-preview=gpt-4-32k',
        },
        settings: {
          languageModel: {
            openAI: {},
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.modelList(s);

      expect(result).toMatchSnapshot();
    });

    it('duplicate naming model', () => {
      const s = {
        serverConfig: {},
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

    it('should delete model', () => {
      const s = {
        serverConfig: {
          customModelName: '-gpt-4',
        },
        settings: {
          languageModel: {
            openAI: {},
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.modelList(s);

      expect(result).toEqual([
        {
          displayName: 'gpt-3.5-turbo',
          name: 'gpt-3.5-turbo',
        },
        {
          displayName: 'gpt-3.5-turbo-1106',
          name: 'gpt-3.5-turbo-1106',
        },
        {
          displayName: 'gpt-3.5-turbo-16k',
          name: 'gpt-3.5-turbo-16k',
        },
        {
          displayName: 'gpt-4-32k',
          name: 'gpt-4-32k',
        },
        {
          displayName: 'gpt-4-1106-preview',
          name: 'gpt-4-1106-preview',
        },
        {
          displayName: 'gpt-4-vision-preview',
          name: 'gpt-4-vision-preview',
        },
      ]);
    });

    it('only add the model', () => {
      const s = {
        serverConfig: {},
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
  describe('defaultAgent', () => {
    it('should merge DEFAULT_AGENT and s.settings.defaultAgent correctly', () => {
      const s = {
        settings: {
          defaultAgent: {
            config: {
              systemRole: 'user',
              model: LanguageModel.GPT3_5,
            },
            meta: {
              avatar: 'agent-avatar.jpg',
              description: 'Test agent',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.defaultAgent(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('defaultAgentConfig', () => {
    it('should merge DEFAULT_AGENT_CONFIG and defaultAgent(s).config correctly', () => {
      const s = {
        settings: {
          defaultAgent: {
            config: {
              systemRole: 'user',
              model: LanguageModel.GPT3_5,
              params: {
                temperature: 0.7,
              },
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.defaultAgentConfig(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('defaultAgentMeta', () => {
    it('should merge DEFAULT_AGENT_META and defaultAgent(s).meta correctly', () => {
      const s = {
        settings: {
          defaultAgent: {
            meta: {
              avatar: 'agent-avatar.jpg',
              description: 'Test agent',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.defaultAgentMeta(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('currentTTS', () => {
    it('should merge DEFAULT_TTS_CONFIG and s.settings.tts correctly', () => {
      const s = {
        settings: {
          tts: {
            sttAutoStop: false,
            openAI: {
              sttModel: 'whisper-2',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.currentTTS(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('currentLanguage', () => {
    it('should return the correct language setting', () => {
      const s = {
        settings: {
          language: 'fr',
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.currentLanguage(s);

      expect(result).toBe('fr');
    });
  });

  describe('dalleConfig', () => {
    it('should return the dalle configuration', () => {
      const s = {
        settings: {
          tool: {
            dalle: {
              apiKey: 'dalle-api-key',
              autoGenerate: true,
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.dalleConfig(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('isDalleAutoGenerating', () => {
    it('should return the autoGenerate flag from dalle configuration', () => {
      const s = {
        settings: {
          tool: {
            dalle: {
              autoGenerate: true,
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.isDalleAutoGenerating(s);

      expect(result).toBe(true);
    });
  });
});
