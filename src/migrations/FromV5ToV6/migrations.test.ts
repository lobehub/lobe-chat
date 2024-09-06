import { describe } from 'vitest';

import { MigrationData, VersionController } from '@/migrations/VersionController';

import { MigrationV1ToV2 } from '../FromV1ToV2';
import inputV1Data from '../FromV1ToV2/fixtures/input-v1-session.json';
import { MigrationV2ToV3 } from '../FromV2ToV3';
import { MigrationV3ToV4 } from '../FromV3ToV4';
import { MigrationV4ToV5 } from '../FromV4ToV5';
import outputDataFromV1ToV6 from './fixtures/from-v1-to-v6-output.json';
import sessionInputV5 from './fixtures/session-input-v5.json';
import sessionOutputV6 from './fixtures/session-output-v6.json';
import { MigrationV5ToV6 } from './index';

describe('MigrationV5ToV6', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [MigrationV5ToV6];
    versionController = new VersionController(migrations, 6);
  });

  describe('should migrate data correctly from previous versions', () => {
    it('session config', () => {
      const data: MigrationData = sessionInputV5;

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(sessionOutputV6.version);
      expect(migratedData.state.sessions).toEqual(sessionOutputV6.state.sessions);
    });
  });

  it('should work correct from v1 to v6', () => {
    const data: MigrationData = inputV1Data;

    versionController = new VersionController(
      [MigrationV5ToV6, MigrationV4ToV5, MigrationV3ToV4, MigrationV2ToV3, MigrationV1ToV2],
      6,
    );

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputDataFromV1ToV6.version);
    expect(migratedData.state.messages).toEqual(outputDataFromV1ToV6.state.messages);
    expect(migratedData.state.sessions).toEqual(outputDataFromV1ToV6.state.sessions);
    expect(migratedData.state.topics).toEqual(outputDataFromV1ToV6.state.topics);
  });
});
