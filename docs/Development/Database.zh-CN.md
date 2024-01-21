以 sessionGroup 的实现为例：[✨ feat: add session group manager](https://github.com/lobehub/lobe-chat/pull/1055) . 介绍完整实现流程。


## 数据库部分：


定义一个新的 sessionGroup 表，分 4 步：

1. 建立数据模型 schema

schema/sessionGroup.ts

```ts
import { z } from 'zod';

export const DB_SessionGroupSchema = z.object({
  name: z.string(),
  sort: z.number(),
});

export type DB_SessionGroup = z.infer<typeof DB_SessionGroupSchema>;

```

2. 创建数据库索引

```diff
// ************************************** //
// ******* Version 1 - 2023-11-14 ******* //
// ************************************** //
// - Initial database schema with `files` table

export const dbSchemaV1 = {
  files: '&id, name, fileType, saveMode',
};

// ************************************** //
// ******* Version 2 - 2023-11-27 ******* //
// ************************************** //
// - Added `sessions` 、`messages` 、`topics` tables
// - Added `createdAt` and `updatedAt` fields to all
export const dbSchemaV2 = {
  files: '&id, name, fileType, saveMode, createdAt, updatedAt, messageId, sessionId',

  messages:
    '&id, role, content, fromModel, favorite, plugin.identifier, plugin.apiName, translate.content, createdAt, updatedAt, sessionId, topicId, quotaId, parentId, [sessionId+topicId]',
  sessions: '&id, type, group, meta.title, meta.description, meta.tags, createdAt, updatedAt',
  topics: '&id, title, favorite, createdAt, updatedAt, sessionId',
};

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
+  ...dbSchemaV3,
+  sessionGroups: '&id, name, sort, createdAt, updatedAt',
};

```

3. 在 db 中加入 sessionGroups 表

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
+  public sessionGroups: LobeDBTable<'sessionGroups'>;

  constructor() {
    super('LOBE_CHAT_DB');
    this.version(1).stores(dbSchemaV1);
    this.version(2).stores(dbSchemaV2);
    this.version(3).stores(dbSchemaV3);
+    this.version(4).stores(dbSchemaV4);

    this.files = this.table('files');
    this.sessions = this.table('sessions');
    this.messages = this.table('messages');
    this.topics = this.table('topics');
    this.plugins = this.table('plugins');
+    this.sessionGroups = this.table('sessionGroups');
  }
}
```

5. 定义 Model

model/sessionGroup.ts

```ts
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

  async update(id: string, data: Partial<DB_SessionGroup>) {
    return super._update(id, data);
  }
}

export const SessionModel = new _SessionGroupModel();
```

6. 按需在 Model 中实现功能逻辑
