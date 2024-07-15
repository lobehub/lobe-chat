import {
  BaseMetadata,
  BaseUserMeta,
  Json,
  Client as LiveBlocksClient,
  LiveList,
  LiveObject,
  Room,
} from '@liveblocks/client';
// import Debug from 'debug';
import { throttle, uniqBy } from 'lodash-es';
import type { WebrtcProvider } from 'y-webrtc';
import type { Doc, Transaction } from 'yjs';

import { createSyncAuthHeader, hashRoomName } from '@/libs/sync/liveblocks/utils';
import { API_ENDPOINTS } from '@/services/_url';
import {
  LiveblocksSyncParams,
  OnAwarenessChange,
  OnSyncEvent,
  OnSyncStatusChange,
  PeerSyncStatus,
  SyncAwarenessState,
  SyncUserInfo,
  WebRTCSyncParams,
} from '@/types/sync';

import { LobeDBSchemaMap, browserDB } from './db';
import { DBModel } from './types/db';

// const LOG_NAME_SPACE = 'DataSync';

class DataSync {
  _user: SyncUserInfo | null = null;
  _ydoc: Doc | null = null;
  onAwarenessChange!: OnAwarenessChange;
  onSyncEvent!: OnSyncEvent;
  onSyncStatusChange!: OnSyncStatusChange;

  logger = console.debug;

  transact(fn: (transaction: Transaction) => unknown) {
    this._ydoc?.transact(fn);
  }

  getYMap = (tableKey: keyof LobeDBSchemaMap) => {
    return this._ydoc?.getMap(tableKey);
  };

  initYDoc = async () => {
    if (typeof window === 'undefined') return;

    this.logger('[YJS] init YDoc...');
    const { Doc } = await import('yjs');
    this._ydoc = new Doc();
  };

  initSync = async (initial?: boolean) => {
    await Promise.all(
      ['sessions', 'sessionGroups', 'topics', 'messages', 'plugins'].map(
        async (tableKey) =>
          await this.loadDataFromDBtoYjs(tableKey as keyof LobeDBSchemaMap, initial),
      ),
    );
  };

  initYjsObserve = (onEvent: OnSyncEvent, onSyncStatusChange: OnSyncStatusChange) => {
    ['sessions', 'sessionGroups', 'topics', 'messages', 'plugins'].forEach((tableKey) => {
      // listen yjs change
      this.observeYMapChange(tableKey as keyof LobeDBSchemaMap, onEvent, onSyncStatusChange);
    });
  };

  observeYMapChange = (
    tableKey: keyof LobeDBSchemaMap,
    onEvent: OnSyncEvent,
    onSyncStatusChange: OnSyncStatusChange,
  ) => {
    const table = browserDB[tableKey];
    const yItemMap = this.getYMap(tableKey);
    const updateSyncEvent = throttle(onEvent, 1000);

    // 定义一个变量来保存定时器的ID
    // eslint-disable-next-line no-undef
    let debounceTimer: NodeJS.Timeout;

    yItemMap?.observe(async (event) => {
      // abort local change
      if (event.transaction.local) return;

      // 每次有变更时，都先清除之前的定时器（如果有的话），然后设置新的定时器
      clearTimeout(debounceTimer);

      onSyncStatusChange(PeerSyncStatus.Syncing);

      this.logger(`[YJS] observe ${tableKey} changes:`, event.keysChanged.size);
      const pools = Array.from(event.keys).map(async ([id, payload]) => {
        const item: any = yItemMap.get(id);

        switch (payload.action) {
          case 'add':
          case 'update': {
            await table.put(item, id);

            break;
          }

          case 'delete': {
            await table.delete(id);
            break;
          }
        }
      });

      await Promise.all(pools);

      updateSyncEvent(tableKey);

      // 设置定时器，2000ms 后更新状态为'synced'
      debounceTimer = setTimeout(() => {
        onSyncStatusChange(PeerSyncStatus.Synced);
      }, 2000);
    });
  };

  loadDataFromDBtoYjs = async (tableKey: keyof LobeDBSchemaMap, initial = false) => {
    const table = browserDB[tableKey];
    const items = await table.toArray();
    const yItemMap = this.getYMap(tableKey);

    const transactionItems = initial ? items.filter((item) => !yItemMap?.has(item.id)) : items;

    this.logger('[YJS] Remote:', tableKey, yItemMap?.size);
    this.logger('[DB] Local:', tableKey, items.length);
    this.logger('[DB -> YJS] Update: ', tableKey, transactionItems.length);

    // 定义每批次最多包含的数据条数
    const batchSize = 100;

    // 计算总批次数
    const totalBatches = Math.ceil(transactionItems.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      // 计算当前批次的起始和结束索引
      const start = i * batchSize;
      const end = start + batchSize;

      // 获取当前批次的数据
      const batchItems = transactionItems.slice(start, end);

      // 将当前批次的数据推送到 Yjs 中
      this._ydoc?.transact(() => {
        batchItems.forEach((item) => {
          yItemMap!.set(item.id, item);
        });
      });
    }

    for (const item of transactionItems) {
      yItemMap?.set(item.id, item);
    }

    this.logger('[YJS] Synced:', tableKey, yItemMap?.size);
  };
}

class WebRTCDataSync extends DataSync {
  private syncParams!: WebRTCSyncParams;
  private provider: WebrtcProvider | null = null;

  private waitForConnecting: any;

  startDataSync = async (user: SyncUserInfo, params: WebRTCSyncParams) => {
    this._user = user;
    this.syncParams = params;
    this.onAwarenessChange = params.onAwarenessChange;

    // 开发时由于存在 fast refresh 全局实例会缓存在运行时中
    // 因此需要在每次重新连接时清理上一次的实例
    if (window.__ONLY_USE_FOR_CLEANUP_IN_DEV_WEBRTC) {
      await this.cleanConnection(true);
    }

    await this.connect();
  };

  private async connect() {
    const { onSyncEvent, onSyncStatusChange } = this.syncParams;

    await this.initYDoc();

    this.logger('[YJS] start to listen sync event...');
    this.initYjsObserve(onSyncEvent, onSyncStatusChange);

    const { name, password, signaling = 'wss://y-webrtc-signaling.lobehub.com' } = this.syncParams;

    // ====== init webrtc provider ====== //
    this.logger(`[WebRTC] init provider... room: ${name}`);
    const { WebrtcProvider } = await import('y-webrtc');

    // clients connected to the same room-name share document updates
    this.provider = new WebrtcProvider(name, this._ydoc!, {
      password: password,
      signaling: [signaling],
    });

    // when fast refresh in dev, the provider will be cached in window
    // so we need to clean it in destory
    if (process.env.NODE_ENV === 'development') {
      window.__ONLY_USE_FOR_CLEANUP_IN_DEV_WEBRTC = this.provider;
    }

    this.logger(`[WebRTC] provider init success`);

    // ====== 3. check signaling server connection  ====== //

    // 当本地设备正确连接到 WebRTC Provider 后，触发 status 事件
    // 当开始连接，则开始监听事件
    this.provider.on('status', async ({ connected }) => {
      this.logger('[WebRTC] peer status:', connected);
      if (connected) {
        // this.initObserve(onSyncEvent, onSyncStatusChange);
        onSyncStatusChange?.(PeerSyncStatus.Connecting);
      }
    });
    // check the connection with signaling server
    let connectionCheckCount = 0;

    this.waitForConnecting = setInterval(() => {
      const signalingConnection: IWebsocketClient = this.provider!.signalingConns[0];

      if (signalingConnection.connected) {
        onSyncStatusChange?.(PeerSyncStatus.Ready);
        clearInterval(this.waitForConnecting);
        return;
      }

      connectionCheckCount += 1;

      // check for 5 times, or make it failed
      if (connectionCheckCount > 5) {
        onSyncStatusChange?.(PeerSyncStatus.Unconnected);
        clearInterval(this.waitForConnecting);
      }
    }, 2000);
    // ====== 4. handle data sync  ====== //

    // 当各方的数据均完成同步后，YJS 对象之间的数据已经一致时，触发 synced 事件
    this.provider.on('synced', async ({ synced }) => {
      this.logger('[WebRTC] peer sync status:', synced);
      if (synced) {
        this.logger('[WebRTC] start to init yjs data...');
        onSyncStatusChange?.(PeerSyncStatus.Syncing);
        await this.initSync();
        onSyncStatusChange?.(PeerSyncStatus.Synced);
        this.logger('[WebRTC] yjs data init success');
      } else {
        this.logger('[WebRTC] data not sync, try to reconnect in 1s...');
        // await this.reconnect(params);
        setTimeout(() => {
          onSyncStatusChange?.(PeerSyncStatus.Syncing);
          this.reconnect();
        }, 1000);
      }
    });

    this.initAwareness();
  }

  reconnect = async () => {
    await this.disconnect();
    await this.connect();
  };

  async disconnect() {
    await this.cleanConnection();
  }

  private async cleanConnection(isDev = false) {
    const provider = isDev ? window.__ONLY_USE_FOR_CLEANUP_IN_DEV_WEBRTC : this.provider;
    if (provider) {
      this.logger(`[WebRTC] clean Connection...`);
      this.logger(`[WebRTC] clean awareness...`);
      provider.awareness.destroy();

      this.logger(`[WebRTC] clean room...`);
      provider.room?.disconnect();
      provider.room?.destroy();

      this.logger(`[WebRTC] clean provider...`);
      provider.disconnect();
      provider.destroy();

      this.logger(`[WebRTC] clean yjs doc...`);
      this._ydoc?.destroy();

      this.logger(`[WebRTC] -------------------`);
    }
  }

  private initAwareness = () => {
    if (!this.provider) return;

    const user = this._user!;
    const awareness = this.provider?.awareness;

    const syncAwarenessStates: SyncAwarenessState[] = [];

    if (awareness) {
      awareness.setLocalState({ clientID: awareness.clientID, user });
      syncAwarenessStates.push({ ...user, clientID: awareness.clientID, current: true });
      awareness.on('change', () => this.syncAwarenessToUI());
    }

    this.onAwarenessChange?.(syncAwarenessStates);
  };

  private syncAwarenessToUI = async () => {
    const awareness = this.provider?.awareness;

    if (!awareness) return;

    const syncAwarenessStates: SyncAwarenessState[] = [];

    const state: SyncAwarenessState[] = Array.from(awareness.getStates().values()).map((s) => ({
      ...s.user,
      clientID: s.clientID,
      current: s.clientID === awareness.clientID,
    }));
    syncAwarenessStates.push(...state);

    this.onAwarenessChange?.(uniqBy(syncAwarenessStates, 'clientID'));
  };
}

class LiveblocksDataSync extends DataSync {
  private syncParams!: LiveblocksSyncParams;

  private client: LiveBlocksClient<BaseUserMeta> | null = null;
  private room: Room<SyncUserInfo, LiveblocksSyncDB, BaseUserMeta, Json, BaseMetadata> | null =
    null;

  private leave?: () => void;
  private unsubscribes?: [() => void];
  private _root: LiveObject<LiveblocksSyncDB> | null = null;

  initLiveStorage = async () => {
    if (typeof window === 'undefined') return;

    if (this._root) return;

    this.logger('[Liveblocks] init Liveblock storage...');
    const root: LiveObject<LiveblocksSyncDB> = new LiveObject();
    this._root = root;
  };

  startDataSync = async (user: SyncUserInfo, params: LiveblocksSyncParams) => {
    this._user = user;
    this.syncParams = params;
    this.onAwarenessChange = params.onAwarenessChange;

    await this.connect();
  };

  private async connect() {
    const { onSyncEvent, onSyncStatusChange } = this.syncParams;

    await this.initLiveStorage();

    this.logger('[Liveblocks] start to listen sync event...');
    this.initYjsObserve(onSyncEvent, onSyncStatusChange);

    const { name, password, publicApiKey, accessCode } = this.syncParams;
    const hashedRoomName = hashRoomName(name, password);

    this.logger(`[Liveblocks] init provider... room name: ${hashedRoomName}`);

    const { createClient } = await import('@liveblocks/client');

    this.client = publicApiKey
      ? createClient({
          publicApiKey,
        })
      : createClient({
          authEndpoint: async () => {
            const headers = await createSyncAuthHeader(accessCode, {
              'Content-Type': 'application/json',
            });

            const response = await fetch(API_ENDPOINTS.syncAuth, {
              body: JSON.stringify({
                name,
                password,
              }),
              headers,
              method: 'POST',
            });

            const { status } = response;

            if (status !== 200) {
              return {
                error: 'forbidden',
                reason: 'User is not authorized to access Lobechat',
              };
            }

            return await response.json();
          },
        });
    try {
      const initialStorage = await this.getInitDBStorage();

      // TODO: SyncUserInfo
      const { room } = this.client.enterRoom<SyncUserInfo, LiveblocksSyncDB, Json, BaseMetadata>(
        hashedRoomName,
        {
          autoConnect: true,
          initialPresence: this._user!,
          initialStorage,
        },
      );

      this.room = room;

      const { root } = await room.getStorage();
      this._root = root;

      this.logger(`[Liveblocks] sync room init success`);
      // ====== 4. handle data sync  ====== //
      // Does nothing for connection, which is handled by Liveblocks client
      // await this.initSync();

      // Sync from Liveblocks to Db
      const unsubscribeRoot = this.room.subscribe(root, async (updatedRoot) => {
        this.logger('[Liveblocks] storage updated.');

        onSyncStatusChange(PeerSyncStatus.Syncing);

        const sessions = await browserDB.sessions.toArray();
        const sessionsKeys = sessions.map((s) => s.id);
        const updatedSessions = updatedRoot.get('sessions').toImmutable();
        const updatedSessionsKeys = updatedSessions.map((s) => s.id);
        const deletedSessionKeys = sessionsKeys.filter((key) => !updatedSessionsKeys.includes(key));
        await browserDB.sessions.bulkPut(updatedSessions);
        await browserDB.sessions.bulkDelete(deletedSessionKeys);
        this.logger(
          `[Liveblocks] ${updatedSessionsKeys.length} sessions updated. ${deletedSessionKeys.length} deleted.`,
        );

        const sessionGroups = await browserDB.sessionGroups.toArray();
        const sessionGroupsKeys = sessionGroups.map((s) => s.id);
        const updatedSessionGroups = updatedRoot.get('sessionGroups').toImmutable();
        const updatedSessionGroupsKeys = updatedSessionGroups.map((s) => s.id);
        const deletedSessionGroupKeys = sessionGroupsKeys.filter(
          (key) => !updatedSessionGroupsKeys.includes(key),
        );
        await browserDB.sessionGroups.bulkPut(updatedSessionGroups);
        await browserDB.sessionGroups.bulkDelete(deletedSessionGroupKeys);
        this.logger(
          `[Liveblocks] ${updatedSessionGroupsKeys.length} sessionGroups updated. ${deletedSessionGroupKeys.length} deleted.`,
        );

        const topics = await browserDB.topics.toArray();
        const topicsKeys = topics.map((s) => s.id);
        const updatedTopics = updatedRoot.get('topics').toImmutable();
        const updatedTopicsKeys = updatedTopics.map((s) => s.id);
        const deletedTopicKeys = topicsKeys.filter((key) => !updatedTopicsKeys.includes(key));
        await browserDB.topics.bulkPut(updatedTopics);
        await browserDB.topics.bulkDelete(deletedTopicKeys);
        this.logger(
          `[Liveblocks] ${updatedTopicsKeys.length} topics updated. ${deletedTopicKeys.length} deleted.`,
        );

        const messages = await browserDB.messages.toArray();
        const messagesKeys = messages.map((s) => s.id);
        const updatedMessages = updatedRoot.get('messages').toImmutable();
        const updatedMessagesKeys = updatedMessages.map((s) => s.id);
        const deletedMessageKeys = messagesKeys.filter((key) => !updatedMessagesKeys.includes(key));
        await browserDB.messages.bulkPut(updatedMessages);
        await browserDB.messages.bulkDelete(deletedMessageKeys);
        this.logger(
          `[Liveblocks] ${updatedMessagesKeys.length} messages updated. ${deletedMessageKeys.length} deleted.`,
        );

        const plugins = await browserDB.plugins.toArray();
        const pluginsKeys = plugins.map((s) => s.id);
        const updatedPlugins = updatedRoot.get('plugins').toImmutable();
        const updatedPluginsKeys = updatedPlugins.map((s) => s.id);
        const deletedPluginKeys = pluginsKeys.filter((key) => !updatedPluginsKeys.includes(key));
        await browserDB.plugins.bulkPut(updatedPlugins);
        await browserDB.plugins.bulkDelete(deletedPluginKeys);
        this.logger(
          `[Liveblocks] ${updatedPluginsKeys.length} plugins updated. ${deletedPluginKeys.length} deleted.`,
        );

        onSyncStatusChange(PeerSyncStatus.Synced);
      });
      this.unsubscribes?.push(unsubscribeRoot);

      const unsubscribeConnection = this.room.subscribe('lost-connection', (status) => {
        this.logger(`[Liveblocks] network connection lost, status: ${status}`);
        switch (status) {
          case 'lost': {
            onSyncStatusChange?.(PeerSyncStatus.Connecting);
            break;
          }
          case 'restored': {
            onSyncStatusChange?.(PeerSyncStatus.Ready);
            break;
          }
          case 'failed': {
            onSyncStatusChange?.(PeerSyncStatus.Unconnected);
            break;
          }
        }
      });
      this.unsubscribes?.push(unsubscribeConnection);

      const unsubscribeStatus = this.room.subscribe('status', (status) => {
        this.logger(`[Liveblocks] room status changed: ${status}`);
        switch (status) {
          case 'initial': {
            onSyncStatusChange?.(PeerSyncStatus.Ready);
            break;
          }
          case 'connecting': {
            onSyncStatusChange?.(PeerSyncStatus.Connecting);
            break;
          }
          case 'connected': {
            onSyncStatusChange?.(PeerSyncStatus.Ready);
            break;
          }
          case 'reconnecting': {
            onSyncStatusChange?.(PeerSyncStatus.Connecting);
            break;
          }
          case 'disconnected': {
            onSyncStatusChange?.(PeerSyncStatus.Unconnected);
            break;
          }
        }
      });
      this.unsubscribes?.push(unsubscribeStatus);

      const unsubscribeStorage = this.room.subscribe('storage-status', async (status) => {
        switch (status) {
          case 'not-loaded': {
            onSyncStatusChange?.(PeerSyncStatus.Unconnected);
            break;
          }
          case 'loading': {
            onSyncStatusChange?.(PeerSyncStatus.Connecting);
            break;
          }
          case 'synchronizing': {
            onSyncStatusChange(PeerSyncStatus.Syncing);
            break;
          }
          case 'synchronized': {
            onSyncStatusChange(PeerSyncStatus.Syncing);
            await this.loadDataFromDBtoLiveStorage();
            onSyncStatusChange(PeerSyncStatus.Synced);
            break;
          }
        }
      });

      this.unsubscribes?.push(unsubscribeStorage);
    } catch (error) {
      this.logger(`[Liveblocks] failed to join room: ${hashedRoomName}, error: ${error}`);
      onSyncStatusChange?.(PeerSyncStatus.Unconnected);
      await this.cleanConnection();
    }
    this.initAwareness();
  }

  reconnect = async () => {
    await this.disconnect();
    await this.connect();
  };

  async disconnect() {
    await this.cleanConnection();
  }

  private async cleanConnection() {
    this.logger(`[Liveblocks] unsubscribe update...`);
    this.unsubscribes?.forEach((unsubscribe) => unsubscribe());

    this.logger(`[Liveblocks] leave room...`);
    this.leave?.();

    this.logger(`[Liveblocks] clean Connection...`);
    this.room?.disconnect();

    this.logger(`[Liveblocks] clean sync db...`);
    this._root = null;

    this.logger(`[Liveblocks] -------------------`);
  }

  private initAwareness = () => {
    if (!this.room) return;

    // Port to Liveblocks presence
    const self = this.room.getSelf();
    if (!self) return;

    const user = this._user!;

    const syncAwarenessStates: SyncAwarenessState[] = [];

    const currentSyncAwarenessState: SyncAwarenessState = {
      ...user,
      clientID: self.connectionId,
      current: true,
    };
    syncAwarenessStates.push(currentSyncAwarenessState);
    this.room.subscribe('others', () => this.syncAwarenessToUI());

    this.onAwarenessChange?.(syncAwarenessStates);
  };

  private syncAwarenessToUI = async () => {
    if (!this.room) return;

    const self = this.room.getSelf();
    if (!self) return;

    const others = this.room.getOthers();

    // Other users
    const syncAwarenessStates: SyncAwarenessState[] = others.map((s) => ({
      ...s.presence,
      clientID: s.connectionId,
      current: s.connectionId === self.connectionId,
    }));
    // Current
    syncAwarenessStates.push({
      ...self.presence,
      clientID: self.connectionId,
      current: true,
    });

    this.onAwarenessChange?.(uniqBy(syncAwarenessStates, 'clientID'));
  };

  getInitDBStorage = async (): Promise<LiveblocksSyncDB> => {
    const sessions = await browserDB.sessions.toArray();
    const sessionGroups = await browserDB.sessionGroups.toArray();
    const topics = await browserDB.topics.toArray();
    const messages = await browserDB.messages.toArray();
    const plugins = await browserDB.plugins.toArray();

    const initStorage = {
      messages: new LiveList(messages),
      plugins: new LiveList(plugins),
      sessionGroups: new LiveList(sessionGroups),
      sessions: new LiveList(sessions),
      topics: new LiveList(topics),
    };

    return initStorage;
  };

  loadDataFromDBtoLiveStorage = async () => {
    const { sessions, sessionGroups, topics, messages, plugins } = await this.getInitDBStorage();

    this._root?.set('sessions', sessions);
    this._root?.set('sessionGroups', sessionGroups);
    this._root?.set('topics', topics);
    this._root?.set('messages', messages);
    this._root?.set('plugins', plugins);

    this.logger('[Liveblocks] Synced data from DB to Liveblocks');
  };
}

export const webrtcDataSync = new WebRTCDataSync();
export const liveblocksDataSync = new LiveblocksDataSync();

interface IWebsocketClient {
  binaryType: 'arraybuffer' | 'blob' | null;
  connect(): void;
  connected: boolean;
  connecting: boolean;
  destroy(): void;
  disconnect(): void;
  lastMessageReceived: number;
  send(message: any): void;
  shouldConnect: boolean;
  unsuccessfulReconnects: number;
  url: string;
  ws: WebSocket;
}

type LiveblocksSyncDB = {
  messages: LiveList<DBModel<LobeDBSchemaMap['messages']>>;
  plugins: LiveList<DBModel<LobeDBSchemaMap['plugins']>>;
  sessionGroups: LiveList<DBModel<LobeDBSchemaMap['sessionGroups']>>;
  sessions: LiveList<DBModel<LobeDBSchemaMap['sessions']>>;
  topics: LiveList<DBModel<LobeDBSchemaMap['topics']>>;
};

declare global {
  interface Window {
    __ONLY_USE_FOR_CLEANUP_IN_DEV_WEBRTC?: WebrtcProvider | null;
  }

  interface Liveblocks {
    Storage: LiveObject<LiveblocksSyncDB>;
  }
}
