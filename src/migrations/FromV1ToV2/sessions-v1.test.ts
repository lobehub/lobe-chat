import { MigrationData, VersionController } from '@/utils/VersionController';

import inputV1Data from './fixtures/input-v1-session.json';
import outputV2Data from './fixtures/output-v2.json';
import { MigrationV1ToV2 } from './index';

console.log(inputV1Data);

describe('MigrationV1ToV2', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [MigrationV1ToV2];
    versionController = new VersionController(migrations, 2);
  });

  it('should migrate data correctly through multiple versions', () => {
    const data: MigrationData = inputV1Data;

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputV2Data.version);
    expect(migratedData.state.sessions).toEqual(outputV2Data.state.sessions);
    expect(migratedData.state.topics).toEqual(outputV2Data.state.topics);
    expect(migratedData.state.messages).toEqual(outputV2Data.state.messages);
  });
});
