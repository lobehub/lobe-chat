import { UserStore } from '../../../store';
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
              model: 'gpt-3.5-turbo',
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
      } as unknown as UserStore;

      const result = settingsSelectors.currentSettings(s);

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
              model: 'gpt-3.5-turbo',
            },
            meta: {
              avatar: 'agent-avatar.jpg',
              description: 'Test agent',
            },
          },
        },
      } as unknown as UserStore;

      const result = settingsSelectors.defaultAgent(s);

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
      } as unknown as UserStore;

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
      } as unknown as UserStore;

      const result = settingsSelectors.currentTTS(s);

      expect(result).toMatchSnapshot();
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
      } as unknown as UserStore;

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
      } as unknown as UserStore;

      const result = settingsSelectors.isDalleAutoGenerating(s);

      expect(result).toBe(true);
    });
  });
});
