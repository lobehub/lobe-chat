import {
  ImportMessage,
  ImportSession,
  ImportSessionGroup,
  ImportTopic,
  ImporterEntryData,
} from '@/types/importer';

interface V2DB_File {
  /**
   * create Time
   */
  createdAt: number;
  /**
   * file data array buffer
   */
  data: ArrayBuffer;
  /**
   * file type
   * @example 'image/png'
   */
  fileType: string;
  id: string;
  metadata: any;
  /**
   * file name
   * @example 'test.png'
   */
  name: string;
  /**
   * the mode database save the file
   * local mean save the raw file into data
   * url mean upload the file to a cdn and then save the url
   */
  saveMode: 'local' | 'url';
  /**
   * file size
   */
  size: number;
  /**
   * file url if saveMode is url
   */
  url: string;
}

interface V2DB_MESSAGE {
  content: string;
  createdAt: number;
  error?: any;
  favorite: 0 | 1;
  files?: string[];
  fromModel?: string;
  fromProvider?: string;
  id: string;
  observationId?: string;
  // foreign keys
  parentId?: string;
  plugin?: any;
  pluginError?: any;
  pluginState?: any;

  quotaId?: string;
  role: string;
  sessionId?: string;
  tool_call_id?: string;
  tools?: object[];
  topicId?: string;

  traceId?: string;
  translate?: object | false;
  tts?: any;
  updatedAt: number;
}

interface DB_Plugin {
  createdAt: number;
  id: string;
  identifier: string;
  manifest?: object;
  settings?: object;
  type: 'plugin' | 'customPlugin';
  updatedAt: number;
}

interface DB_Session {
  config: object;
  createdAt: number;
  group?: string;
  // 原 Agent 类型
  id: string;
  meta: object;
  pinned?: number;
  type?: 'agent' | 'group';
  updatedAt: number;
}

interface DB_SessionGroup {
  createdAt: number;
  id: string;
  name: string;
  sort?: number;
  updatedAt: number;
}

interface DB_Topic {
  createdAt: number;
  favorite?: number;
  id: string;
  sessionId?: string;
  title: string;
  updatedAt: number;
}

interface DB_User {
  avatar?: string;
  createdAt: number;
  id: string;
  settings: object;
  updatedAt: number;
  uuid: string;
}

interface MigrationData {
  files: V2DB_File[];
  messages: V2DB_MESSAGE[];
  plugins: DB_Plugin[];
  sessionGroups: DB_SessionGroup[];
  sessions: DB_Session[];
  topics: DB_Topic[];
  users: DB_User[];
}

const LOBE_CHAT_LOCAL_DB_NAME = 'LOBE_CHAT_DB';

const V2DB_LASET_SCHEMA_VERSION = 7;
export class V2DBReader {
  private dbName: string = LOBE_CHAT_LOCAL_DB_NAME;
  private storeNames: string[];

  constructor(storeNames: string[]) {
    this.storeNames = storeNames;
  }

  /**
   * 读取所有数据
   */
  async readAllData(): Promise<MigrationData> {
    try {
      // 打开数据库连接
      const db = await this.openDB();

      // 并行读取所有表的数据
      const results = await Promise.all(
        this.storeNames.map((storeName) => this.readStore(db, storeName)),
      );

      // 构建返回结果
      const migrationData = this.storeNames.reduce((acc, storeName, index) => {
        // @ts-expect-error
        acc[storeName] = results[index];
        return acc;
      }, {} as MigrationData);

      // 关闭数据库连接
      db.close();

      return migrationData;
    } catch (error) {
      console.error('读取数据库失败:', error);
      throw error;
    }
  }

  async convertToImportData(data: MigrationData): Promise<ImporterEntryData> {
    // 转换 messages
    const messages = data.messages.map(
      (msg): ImportMessage => ({
        // 使用原有的 id
        content: msg.content,
        createdAt: msg.createdAt,
        // 处理 error
        error: msg.error || msg.pluginError,

        // 处理额外信息
        extra: {
          fromModel: msg.fromModel,
          fromProvider: msg.fromProvider,
          translate: msg.translate as any,
          tts: msg.tts,
        },

        files: msg.files,
        id: msg.id,

        // 复制原有字段
        observationId: msg.observationId,
        parentId: msg.parentId,
        plugin: msg.plugin,
        pluginState: msg.pluginState,
        quotaId: msg.quotaId,
        role: msg.role as any,
        sessionId: msg.sessionId,
        tool_call_id: msg.tool_call_id,
        tools: msg.tools as any,

        topicId: msg.topicId,

        traceId: msg.traceId,

        updatedAt: msg.updatedAt,
      }),
    );

    // 转换 sessionGroups
    const sessionGroups = data.sessionGroups.map(
      (group): ImportSessionGroup => ({
        createdAt: group.createdAt,
        id: group.id,
        // 使用原有的 id
        name: group.name,
        sort: group.sort || null,
        updatedAt: group.updatedAt,
      }),
    );

    // 转换 sessions
    const sessions = data.sessions.map(
      (session): ImportSession => ({
        // 使用原有的 id
        config: session.config as any,
        createdAt: new Date(session.createdAt).toString(),
        group: session.group,
        id: session.id,
        meta: session.meta as any,
        pinned: session.pinned ? true : undefined,
        type: session.type || 'agent',
        updatedAt: new Date(session.updatedAt).toString(),
      }),
    );

    const topics = data.topics.map(
      (topic): ImportTopic => ({
        ...topic,
        favorite: topic.favorite ? true : undefined,
      }),
    );

    return {
      messages,
      sessionGroups,
      sessions,
      topics,
      version: V2DB_LASET_SCHEMA_VERSION,
    };
  }

  /**
   * 打开数据库
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      // eslint-disable-next-line unicorn/prefer-add-event-listener
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * 读取单个存储对象的所有数据
   */
  private readStore(db: IDBDatabase, storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        // eslint-disable-next-line unicorn/prefer-add-event-listener
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
