import { describe } from 'vitest';

import { MigrationData, VersionController } from '@/migrations/VersionController';

import { MigrationV1ToV2 } from '../FromV1ToV2';
import inputV1Data from '../FromV1ToV2/fixtures/input-v1-session.json';
import { MigrationV2ToV3 } from '../FromV2ToV3';
import { MigrationV3ToV4 } from '../FromV3ToV4';
import outputDataFromV1ToV5 from './fixtures/from-v1-to-v5-output.json';
import functionInputV4 from './fixtures/function-input-v4.json';
import functionOutputV5 from './fixtures/function-output-v5.json';
import { MigrationV4ToV5 } from './index';

describe('MigrationV4ToV5', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [MigrationV4ToV5];
    versionController = new VersionController(migrations, 5);
  });

  describe('should migrate data correctly from previous versions', () => {
    it('role=function', () => {
      const data: MigrationData = functionInputV4;

      const migratedData = versionController.migrate(data);

      expect(migratedData.version).toEqual(functionOutputV5.version);
      expect(migratedData.state.messages).toEqual(functionOutputV5.state.messages);
    });
  });

  it('should work correct from v1 to v5', () => {
    const data: MigrationData = inputV1Data;

    versionController = new VersionController(
      [MigrationV4ToV5, MigrationV3ToV4, MigrationV2ToV3, MigrationV1ToV2],
      5,
    );

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputDataFromV1ToV5.version);
    expect(migratedData.state.messages).toEqual(outputDataFromV1ToV5.state.messages);
    expect(migratedData.state.sessions).toEqual(outputDataFromV1ToV5.state.sessions);
    expect(migratedData.state.topics).toEqual(outputDataFromV1ToV5.state.topics);
  });
});
