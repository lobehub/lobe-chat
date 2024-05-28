import type { BaseUserMeta, Client as LiveBlocksClient, LsonObject } from '@liveblocks/client';
import type LiveblocksProvider from '@liveblocks/yjs';
import Debug from 'debug';
import { throttle, uniqBy } from 'lodash-es';
import type { WebrtcProvider } from 'y-webrtc';
import type { Doc, Transaction } from 'yjs';

import { createSyncAuthHeader, hashRoomName } from '@/libs/sync/liveblocks/utils';
import { API_ENDPOINTS } from '@/services/_url';
import {
  OnAwarenessChange,
  OnSyncEvent,
  OnSyncStatusChange,
  PeerSyncStatus,
  StartDataSyncParams,
  SyncAwarenessState,
  SyncUserInfo,
} from '@/types/sync';

import { LobeDBSchemaMap, browserDB } from './db';

const LOG_NAME_SPACE = 'DataSync';

class DataSync {
  private _ydoc: Doc | null = null;
  private webrtcProvider: WebrtcProvider | null = null;
  private liveblocksProvider: LiveblocksProvider<
    SyncUserInfo,
    LsonObject,
    BaseUserMeta,
    never
  > | null = null;
  private liveblocksClient: LiveBlocksClient<BaseUserMeta> | null = null;

  private syncParams!: StartDataSyncParams;
  private onAwarenessChange!: OnAwarenessChange;

  private waitForConnecting: any;

  logger = Debug(LOG_NAME_SPACE);

  transact(fn: (transaction: Transaction) => unknown) {
    this._ydoc?.transact(fn);
  }

  getYMap = (tableKey: keyof LobeDBSchemaMap) => {
    return this._ydoc?.getMap(tableKey);
  };

  startDataSync = async (params: StartDataSyncParams) => {
    this.syncParams = params;
    this.onAwarenessChange = params.onAwarenessChange;

    // 开发时由于存在 fast refresh 全局实例会缓存在运行时中
    // 因此需要在每次重新连接时清理上一次的实例
    if (window.__ONLY_USE_FOR_CLEANUP_IN_DEV) {
      await this.cleanWebrtcConnection(window.__ONLY_USE_FOR_CLEANUP_IN_DEV);
    }

    await this.connect(params);
  };

  private async connectWithWebrtc(params: StartDataSyncParams) {
    const { onSyncStatusChange } = params;
    const {
      name,
      password,
      signaling = 'wss://y-webrtc-signaling.lobehub.com',
    } = params.channel.webrtc;

    // ====== init webrtc provider ====== //
    this.logger(`[WebRTC] init provider... room: ${name}`);
    const { WebrtcProvider } = await import('y-webrtc');

    // clients connected to the same room-name share document updates
    this.webrtcProvider = new WebrtcProvider(name, this._ydoc!, {
      password: password,
      signaling: [signaling],
    });

    // when fast refresh in dev, the provider will be cached in window
    // so we need to clean it in destory
    if (process.env.NODE_ENV === 'development') {
      window.__ONLY_USE_FOR_CLEANUP_IN_DEV = this.webrtcProvider;
    }

    this.logger(`[WebRTC] provider init success`);

    // ====== 3. check signaling server connection  ====== //

    // 当本地设备正确连接到 WebRTC Provider 后，触发 status 事件
    // 当开始连接，则开始监听事件
    this.webrtcProvider.on('status', async ({ connected }) => {
      this.logger('[WebRTC] peer status:', connected);
      if (connected) {
        // this.initObserve(onSyncEvent, onSyncStatusChange);
        onSyncStatusChange?.(PeerSyncStatus.Connecting);
      }
    });
    // check the connection with signaling server
    let connectionCheckCount = 0;

    this.waitForConnecting = setInterval(() => {
      const signalingConnection: IWebsocketClient = this.webrtcProvider!.signalingConns[0];

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
    this.webrtcProvider.on('synced', async ({ synced }) => {
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
          this.reconnect(params);
        }, 1000);
      }
    });
  }

  private async connectWithLiveblocks(params: StartDataSyncParams) {
    const { onSyncStatusChange } = params;
    const { name, password, publicApiKey, accessCode } = params.channel.liveblocks;
    // ====== 2. init liveblocks provider ====== //
    const hashedRoomName = hashRoomName(name, password);

    this.logger(`[Liveblocks] init provider... room name: ${hashedRoomName}`);

    const { createClient } = await import('@liveblocks/client');

    this.liveblocksClient = publicApiKey
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
              // throw new Error(`Failed to authorize room: ${room}`);
              onSyncStatusChange?.(PeerSyncStatus.Unconnected);
              return {
                error: 'forbidden',
                reason: 'User is not authorized to access Lobechat',
              };
            }

            return await response.json();
          },
        });

    // ====== 3. join liveblocks room ====== //
    const { room } = this.liveblocksClient.enterRoom(hashedRoomName, {
      autoConnect: true,
      initialPresence: {},
    });

    const LiveblocksProvider = await import('@liveblocks/yjs');

    this.liveblocksProvider = new LiveblocksProvider.default(room, this._ydoc!);
    this.logger(`[Liveblocks] provider init success`);

    // ====== 4. handle data sync  ====== //
    // Does nothing for connection, which is handled by Liveblocks client

    this.liveblocksProvider.on('sync', async (synced: boolean) => {
      this.logger('[Liveblocks] server sync status:', synced);
      if (synced === true) {
        // Yjs content is synchronized and ready
        this.logger('[Liveblocks] start to init yjs data...');
        onSyncStatusChange?.(PeerSyncStatus.Syncing);
        await this.initSync();
        onSyncStatusChange?.(PeerSyncStatus.Synced);
        this.logger('[Liveblocks] yjs data init success');
      } else {
        // Yjs content is not synchronized
        this.logger('[Liveblocks] data not sync, try to reconnect in 1s...');
        // await this.reconnect(params);
        setTimeout(() => {
          onSyncStatusChange?.(PeerSyncStatus.Syncing);
          this.reconnect(params);
        }, 1000);
      }
    });
  }

  connect = async (params: StartDataSyncParams) => {
    const { channel, onSyncEvent, onSyncStatusChange, user, onAwarenessChange } = params;
    // ====== 1. init yjs doc ====== //

    await this.initYDoc();

    this.logger('[YJS] start to listen sync event...');
    this.initYjsObserve(onSyncEvent, onSyncStatusChange);

    if (channel.webrtc.enabled) {
      await this.connectWithWebrtc(params);
    }

    if (channel.liveblocks.enabled) {
      await this.connectWithLiveblocks(params);
    }

    // ====== 5. handle awareness  ====== //
    this.initAwareness({ onAwarenessChange, user });
  };

  reconnect = async (params: StartDataSyncParams) => {
    await this.cleanWebrtcConnection(this.webrtcProvider);
    await this.cleanLiveblocksConnection();

    await this.connect(params);
  };

  async disconnect() {
    await this.cleanWebrtcConnection(this.webrtcProvider);
    await this.cleanLiveblocksConnection();
  }

  private initYDoc = async () => {
    if (typeof window === 'undefined') return;

    this.logger('[YJS] init YDoc...');
    const { Doc } = await import('yjs');
    this._ydoc = new Doc();
  };

  private async cleanWebrtcConnection(provider: WebrtcProvider | null) {
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

  private async cleanLiveblocksConnection() {
    this.logger(`[Liveblocks] clean Connection...`);
    // provider.disconnect();
    this.liveblocksClient?.logout();

    this.logger(`[Liveblocks] clean provider...`);
    this.liveblocksProvider?.destroy();

    this.logger(`[Liveblocks] clean yjs doc...`);
    this._ydoc?.destroy();

    this.logger(`[Liveblocks] -------------------`);
  }

  private initSync = async () => {
    await Promise.all(
      ['sessions', 'sessionGroups', 'topics', 'messages', 'plugins'].map(async (tableKey) =>
        this.loadDataFromDBtoYjs(tableKey as keyof LobeDBSchemaMap),
      ),
    );
  };

  private initYjsObserve = (onEvent: OnSyncEvent, onSyncStatusChange: OnSyncStatusChange) => {
    ['sessions', 'sessionGroups', 'topics', 'messages', 'plugins'].forEach((tableKey) => {
      // listen yjs change
      this.observeYMapChange(tableKey as keyof LobeDBSchemaMap, onEvent, onSyncStatusChange);
    });
  };

  private observeYMapChange = (
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

  private loadDataFromDBtoYjs = async (tableKey: keyof LobeDBSchemaMap) => {
    const table = browserDB[tableKey];
    const items = await table.toArray();
    const yItemMap = this.getYMap(tableKey);

    // 定义每批次最多包含的数据条数
    const batchSize = 50;

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

    this.logger('[DB]:', tableKey, yItemMap?.size);
  };

  private initAwareness = ({ user }: Pick<StartDataSyncParams, 'user' | 'onAwarenessChange'>) => {
    if (!this.webrtcProvider && !this.liveblocksProvider) return;

    const webrtcAwareness = this.webrtcProvider?.awareness;
    const liveblocksAwareness = this.liveblocksProvider?.awareness;

    const syncAwarenessStates: SyncAwarenessState[] = [];

    if (webrtcAwareness) {
      webrtcAwareness.setLocalState({ clientID: webrtcAwareness.clientID, user });
      syncAwarenessStates.push({ ...user, clientID: webrtcAwareness.clientID, current: true });
      webrtcAwareness.on('change', () => this.syncAwarenessToUI());
    }

    if (liveblocksAwareness) {
      liveblocksAwareness.setLocalState({ clientID: liveblocksAwareness.doc.clientID, user });
      syncAwarenessStates.push({
        ...user,
        clientID: liveblocksAwareness.doc.clientID,
        current: true,
      });
      liveblocksAwareness.on('change', () => this.syncAwarenessToUI());
    }

    this.onAwarenessChange?.(syncAwarenessStates);
  };

  private syncAwarenessToUI = async () => {
    const webrtcAwareness = this.webrtcProvider?.awareness;
    const liveblocksAwareness = this.liveblocksProvider?.awareness;

    if (!webrtcAwareness && !liveblocksAwareness) return;

    const syncAwarenessStates: SyncAwarenessState[] = [];

    if (webrtcAwareness) {
      const state: SyncAwarenessState[] = Array.from(webrtcAwareness.getStates().values()).map(
        (s) => ({
          ...s.user,
          clientID: s.clientID,
          current: s.clientID === webrtcAwareness.clientID,
        }),
      );
      syncAwarenessStates.push(...state);
    }

    if (liveblocksAwareness) {
      const currentStates: Map<number, any> = liveblocksAwareness.getStates();
      const state = Array.from(currentStates.values()).map((s) => ({
        ...s.user,
        clientID: s.clientID,
        current: s.clientID === liveblocksAwareness.doc.clientID,
      }));
      syncAwarenessStates.push(...state);
    }

    this.onAwarenessChange?.(uniqBy(syncAwarenessStates, 'id'));
  };
}

export const dataSync = new DataSync();

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

declare global {
  interface Window {
    __ONLY_USE_FOR_CLEANUP_IN_DEV?: WebrtcProvider | null;
  }
}
