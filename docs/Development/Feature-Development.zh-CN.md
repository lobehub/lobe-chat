# LobeChat 功能开发完全指南

本文档旨在指导开发者了解我们在 LobeChat 中的完整功能实现流程。我们将以 sessionGroup 的实现为例：[✨ feat: add session group manager](https://github.com/lobehub/lobe-chat/pull/1055) . 介绍完整实现流程。

本文通过以下五个主要部分来阐述完整的实现流程：

1. 数据模型 / 数据库定义
2. Service 实现 / Model 实现
3. 前端数据流 Store 实现
4. UI 实现与 action 绑定
5. 数据迁移

## 一、数据库部分

为了实现 Session Group 功能，首先需要在数据库层面定义相关的数据模型和索引。

定义一个新的 sessionGroup 表，分 4 步：

### 1. 建立数据模型 schema

在 `src/database/schema/sessionGroup.ts` 中定义 `DB_SessionGroup` 的数据模型：

```typescript
import { z } from 'zod';

export const DB_SessionGroupSchema = z.object({
  name: z.string(),
  sort: z.number().optional(),
});

export type DB_SessionGroup = z.infer<typeof DB_SessionGroupSchema>;
```

### 2. 创建数据库索引

由于新增了一个表，需要在在数据库 Schema 中，为 `sessionGroup` 表添加索引。

在 `src/database/core/schema.ts` 中添加 `dbSchemaV4`:

```diff
// ... 前面的一些实现

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

### 3. 在 db 中加入 sessionGroups 表

扩展本地核心 DB `LocalDB` 类以包含新的 `sessionGroups` 表：

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

> \[!Note]
>
> 在最后一部分，还包含了数据迁移相关的工作，由于本节只关注 schema 定义，因此不呈现迁移代码。

### 4. 定义 Model

在 `model/sessionGroup.ts` 中定义 `SessionGroupModel`：

```typescript
import { BaseModel } from '@/database/core';
import { DB_SessionGroup, DB_SessionGroupSchema } from '@/database/schemas/sessionGroup';
import { nanoid } from '@/utils/uuid';

class _SessionGroupModel extends BaseModel {
  constructor() {
    super('sessions', DB_SessionGroupSchema);
  }

  async create(name: string, sort?: number, id = nanoid()) {
    return this._add({ name, sort }, id);
  }

  // ... 其他 CRUD 方法的实现
}

export const SessionGroupModel = new _SessionGroupModel();
```

## 二、Service 部分

在 `sessionService` 中实现 Session Group 相关的请求逻辑：

```typescript
class SessionService {
  // ... 省略 session 业务逻辑

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

  // ... 其他 SessionGroup 相关的实现
}
```

把 sessionGroup 的实现放到 sessionService 的考虑是，可以让会话 Session 领域更加内聚。如果未来对 sessionGroup 有了更多的要求，可以考虑再单独拆除。例如 chat 就是从 session 中拆出来的一个独立域。

## 三、Store Action 部分

### sessionGroup CRUD

在 `src/store/session/slice/sessionGroup` 中实现 Session Group 相关的逻辑。

以 `action.ts` 为例，需要实现的方法有：

```ts
export interface SessionGroupAction {
  // 增
  addSessionGroup: (name: string) => Promise<string>;
  // 删
  removeSessionGroup: (id: string) => Promise<void>;
  // 为 session 修改它的 groupId
  updateSessionGroupId: (sessionId: string, groupId: string) => Promise<void>;
  // 改组名
  updateSessionGroupName: (id: string, name: string) => Promise<void>;
  // 改分组排序
  updateSessionGroupSort: (items: SessionGroupItem[]) => Promise<void>;
}
```

以 `addSessionGroup` 为例，在 action 中调用 sessionService，并使用 `refreshSessions` 刷新 sessions 数据：

```ts
export const createSessionGroupSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionGroupAction
> = (set, get) => ({
  addSessionGroup: async (name) => {
    const id = await sessionService.createSessionGroup(name);
    await get().refreshSessions();
    return id;
  },
  // ... 其他 action 实现
});
```

### sessions 分组

由于本次实现，会从单一的 sessions 变成 pinnedSessions、customSessionGroups 和 defaultSessions 三个，请求数据的逻辑也发生了变化：

```ts
export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  // ... 其他方法
  useFetchSessions: () =>
    useSWR<ChatSessionList>(FETCH_SESSIONS_KEY, sessionService.getSessionsWithGroup, {
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

取数逻辑在 `sessionService.getSessionsWithGroup` ，直接调用了 `SessionModel.queryWithGroups()` 实现取数：

```ts
class _SessionModel extends BaseModel {
  // ... 其他方法

  async queryWithGroups(): Promise<ChatSessionList> {
    const groups = await SessionGroupModel.query();
    const customGroups = await this.queryByGroupIds(groups.map((item) => item.id));
    const defaultItems = await this.querySessionsByGroupId(SessionDefaultGroup.Default);
    const pinnedItems = await this.getPinnedSessions();

    const all = await this.query();
    return {
      all,
      customGroup: groups.map((group) => ({
        ...group,
        children: customGroups[group.id],
      })),
      default: defaultItems,
      pinned: pinnedItems,
    };
  }
}
```

## 四、UI 部分

在 UI 组件中绑定 Store Action 实现交互逻辑，例如 `CreateGroupModal`：

```tsx
const CreateGroupModal = () => {
  // ... 其他逻辑

  const [updateSessionGroup, addCustomGroup] = useSessionStore((s) => [
    s.updateSessionGroupId,
    s.addSessionGroup,
  ]);

  return (
    <Modal
      onOk={async () => {
        // ... 其他逻辑
        const groupId = await addCustomGroup(name);
        await updateSessionGroup(sessionId, groupId);
      }}
    >
      {/* ... */}
    </Modal>
  );
};
```

## 五、数据迁移部分

一般的迭代不太需要关心数据迁移问题，而一旦遇到旧的数据结构无法满足新的需求时，就需要考虑数据迁移的问题了。

在本次实现中，session 的 group 字段可以说是典型案例。

之前通过将其标记为 `pinned` 和 `default` 来区分置顶与分组。但是如果存在多个分组时，这种模式就无法满足了。

```
before   pin:  group = abc
after    pin:  group = pinned
after  unpin:  group = default
```

可以看到，如果取消置顶， unpin 之后 group 是无法回到 abc 的，因为没有其他存放这个字段。 因此我们需要一个新的字段 `pinned` 来标记是否置顶，而 `group` 字段则专心用来标记分组。

这样一来，就需要将旧的数据迁移到新的数据结构中，核心的一条迁移逻辑为：

- 当用户的 `group` 字段为 `pinned` 时，将其 `pinned` 字段置为 `true`，同时将 group 设为 `default`;

而数据迁移需要考虑两块：

- 配置文件迁移
- 数据库迁移

我建议优先实现配置文件迁移，后实现数据库迁移。因为配置文件迁移相对数据库迁移更加易于复现与测试。

### 配置文件迁移

LobeChat 的配置文件迁移管理在 `src/migrations/index.ts` 中，

```ts
// 当前最新的版本号
export const CURRENT_CONFIG_VERSION = 3;

// 历史记录版本升级模块
const ConfigMigrations = [
  /**
   * 2024.01.22
   * from `group = pinned` to `pinned:true`
   */
  MigrationV2ToV3,
  /**
   * 2023.11.27
   * 从单 key 数据库转换为基于 dexie 的关系型结构
   */
  MigrationV1ToV2,
  /**
   * 2023.07.11
   * just the first version, Nothing to do
   */
  MigrationV0ToV1,
];
```

同时，配置文件的版本号和数据库版本号不一定完全一致对应，原因是 db 的版本升级可能不一定存在需要数据迁移的情况。（比如新增了一个表，或者新增了一个字段），而配置文件的版本升级则一定存在数据迁移的情况。

本次迁移配置文件的逻辑在 `src/migrations/FromV2ToV3.ts` 中：

```ts
import type { Migration, MigrationData } from '@/migrations/VersionController';

import { V2ConfigState, V2Session } from '../FromV1ToV2/types/v2';
import { V3ConfigState, V3Session } from './types/v3';

export class MigrationV2ToV3 implements Migration {
  // 指定从该版本开始向上升级
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

实现可以看到非常简单。但重要的是，我们需要保证迁移的正确性，因此需要编写测试用例来保证迁移的正确性，测试用例写在 `migrations.test.ts` 中，需要搭配 `fixtures` 来固化测试数据。

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

需要测试：

- 正常的单次迁移（v2 -> v3)
- 完整的迁移 (v1 -> v3)

以上就是 LobeChat Session Group 功能的完整实现流程。开发者可以参考本文档进行相关功能的开发和测试。
