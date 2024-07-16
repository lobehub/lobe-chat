import {
  BaseMetadata,
  BaseUserMeta,
  Json,
  Client as LiveBlocksClient,
  LiveMap,
  LiveObject,
  Room,
} from '@liveblocks/client';
import Debug from 'debug';
import Dexie from 'dexie';
import { differenceBy, throttle, uniqBy } from 'lodash-es';
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

const LOG_NAME_SPACE = 'DataSync';

class DataSync {
  _user: SyncUserInfo | null = null;
  _ydoc: Doc | null = null;
  onAwarenessChange!: OnAwarenessChange;
  onSyncEvent!: OnSyncEvent;
  onSyncStatusChange!: OnSyncStatusChange;

  logger = Debug(LOG_NAME_SPACE);
}

class WebRTCDataSync extends DataSync {
  private syncParams!: WebRTCSyncParams;
  private provider: WebrtcProvider | null = null;

  private waitForConnecting: any;

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

  initSync = async () => {
    await Promise.all(
      ['sessions', 'sessionGroups', 'topics', 'messages', 'plugins'].map(
        async (tableKey) => await this.loadDataFromDBtoYjs(tableKey as keyof LobeDBSchemaMap),
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

  loadDataFromDBtoYjs = async (tableKey: keyof LobeDBSchemaMap) => {
    const table = browserDB[tableKey];
    const items = await table.toArray();
    const yItemMap = this.getYMap(tableKey);

    this.logger('[YJS] Remote:', tableKey, yItemMap?.size);
    this.logger('[DB] Local:', tableKey, items.length);
    this.logger('[DB -> YJS] Update: ', tableKey, items.length);

    // 定义每批次最多包含的数据条数
    const batchSize = 100;

    // 计算总批次数
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      // 计算当前批次的起始和结束索引
      const start = i * batchSize;
      const end = start + batchSize;

      // 获取当前批次的数据
      const batchItems = items.slice(start, end);

      // 将当前批次的数据推送到 Yjs 中
      this._ydoc?.transact(() => {
        batchItems.forEach((item) => {
          yItemMap!.set(item.id, item);
        });
      });
    }

    for (const item of items) {
      yItemMap?.set(item.id, item);
    }

    this.logger('[YJS] Synced:', tableKey, yItemMap?.size);
  };

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

  private syncAwarenessToUI = () => {
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
  private _root: LiveObject<LiveblocksSyncDB> | null = null;

  batch = async (fn: () => Promise<void>) => {
    await this.room?.batch(fn);
  };

  getLiveMap = (tableKey: keyof LobeDBSchemaMap) => {
    if (['files', 'users'].includes(tableKey)) return;
    return this._root?.get(tableKey as LiveSyncLobeDBSchemaKeys) as LiveMap<
      string,
      DBModel<LobeDBSchemaMap[LiveSyncLobeDBSchemaKeys]>
    >;
  };

  initLiveStorage = async () => {
    if (typeof window === 'undefined') return;

    this.logger('[Liveblocks] init Liveblock storage...');
    const root: LiveObject<LiveblocksSyncDB> = new LiveObject();
    this._root = root;
  };

  initSync = async () => {
    await Promise.all(
      ['sessions', 'sessionGroups', 'topics', 'messages', 'plugins'].map(
        async (tableKey) => await this.mergeDBStorage(tableKey as LiveSyncLobeDBSchemaKeys),
      ),
    );
  };

  initLiveObserve = async (onEvent: OnSyncEvent, onSyncStatusChange: OnSyncStatusChange) => {
    ['sessions', 'sessionGroups', 'topics', 'messages', 'plugins'].forEach((tableKey) => {
      this.observeLiveChange(tableKey as LiveSyncLobeDBSchemaKeys, onEvent, onSyncStatusChange);
    });
  };

  subscribeRoomStatus = (onSyncStatusChange: OnSyncStatusChange) => {
    this.room!.subscribe('lost-connection', (status) => {
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

    this.room!.subscribe('status', (status) => {
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

    this.room!.subscribe('storage-status', async (status) => {
      this.logger(`[Liveblocks] room storage status changed: ${status}`);
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
          onSyncStatusChange(PeerSyncStatus.Synced);
          break;
        }
      }
    });
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
      const initialStorage = this.getInitDBStorage();

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
      this.room.updatePresence(this._user!);

      const { root } = await room.getStorage();
      this._root = root;

      this.logger(`[Liveblocks] sync room init success`);
      onSyncStatusChange?.(PeerSyncStatus.Ready);

      // Merge local and remote databases;
      this.logger(`[Liveblocks] start to merge local and remote databases...`);
      onSyncStatusChange(PeerSyncStatus.Syncing);
      await this.initSync();
      onSyncStatusChange(PeerSyncStatus.Synced);

      this.logger('[Liveblocks] start to listen sync event...');
      this.initLiveObserve(onSyncEvent, onSyncStatusChange);

      this.logger('[Liveblocks] start to subscribe connection status...');
      this.subscribeRoomStatus(onSyncStatusChange);
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
    this.logger(`[Liveblocks] leave room...`);
    this.leave?.();

    this.logger(`[Liveblocks] clean Connection...`);
    this.room?.disconnect();

    this.logger(`[Liveblocks] clean sync db...`);
    this._root = null;

    this.logger(`[Liveblocks] logout session...`);
    this.client?.logout();

    this.logger(`[Liveblocks] -------------------`);
  }

  private initAwareness = () => {
    if (!this.room) return;

    // Call sync awareness when room is ready
    this.syncAwarenessToUI();

    this.room.subscribe('others', () => this.syncAwarenessToUI());
  };

  private syncAwarenessToUI = () => {
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

  observeLiveChange = (
    tableKey: LiveSyncLobeDBSchemaKeys,
    onEvent: OnSyncEvent,
    onSyncStatusChange: OnSyncStatusChange,
  ) => {
    const table: Dexie.Table<DBModel<LobeDBSchemaMap[typeof tableKey]>, string> = browserDB[
      tableKey
    ];
    const map = this._root?.get(tableKey) as LiveMap<
      string,
      GetMapItemType<LiveblocksSyncDB, typeof tableKey>
    >;

    const updateSyncEvent = throttle(onEvent, 1000);

    // 定义一个变量来保存定时器的ID
    // eslint-disable-next-line no-undef
    let debounceTimer: NodeJS.Timeout;

    /**
     * Change from local DB
     **/

    /*

    table.hook('creating', (primaryKey, obj) => {
      clearTimeout(debounceTimer);
      onSyncStatusChange(PeerSyncStatus.Syncing);
      if (list.some((item) => item.id === primaryKey)) {
        // Key maybe conflicted, update liveblocks records
        const index = list.findIndex((item) => item.id === primaryKey);
        list.set(index, obj);
        this.logger(`[Liveblocks] ${tableKey} record updated: ${primaryKey}`);
      } else {
        list.push(obj);
        this.logger(`[Liveblocks] ${tableKey} record created: ${primaryKey}`);
      }
      updateSyncEvent(tableKey);
      debounceTimer = setTimeout(() => {
        onSyncStatusChange(PeerSyncStatus.Synced);
      }, 2000);
    });

    table.hook('updating', (_modifications, primaryKey, obj) => {
      clearTimeout(debounceTimer);
      onSyncStatusChange(PeerSyncStatus.Syncing);
      const index = list.findIndex((item) => item.id === primaryKey);
      if (index > -1) {
        list.set(index, obj);
        this.logger(`[Liveblocks] ${tableKey} record updated: ${primaryKey}`);
      } else {
        // Key maybe not existed, creating
        list.push(obj);
        this.logger(`[Liveblocks] ${tableKey} record created: ${primaryKey}`);
      }
      updateSyncEvent(tableKey);
      debounceTimer = setTimeout(() => {
        onSyncStatusChange(PeerSyncStatus.Synced);
      }, 2000);
    });

    table.hook('deleting', (primaryKey) => {
      clearTimeout(debounceTimer);
      onSyncStatusChange(PeerSyncStatus.Syncing);
      const index = list.findIndex((item) => item.id === primaryKey);
      if (index === -1) return;
      list.delete(index);
      this.logger(`[Liveblocks] ${tableKey} record deleted: ${primaryKey}`);
      updateSyncEvent(tableKey);
      debounceTimer = setTimeout(() => {
        onSyncStatusChange(PeerSyncStatus.Synced);
      }, 2000);
    });

    */

    /**
     * Change from Liveblocks
     */
    this.room?.subscribe(map, (updatedMap) => {
      clearTimeout(debounceTimer);
      onSyncStatusChange(PeerSyncStatus.Syncing);
      // New Item from remote
      (async () => {
        const remoteItems = Array.from(updatedMap.values());
        const localItems = await table.toArray();
        const newItems = differenceBy(remoteItems, localItems, 'id');
        await table.bulkPut(newItems);
        this.logger(`[DB] ${tableKey} records updated: ${newItems.length}`);
      })();
      updateSyncEvent(tableKey);
      debounceTimer = setTimeout(() => {
        onSyncStatusChange(PeerSyncStatus.Synced);
      }, 2000);
    });
  };

  convertTableToLiveMap = (tableKey: LiveSyncLobeDBSchemaKeys) => {
    const table: Dexie.Table<DBModel<LobeDBSchemaMap[typeof tableKey]>, string> = browserDB[
      tableKey
    ];
    const map = new LiveMap<string, GetMapItemType<LiveblocksSyncDB, typeof tableKey>>();
    table.each((item) => {
      map.set(item.id, item);
    });
    return map;
  };

  getInitDBStorage = (): LiveblocksSyncDB => {
    const initStorage: LiveblocksSyncDB = {
      messages: new LiveMap() as LiveMap<string, DBModel<LobeDBSchemaMap['messages']>>,
      plugins: new LiveMap() as LiveMap<string, DBModel<LobeDBSchemaMap['plugins']>>,
      sessionGroups: new LiveMap() as LiveMap<string, DBModel<LobeDBSchemaMap['sessionGroups']>>,
      sessions: new LiveMap() as LiveMap<string, DBModel<LobeDBSchemaMap['sessions']>>,
      topics: new LiveMap() as LiveMap<string, DBModel<LobeDBSchemaMap['topics']>>,
    };

    return initStorage;
  };

  /**
   * 合并 Liveblocks 与 Local DB 的表数据，只在同步开始时运行一次，不删除数据
   * @param tableKey
   */
  mergeDBStorage = async (tableKey: LiveSyncLobeDBSchemaKeys) => {
    const table: Dexie.Table<DBModel<LobeDBSchemaMap[typeof tableKey]>, string> = browserDB[
      tableKey
    ];
    const map = this._root!.get(tableKey) as LiveMap<
      string,
      GetMapItemType<LiveblocksSyncDB, typeof tableKey>
    >;

    const localItems = await table.toArray();
    // Local -> Liveblocks
    if (localItems.length > 0) {
      const insertedItems = localItems.filter((item) => !map.has(item.id));
      insertedItems.forEach((item) => map.set(item.id, item));
      this.logger(`[Liveblocks] ${insertedItems.length} ${tableKey} updated from local db`);
    }

    const remoteItems = Array.from(map.values());
    if (remoteItems.length > 0) {
      await table.bulkPut(remoteItems);
      this.logger(`[DB] ${remoteItems.length} ${tableKey} updated from liveblocks`);
    }

    this.logger(`[Liveblocks] ${remoteItems.length} ${tableKey} merged.`);
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

type LiveSyncLobeDBSchemaMap = {
  [K in Exclude<keyof LobeDBSchemaMap, 'files' | 'users'>]: LobeDBSchemaMap[K];
};

type LiveSyncLobeDBSchemaKeys = keyof LiveSyncLobeDBSchemaMap;

type GetMapItemType<T extends LiveblocksSyncDB, K extends keyof T> =
  T[K] extends LiveMap<string, infer U> ? U : never;

type LiveblocksSyncDB = {
  [K in keyof LiveSyncLobeDBSchemaMap]: LiveMap<string, DBModel<LiveSyncLobeDBSchemaMap[K]>>;
};

declare global {
  interface Window {
    __ONLY_USE_FOR_CLEANUP_IN_DEV_WEBRTC?: WebrtcProvider | null;
  }

  interface Liveblocks {
    Storage: LiveObject<LiveblocksSyncDB>;
  }
}
