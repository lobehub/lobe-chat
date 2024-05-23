import { Migration, MigrationData, VersionController } from './VersionController';

class TestMigration0 implements Migration {
  version = 0;

  migrate(data: MigrationData): MigrationData {
    return data;
  }
}
class TestMigration1 implements Migration {
  version = 1;

  migrate(data: MigrationData): MigrationData {
    return {
      state: {
        ...data.state,
        value1: data.state.value * 2,
      },
      version: this.version,
    };
  }
}

class TestMigration2 implements Migration {
  version = 2;

  migrate(data: MigrationData): MigrationData {
    return {
      state: {
        ...data.state,
        value2: data.state.value1 * 2,
      },
      version: this.version,
    };
  }
}

class TestMigration3 implements Migration {
  version = 3;

  migrate(data: MigrationData): MigrationData {
    // Simulate a migration that ensures no data loss during multiple version jumps
    if (!data.state.hasOwnProperty('value3')) {
      data.state.value3 = data.state.value2 + 100;
    }
    return {
      state: data.state,
      version: this.version,
    };
  }
}

describe('VersionController', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [TestMigration0, TestMigration1, TestMigration2, TestMigration3];
    versionController = new VersionController(migrations);
  });

  it('should instantiate with sorted migrations', () => {
    expect(versionController['migrations'][0].version).toBe(0);
    expect(versionController['migrations'][1].version).toBe(1);
    expect(versionController['migrations'][2].version).toBe(2);
    expect(versionController['migrations'][3].version).toBe(3);
  });

  it('should throw error if data version is undefined', () => {
    const data = {
      state: { value: 10 },
    };

    expect(() => versionController.migrate(data as any)).toThrow();
  });

  it('should migrate data correctly through multiple versions', () => {
    const data: MigrationData = {
      state: { value: 10 },
      version: 0,
    };

    const migratedData = versionController.migrate(data);

    expect(migratedData).toEqual({
      state: { value: 10, value1: 20, value2: 40, value3: 140 },
      version: 4,
    });
  });

  it('should migrate data correctly if starting from a specific version', () => {
    const data: MigrationData = {
      state: { value: 10, value1: 20 },
      version: 1,
    };

    const migratedData = versionController.migrate(data);

    expect(migratedData).toEqual({
      state: { value: 10, value1: 20, value2: 40, value3: 140 },
      version: 4,
    });
  });

  it('should test migration paths for multiple version jumps to ensure no data loss', () => {
    const data: MigrationData = {
      state: { value: 10 },
      version: 0,
    };

    const migratedData = versionController.migrate(data);

    expect(migratedData.state).toHaveProperty('value3');
    expect(migratedData.version).toBe(4);
  });
});
