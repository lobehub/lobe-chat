# Complete Guide to LobeChat Feature Development

This document aims to guide developers on how to develop a complete feature requirement in LobeChat.

We will use the implementation of sessionGroup as an example: [✨ feat: add session group manager](https://github.com/lobehub/lobe-chat/pull/1055), and explain the complete implementation process through the following six main sections:

1. [Data Model / Database Definition](#1-data-model--database-definition)
2. [Service Implementation / Model Implementation](#2-service-implementation--model-implementation)
3. [Frontend Data Flow Store Implementation](#3-frontend-data-flow-store-implementation)
4. [UI Implementation and Action Binding](#4-ui-implementation-and-action-binding)
5. [Data Migration](#5-data-migration)
6. [Data Import and Export](#6-data-import-and-export)

## 1. Data Model / Database Definition

To implement the Session Group feature, it is necessary to define the relevant data model and indexes at the database level.

Define a new sessionGroup table in 3 steps:

### 1. Establish Data Model Schema

Define the data model of `DB_SessionGroup` in `src/database/schema/sessionGroup.ts`:

```typescript
import { z } from 'zod';

export const DB_SessionGroupSchema = z.object({
  name: z.string(),
  sort: z.number().optional(),
});

export type DB_SessionGroup = z.infer<typeof DB_SessionGroupSchema>;
```

### 2. Create Database Indexes

Since a new table needs to be added, an index needs to be added to the database schema for the `sessionGroup` table.

Add `dbSchemaV4` in `src/database/core/schema.ts`:

```diff
// ... previous implementations

// ************************************** //
// ******* Version 3 - 2023-12-06 ******* //
// ************************************** //
// - Added `plugin` table

export const dbSchemaV3 = {
  ...dbSchemaV2,
  plugins:
    '&identifier, type, manifest.type, manifest.meta.title, manifest.meta.description, manifest.meta.author, createdAt, updatedAt',
};

+ // ************************************** //
+ // ******* Version 4 - 2024-01-21 ******* //
+ // ************************************** //
+ // - Added `sessionGroup` table

+ export const dbSchemaV4 = {
+   ...dbSchemaV3,
+   sessionGroups: '&id, name, sort, createdAt, updatedAt',
+   sessions: '&id, type, group, pinned, meta.title, meta.description, meta.tags, createdAt, updatedAt',
};
```

> \[!Note]
>
> In addition to `sessionGroups`, the definition of `sessions` has also been modified here due to data migration. However, as this section only focuses on schema definition and does not delve into the implementation of data migration, please refer to section five for details.

> \[!Important]
>
> If you are unfamiliar with the need to create indexes here and the syntax of schema definition, you may need to familiarize yourself with the basics of Dexie.js. You can refer to the [📘 Local Database](./Local-Database.zh-CN) section for relevant information.

### 3. Add the sessionGroups Table to the Local DB

Extend the local database class to include the new `sessionGroups` table:

```diff

import { dbSchemaV1, dbSchemaV2, dbSchemaV3, dbSchemaV4 } from './schemas';

interface LobeDBSchemaMap {
  files: DB_File;
  messages: DB_Message;
  plugins: DB_Plugin;
+ sessionGroups: DB_SessionGroup;
  sessions: DB_Session;
  topics: DB_Topic;
}

// Define a local DB
export class LocalDB extends Dexie {
  public files: LobeDBTable<'files'>;
  public sessions: LobeDBTable<'sessions'>;
  public messages: LobeDBTable<'messages'>;
  public topics: LobeDBTable<'topics'>;
  public plugins: LobeDBTable<'plugins'>;
+ public sessionGroups: LobeDBTable<'sessionGroups'>;

  constructor() {
    super(LOBE_CHAT_LOCAL_DB_NAME);
    this.version(1).stores(dbSchemaV1);
    this.version(2).stores(dbSchemaV2);
    this.version(3).stores(dbSchemaV3);
+   this.version(4).stores(dbSchemaV4);

    this.files = this.table('files');
    this.sessions = this.table('sessions');
    this.messages = this.table('messages');
    this.topics = this.table('topics');
    this.plugins = this.table('plugins');
+   this.sessionGroups = this.table('sessionGroups');
  }
}
```

As a result, you can now view the `sessionGroups` table in the `LOBE_CHAT_DB` in `Application` -> `Storage` -> `IndexedDB`.

![](https://github.com/lobehub/lobe-chat/assets/28616219/aea50f66-4060-4a32-88c8-b3c672d05be8)

## 2. Service Implementation / Model Implementation

### Define Model

When building the LobeChat application, the Model is responsible for interacting with the database. It defines how to read, insert, update, and delete data from the database, as well as defining specific business logic.

In `src/database/model/sessionGroup.ts`, the `SessionGroupModel` is defined as follows:

```typescript
import { BaseModel } from '@/database/client/core';
import { DB_SessionGroup, DB_SessionGroupSchema } from '@/database/client/schemas/sessionGroup';
import { nanoid } from '@/utils/uuid';

class _SessionGroupModel extends BaseModel {
  constructor() {
    super('sessions', DB_SessionGroupSchema);
  }

  async create(name: string, sort?: number, id = nanoid()) {
    return this._add({ name, sort }, id);
  }

  // ... Implementation of other CRUD methods
}

export const SessionGroupModel = new _SessionGroupModel();
```

### Service Implementation

In LobeChat, the Service layer is mainly responsible for communicating with the backend service, encapsulating business logic, and providing data to other layers in the frontend. `SessionService` is a service class specifically handling business logic related to sessions. It encapsulates operations such as creating sessions, querying sessions, and updating sessions.

To maintain code maintainability and extensibility, we place the logic related to session grouping in the `SessionService`. This helps to keep the business logic of the session domain cohesive. When business requirements increase or change, it becomes easier to modify and extend within this domain.

`SessionService` implements session group-related request logic by calling methods from `SessionGroupModel`. The following is the implementation of Session Group-related request logic in `sessionService`:

```typescript
class SessionService {
  // ... Omitted session business logic

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  async createSessionGroup(name: string, sort?: number) {
    const item = await SessionGroupModel.create(name, sort);
    if (!item) {
      throw new Error('session group create Error');
    }

    return item.id;
  }

  // ... Other SessionGroup related implementations
}
```

## 3. Frontend Data Flow Store Implementation

In the LobeChat application, the Store module is used to manage the frontend state of the application. The Actions within it are functions that trigger state updates, usually by calling methods in the service layer to perform actual data processing operations and then updating the state in the Store. We use `zustand` as the underlying dependency for the Store module. For a detailed practical introduction to state management, you can refer to [📘 Best Practices for State Management](../State-Management/State-Management-Intro.zh-CN.md).

### sessionGroup CRUD

CRUD operations for session groups are the core behaviors for managing session group data. In `src/store/session/slice/sessionGroup`, we will implement the state logic related to session groups, including adding, deleting, updating session groups, and their sorting.

The following are the methods of the `SessionGroupAction` interface that need to be implemented in the `action.ts` file:

```ts
export interface SessionGroupAction {
  // Add session group
  addSessionGroup: (name: string) => Promise<string>;
  // Remove session group
  removeSessionGroup: (id: string) => Promise<void>;
  // Update session group ID for a session
  updateSessionGroupId: (sessionId: string, groupId: string) => Promise<void>;
  // Update session group name
  updateSessionGroupName: (id: string, name: string) => Promise<void>;
  // Update session group sorting
  updateSessionGroupSort: (items: SessionGroupItem[]) => Promise<void>;
}
```

Taking the `addSessionGroup` method as an example, we first call the `createSessionGroup` method of `sessionService` to create a new session group, and then use the `refreshSessions` method to refresh the sessions state:

```ts
export const createSessionGroupSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionGroupAction
> = (set, get) => ({
  // Implement the logic for adding a session group
  addSessionGroup: async (name) => {
    // Call the createSessionGroup method in the service layer and pass in the session group name
    const id = await sessionService.createSessionGroup(name);
    // Call the get method to get the current Store state and execute the refreshSessions method to refresh the session data
    await get().refreshSessions();
    // Return the ID of the newly created session group
    return id;
  },
  // ... Other action implementations
});
```

With the above implementation, we can ensure that after adding a new session group, the application's state will be updated in a timely manner, and the relevant components will receive the latest state and re-render. This approach improves the predictability and maintainability of the data flow, while also simplifying communication between components.

### Sessions Group Logic Refactoring

This requirement involves upgrading the Sessions feature to transform it from a single list to three different groups: `pinnedSessions` (pinned list), `customSessionGroups` (custom groups), and `defaultSessions` (default list).

To handle these groups, we need to refactor the implementation logic of `useFetchSessions`. Here are the key changes:

1. Use the `sessionService.getGroupedSessions` method to call the backend API and retrieve the grouped session data.
2. Save the retrieved data into three different state fields: `pinnedSessions`, `customSessionGroups`, and `defaultSessions`.

#### `useFetchSessions` Method

This method is defined in `createSessionSlice` as follows:

```typescript
export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  // ... other methods
  useFetchSessions: () =>
    useSWR<ChatSessionList>(FETCH_SESSIONS_KEY, sessionService.getGroupedSessions, {
      onSuccess: (data) => {
        set(
          {
            customSessionGroups: data.customGroup,
            defaultSessions: data.default,
            isSessionsFirstFetchFinished: true,
            pinnedSessions: data.pinned,
            sessions: data.all,
          },
          false,
          n('useFetchSessions/onSuccess', data),
        );
      },
    }),
});
```

After successfully retrieving the data, we use the `set` method to update the `customSessionGroups`, `defaultSessions`, `pinnedSessions`, and `sessions` states. This ensures that the states are synchronized with the latest session data.

#### `sessionService.getGroupedSessions` Method

The `sessionService.getGroupedSessions` method is responsible for calling the backend API `SessionModel.queryWithGroups()`.

```typescript
class SessionService {
  // ... other SessionGroup related implementations

  async getGroupedSessions(): Promise<ChatSessionList> {
    return SessionModel.queryWithGroups();
  }
}
```

#### `SessionModel.queryWithGroups` Method

This method is the core method called by `sessionService.getGroupedSessions`, and it is responsible for querying and organizing session data. The code is as follows:

```typescript
class _SessionModel extends BaseModel {
  // ... other methods

  /**
   * Query session data and categorize sessions based on groups.
   * @returns {Promise<ChatSessionList>} An object containing all sessions and categorized session lists.
   */
  async queryWithGroups(): Promise<ChatSessionList> {
    // Query session group data
    const groups = await SessionGroupModel.query();
    // Query custom session groups based on session group IDs
    const customGroups = await this.queryByGroupIds(groups.map((item) => item.id));
    // Query default session list
    const defaultItems = await this.querySessionsByGroupId(SessionDefaultGroup.Default);
    // Query pinned sessions
    const pinnedItems = await this.getPinnedSessions();

    // Query all sessions
    const all = await this.query();
    // Combine and return all sessions and their group information
    return {
      all, // Array containing all sessions
      customGroup: groups.map((group) => ({ ...group, children: customGroups[group.id] })), // Custom groups
      default: defaultItems, // Default session list
      pinned: pinnedItems, // Pinned session list
    };
  }
}
```

The `queryWithGroups` method first queries all session groups, then based on the IDs of these groups, it queries custom session groups, as well as default and pinned sessions. Finally, it returns an object containing all sessions and categorized session lists.

### Adjusting sessions selectors

Due to changes in the logic of grouping within sessions, we need to adjust the logic of the `sessions` selectors to ensure they can correctly handle the new data structure.

Original selectors:

```ts
// Default group
const defaultSessions = (s: SessionStore): LobeSessions => s.sessions;

// Pinned group
const pinnedSessionList = (s: SessionStore) =>
  defaultSessions(s).filter((s) => s.group === SessionGroupDefaultKeys.Pinned);

// Unpinned group
const unpinnedSessionList = (s: SessionStore) =>
  defaultSessions(s).filter((s) => s.group === SessionGroupDefaultKeys.Default);
```

Revised:

```ts
const defaultSessions = (s: SessionStore): LobeSessions => s.defaultSessions;
const pinnedSessions = (s: SessionStore): LobeSessions => s.pinnedSessions;
const customSessionGroups = (s: SessionStore): CustomSessionGroup[] => s.customSessionGroups;
```

Since all data retrieval in the UI is implemented using syntax like `useSessionStore(sessionSelectors.defaultSessions)`, we only need to modify the selector implementation of `defaultSessions` to complete the data structure change. The data retrieval code in the UI layer does not need to be changed at all, which can greatly reduce the cost and risk of refactoring.

> !\[Important]
>
> If you are not familiar with the concept and functionality of selectors, you can refer to the section [📘 Data Storage and Retrieval Module](./State-Management-Selectors.en-US) for relevant information.

## 4. UI Implementation and Action Binding

Bind Store Action in the UI component to implement interactive logic, for example `CreateGroupModal`:

```tsx
const CreateGroupModal = () => {
  // ... Other logic

  const [updateSessionGroup, addCustomGroup] = useSessionStore((s) => [
    s.updateSessionGroupId,
    s.addSessionGroup,
  ]);

  return (
    <Modal
      onOk={async () => {
        // ... Other logic
        const groupId = await addCustomGroup(name);
        await updateSessionGroup(sessionId, groupId);
      }}
    >
      {/* ... */}
    </Modal>
  );
};
```

## 5. Data Migration

In the process of software development, data migration is an inevitable issue, especially when the existing data structure cannot meet the new business requirements. For this iteration of SessionGroup, we need to handle the migration of the `group` field in the `session`, which is a typical data migration case.

### Issues with the Old Data Structure

In the old data structure, the `group` field was used to mark whether the session was "pinned" or belonged to a "default" group. However, when support for multiple session groups is needed, the original data structure becomes inflexible.

For example:

```
before   pin:  group = abc
after    pin:  group = pinned
after  unpin:  group = default
```

From the above example, it can be seen that once a session is unpinned from the "pinned" state, the `group` field cannot be restored to its original `abc` value. This is because we do not have a separate field to maintain the pinned state. Therefore, we have introduced a new field `pinned` to indicate whether the session is pinned, while the `group` field will be used solely to identify the session group.

### Migration Strategy

The core logic of this migration is as follows:

- When the user's `group` field is `pinned`, set their `pinned` field to `true`, and set the group to `default`.

However, data migration in LobeChat typically involves two parts: **configuration file migration** and **database migration**. Therefore, the above logic will need to be implemented separately in these two areas.

#### Configuration File Migration

For configuration file migration, we recommend performing it before database migration, as configuration file migration is usually easier to test and validate. LobeChat's file migration configuration is located in the `src/migrations/index.ts` file, which defines the various versions of configuration file migration and their corresponding migration scripts.

```diff
// Current latest version number
- export const CURRENT_CONFIG_VERSION = 2;
+ export const CURRENT_CONFIG_VERSION = 3;

// Historical version upgrade module
const ConfigMigrations = [
+ /**
+ * 2024.01.22
+  * from `group = pinned` to `pinned:true`
+  */
+ MigrationV2ToV3,
  /**
   * 2023.11.27
   * Migrate from single key database to dexie-based relational structure
   */
  MigrationV1ToV2,
  /**
   * 2023.07.11
   * just the first version, Nothing to do
   */
  MigrationV0ToV1,
];
```

The logic for this configuration file migration is defined in `src/migrations/FromV2ToV3/index.ts`, simplified as follows:

```ts
export class MigrationV2ToV3 implements Migration {
  // Specify the version from which to upgrade
  version = 2;

  migrate(data: MigrationData<V2ConfigState>): MigrationData<V3ConfigState> {
    const { sessions } = data.state;

    return {
      ...data,
      state: {
        ...data.state,
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
```

It can be seen that the migration implementation is very simple. However, it is important to ensure the correctness of the migration, so corresponding test cases need to be written in `src/migrations/FromV2ToV3/migrations.test.ts`:

```ts
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
```

```markdown

```

Unit tests require the use of `fixtures` to fix the test data. The test cases include verification logic for two parts: 1) the correctness of a single migration (v2 -> v3) and 2) the correctness of a complete migration (v1 -> v3).

> \[!Important]
>
> The version number in the configuration file may not match the database version number, as database version updates do not always involve changes to the data structure (such as adding tables or fields), while configuration file version updates usually involve data migration.

````

#### Database Migration

Database migration needs to be implemented in the `LocalDB` class, which is defined in the `src/database/core/db.ts` file. The migration process involves adding a new `pinned` field for each record in the `sessions` table and resetting the `group` field:

```diff
export class LocalDB extends Dexie {
  public files: LobeDBTable<'files'>;
  public sessions: LobeDBTable<'sessions'>;
  public messages: LobeDBTable<'messages'>;
  public topics: LobeDBTable<'topics'>;
  public plugins: LobeDBTable<'plugins'>;
  public sessionGroups: LobeDBTable<'sessionGroups'>;

  constructor() {
    super(LOBE_CHAT_LOCAL_DB_NAME);
    this.version(1).stores(dbSchemaV1);
    this.version(2).stores(dbSchemaV2);
    this.version(3).stores(dbSchemaV3);
    this.version(4)
      .stores(dbSchemaV4)
+     .upgrade((trans) => this.upgradeToV4(trans));

    this.files = this.table('files');
    this.sessions = this.table('sessions');
    this.messages = this.table('messages');
    this.topics = this.table('topics');
    this.plugins = this.table('plugins');
    this.sessionGroups = this.table('sessionGroups');
  }

+  /**
+   * 2024.01.22
+   *
+   * DB V3 to V4
+   * from `group = pinned` to `pinned:true`
+   */
+  upgradeToV4 = async (trans: Transaction) => {
+    const sessions = trans.table('sessions');
+    await sessions.toCollection().modify((session) => {
+      // translate boolean to number
+      session.pinned = session.group === 'pinned' ? 1 : 0;
      session.group = 'default';
    });
+  };
}
````

This is our data migration strategy. When performing the migration, it is essential to ensure the correctness of the migration script and validate the migration results through thorough testing.

## 6. Data Import and Export

In LobeChat, the data import and export feature is designed to ensure that users can migrate their data between different devices. This includes session, topic, message, and settings data. In the implementation of the Session Group feature, we also need to handle data import and export to ensure that the complete exported data can be restored exactly the same on other devices.

The core implementation of data import and export is in the `ConfigService` in `src/service/config.ts`, with key methods as follows:

| Method Name           | Description                |
| --------------------- | -------------------------- |
| `importConfigState`   | Import configuration data  |
| `exportAgents`        | Export all agent data      |
| `exportSessions`      | Export all session data    |
| `exportSingleSession` | Export single session data |
| `exportSingleAgent`   | Export single agent data   |
| `exportSettings`      | Export settings data       |
| `exportAll`           | Export all data            |

### Data Export

In LobeChat, when a user chooses to export data, the current session, topic, message, and settings data are packaged into a JSON file and provided for download. The standard structure of this JSON file is as follows:

```json
{
  "exportType": "sessions",
  "state": {
    "sessions": [],
    "topics": [],
    "messages": []
  },
  "version": 3
}
```

Where:

- `exportType`: Identifies the type of data being exported, currently including `sessions`, `agent`, `settings`, and `all`.
- `state`: Stores the actual data, with different data types for different `exportType`.
- `version`: Indicates the data version.

In the implementation of the Session Group feature, we need to add `sessionGroups` data to the `state` field. This way, when users export data, their Session Group data will also be included.

For example, when exporting sessions, the relevant implementation code modification is as follows:

```diff
class ConfigService {
  // ... Other code omitted

  exportSessions = async () => {
    const sessions = await sessionService.getAllSessions();
+   const sessionGroups = await sessionService.getSessionGroups();
    const messages = await messageService.getAllMessages();
    const topics = await topicService.getAllTopics();

-   const config = createConfigFile('sessions', { messages, sessions, topics });
+   const config = createConfigFile('sessions', { messages, sessionGroups, sessions, topics });

    exportConfigFile(config, 'sessions');
  };
}
```

### Data Import

The data import functionality is implemented through `ConfigService.importConfigState`. When users choose to import data, they need to provide a JSON file that conforms to the above structure specification. The `importConfigState` method accepts the data of the configuration file and imports it into the application.

In the implementation of the Session Group feature, we need to handle the `sessionGroups` data during the data import process. This way, when users import data, their Session Group data will also be imported correctly.

The following is the modified code for the import implementation in `importConfigState`:

```diff
class ConfigService {
  // ... Other code omitted

+ importSessionGroups = async (sessionGroups: SessionGroupItem[]) => {
+   return sessionService.batchCreateSessionGroups(sessionGroups);
+ };

  importConfigState = async (config: ConfigFile): Promise<ImportResults | undefined> => {
    switch (config.exportType) {
      case 'settings': {
        await this.importSettings(config.state.settings);

        break;
      }

      case 'agents': {
+       const sessionGroups = await this.importSessionGroups(config.state.sessionGroups);

        const data = await this.importSessions(config.state.sessions);
        return {
+         sessionGroups: this.mapImportResult(sessionGroups),
          sessions: this.mapImportResult(data),
        };
      }

      case 'all': {
        await this.importSettings(config.state.settings);

+       const sessionGroups = await this.importSessionGroups(config.state.sessionGroups);

        const [sessions, messages, topics] = await Promise.all([
          this.importSessions(config.state.sessions),
          this.importMessages(config.state.messages),
          this.importTopics(config.state.topics),
        ]);

        return {
          messages: this.mapImportResult(messages),
+         sessionGroups: this.mapImportResult(sessionGroups),
          sessions: this.mapImportResult(sessions),
          topics: this.mapImportResult(topics),
        };
      }

      case 'sessions': {
+       const sessionGroups = await this.importSessionGroups(config.state.sessionGroups);

        const [sessions, messages, topics] = await Promise.all([
          this.importSessions(config.state.sessions),
          this.importMessages(config.state.messages),
          this.importTopics(config.state.topics),
        ]);

        return {
          messages: this.mapImportResult(messages),
+         sessionGroups: this.mapImportResult(sessionGroups),
          sessions: this.mapImportResult(sessions),
          topics: this.mapImportResult(topics),
        };
      }
    }
  };
}
```

One key point of the above modification is to import sessionGroup first, because if sessions are imported first and the corresponding SessionGroup Id is not found in the current database, the group of this session will default to be modified to the default value. This will prevent the correct association of the sessionGroup's ID with the session.

This is the implementation of the LobeChat Session Group feature in the data import and export process. This approach ensures that users' Session Group data is correctly handled during the import and export process.

## Summary

The above is the complete implementation process of the LobeChat Session Group feature. Developers can refer to this document for the development and testing of related functionalities.
