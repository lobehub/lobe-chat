import { describe } from 'vitest';

import { MigrationData, VersionController } from '@/migrations/VersionController';

import { MigrationV1ToV2 } from '../FromV1ToV2';
import inputV1Data from '../FromV1ToV2/fixtures/input-v1-session.json';
import { MigrationV2ToV3 } from '../FromV2ToV3';
import openaiInputV3 from './fixtures/openai-input-v3.json';
import openaiOutputV4 from './fixtures/openai-output-v4.json';
import outputV3DataFromV1 from './fixtures/output-v3-from-v1.json';
import { MigrationV3ToV4 } from './index';

describe('MigrationV2ToV3', () => {
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
      expect(migratedData.state.settings).toEqual(openaiOutputV4.state.settings);
    });
  });

  it.skip('should work correct from v1 to v4', () => {
    const data: MigrationData = inputV1Data;

    versionController = new VersionController([MigrationV2ToV3, MigrationV1ToV2], 3);

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputV3DataFromV1.version);
    expect(migratedData.state.sessions).toEqual(outputV3DataFromV1.state.sessions);
    expect(migratedData.state.topics).toEqual(outputV3DataFromV1.state.topics);
    expect(migratedData.state.messages).toEqual(outputV3DataFromV1.state.messages);
  });
});
