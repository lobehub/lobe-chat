import { describe } from 'vitest';

import { MigrationData, VersionController } from '@/migrations/VersionController';

import { MigrationV1ToV2 } from '../FromV1ToV2';
import inputV1Data from '../FromV1ToV2/fixtures/input-v1-session.json';
import { MigrationV2ToV3 } from '../FromV2ToV3';
import azureInputV3 from './fixtures/azure-input-v3.json';
import azureOutputV4 from './fixtures/azure-output-v4.json';
import ollamaInputV3 from './fixtures/ollama-input-v3.json';
import ollamaOutputV4 from './fixtures/ollama-output-v4.json';
import openaiInputV3 from './fixtures/openai-input-v3.json';
import openaiOutputV4 from './fixtures/openai-output-v4.json';
import openrouterInputV3 from './fixtures/openrouter-input-v3.json';
import openrouterOutputV4 from './fixtures/openrouter-output-v4.json';
import outputV4Data from './fixtures/output-v4-from-v1.json';
import { MigrationV3ToV4 } from './index';

describe('MigrationV3ToV4', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [MigrationV3ToV4];
    versionController = new VersionController(migrations, 4);
  });

  describe('should migrate data correctly from previous versions', () => {
    it('openai', () => {
      const data: MigrationData = openaiInputV3;

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(openaiOutputV4.version);
      expect(migratedData.state.settings.languageModel).toEqual(
        openaiOutputV4.state.settings.languageModel,
      );
    });

    it('azure', () => {
      const data: MigrationData = azureInputV3;

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(azureOutputV4.version);
      expect(migratedData.state.settings.languageModel).toEqual(
        azureOutputV4.state.settings.languageModel,
      );
    });

    it('openrouter', () => {
      const data: MigrationData = openrouterInputV3;

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(openrouterOutputV4.version);
      expect(migratedData.state.settings.languageModel).toEqual(
        openrouterOutputV4.state.settings.languageModel,
      );
    });

    it('ollama', () => {
      const data: MigrationData = ollamaInputV3;

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(ollamaOutputV4.version);
      expect(migratedData.state.settings.languageModel).toEqual(
        ollamaOutputV4.state.settings.languageModel,
      );
    });
  });

  it('should work correct from v1 to v4', () => {
    const data: MigrationData = inputV1Data;

    versionController = new VersionController(
      [MigrationV3ToV4, MigrationV2ToV3, MigrationV1ToV2],
      4,
    );

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputV4Data.version);
    // expect(migratedData.state.sessions).toEqual(outputV3DataFromV1.state.sessions);
    // expect(migratedData.state.topics).toEqual(outputV3DataFromV1.state.topics);
    // expect(migratedData.state.messages).toEqual(outputV3DataFromV1.state.messages);
  });

  describe('Edge Case', () => {
    it('should handle undefined settings or languageModel', () => {
      const data: MigrationData = {
        version: 3,
        state: {
          // settings undefined
        },
      };

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(4);
      expect(migratedData.state.settings).toBeUndefined();
    });

    it('should handle undefined languageModel', () => {
      const data: MigrationData = {
        version: 3,
        state: {
          settings: {
            // languageModel undefined
          },
        },
      };

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(4);
      expect(migratedData.state.settings.languageModel).toBeUndefined();
    });

    it('should handle missing provider configurations', () => {
      const data: MigrationData = {
        version: 3,
        state: {
          settings: {
            languageModel: {
              // missing togetherai、openrouter 、 ollama
              openAI: {
                // openAI
              },
            },
          },
        },
      };

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(4);
      expect(migratedData.state.settings.languageModel.togetherai).toBeUndefined();
      expect(migratedData.state.settings.languageModel.openrouter).toBeUndefined();
      expect(migratedData.state.settings.languageModel.ollama).toBeUndefined();
    });

    it('should success for invalid data format', () => {
      const data: MigrationData = {
        version: 3,
        state: {
          settings: {
            languageModel: {
              openAI: 'invalid-config', // 错误的配置格式
            },
          },
        },
      };

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(4);
      expect(migratedData.state.settings.languageModel.openai).toEqual({ enabled: true });
      expect(migratedData.state.settings.languageModel.togetherai).toBeUndefined();
      expect(migratedData.state.settings.languageModel.openrouter).toBeUndefined();
      expect(migratedData.state.settings.languageModel.ollama).toBeUndefined();
    });

    it('should handle empty strings and empty objects', () => {
      const data: MigrationData = {
        version: 3,
        state: {
          settings: {
            languageModel: {
              openAI: undefined,
              togetherai: {
                apiKey: '',
                endpoint: '',
                customModelName: '',
              },
            },
          },
        },
      };

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(4);
      expect(migratedData.state.settings.languageModel.openai).toEqual({
        apiKey: '',
        enabled: true,
      });

      expect(migratedData.state.settings.languageModel.togetherai.apiKey).toEqual('');
      expect(migratedData.state.settings.languageModel.togetherai.endpoint).toEqual('');
      expect(migratedData.state.settings.languageModel.togetherai.customModelCards).toBeUndefined();
    });
  });
});
