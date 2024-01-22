import { MigrationData, VersionController } from '@/migrations/VersionController';

import { MigrationV1ToV2 } from '../FromV1ToV2';
import inputV1Data from '../FromV1ToV2/fixtures/input-v1-session.json';
import inputV2Data from './fixtures/input-v2-session.json';
import outputV3DataFromV1 from './fixtures/output-v3-from-v1.json';
import outputV3Data from './fixtures/output-v3.json';
import { MigrationV2ToV3 } from './index';

describe('MigrationV2ToV3', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [MigrationV2ToV3];
    versionController = new VersionController(migrations, 3);
  });

  it('should migrate data correctly through multiple versions', () => {
    const data: MigrationData = inputV2Data;

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputV3Data.version);
    expect(migratedData.state.sessions).toEqual(outputV3Data.state.sessions);
    expect(migratedData.state.topics).toEqual(outputV3Data.state.topics);
    expect(migratedData.state.messages).toEqual(outputV3Data.state.messages);
  });

  it('should work correct from v1 to v3', () => {
    const data: MigrationData = inputV1Data;

    versionController = new VersionController([MigrationV2ToV3, MigrationV1ToV2], 3);

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputV3DataFromV1.version);
    expect(migratedData.state.sessions).toEqual(outputV3DataFromV1.state.sessions);
    expect(migratedData.state.topics).toEqual(outputV3DataFromV1.state.topics);
    expect(migratedData.state.messages).toEqual(outputV3DataFromV1.state.messages);
  });
});
