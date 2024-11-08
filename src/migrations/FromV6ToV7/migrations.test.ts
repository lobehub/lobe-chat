import { describe } from 'vitest';

import { MigrationV1ToV2 } from '@/migrations/FromV1ToV2';
import { MigrationV2ToV3 } from '@/migrations/FromV2ToV3';
import { MigrationV3ToV4 } from '@/migrations/FromV3ToV4';
import { MigrationV4ToV5 } from '@/migrations/FromV4ToV5';
import { MigrationV5ToV6 } from '@/migrations/FromV5ToV6';
import { MigrationData, VersionController } from '@/migrations/VersionController';

import inputV1Data from '../FromV1ToV2/fixtures/input-v1-session.json';
import outputV7Data from './fixtures/output-v7-from-v1.json';
import providerInputV6 from './fixtures/provider-input-v6.json';
import providerOutputV7 from './fixtures/provider-output-v7.json';
import { MigrationV6ToV7 } from './index';

describe('MigrationV6ToV7', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [MigrationV6ToV7];
    versionController = new VersionController(migrations, 7);
  });

  describe('should migrate data correctly from previous versions', () => {
    it('provider', () => {
      const data: MigrationData = providerInputV6;

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(providerOutputV7.version);
      expect(migratedData.state.settings.languageModel).toEqual(
        providerOutputV7.state.settings.languageModel,
      );
      expect(migratedData.state.settings.keyVaults).toEqual(
        providerOutputV7.state.settings.keyVaults,
      );
      expect(migratedData.state.settings.general).toEqual(providerOutputV7.state.settings.general);
    });
  });

  it('should work correct from v1 to v7', () => {
    const data: MigrationData = inputV1Data;

    versionController = new VersionController(
      [
        MigrationV6ToV7,
        MigrationV5ToV6,
        MigrationV4ToV5,
        MigrationV3ToV4,
        MigrationV2ToV3,
        MigrationV1ToV2,
      ],
      7,
    );

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputV7Data.version);
    // expect(migratedData.state.sessions).toEqual(outputV3DataFromV1.state.sessions);
    // expect(migratedData.state.topics).toEqual(outputV3DataFromV1.state.topics);
    // expect(migratedData.state.messages).toEqual(outputV3DataFromV1.state.messages);
  });
});
