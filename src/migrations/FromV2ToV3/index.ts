import type { Migration, MigrationData } from '@/migrations/VersionController';

import { V2ConfigState, V2Session } from '../FromV1ToV2/types/v2';
import { V3ConfigState, V3Session } from './types/v3';

export class MigrationV2ToV3 implements Migration {
  // from this version to start migration
  version = 2;

  migrate(data: MigrationData<V2ConfigState>): MigrationData<V3ConfigState> {
    const { sessions } = data.state;

    return {
      ...data,
      state: {
        ...data.state,
        sessionGroups: [],
        sessions: sessions.map((s) => this.migrateSession(s)),
      },
    };
  }

  migrateSession = (session: V2Session): V3Session => {
    return {
      ...session,
      group: 'default',
      pinned: session.group === 'pinned',
    };
  };
}
