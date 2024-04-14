import Debug from 'debug';
import { throttle, uniqBy } from 'lodash-es';
import type { WebrtcProvider } from 'y-webrtc';
import type { Doc, Transaction } from 'yjs';

import {
  OnAwarenessChange,
  OnSyncEvent,
  OnSyncStatusChange,
  PeerSyncStatus,
  StartDataSyncParams,
} from '@/types/sync';

import { LobeDBSchemaMap, browserDB } from './db';

const LOG_NAME_SPACE = 'DataSync';

class DataSync {
  private _ydoc: Doc | null = null;
  private provider: WebrtcProvider | null = null;

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
      await this.cleanConnection(window.__ONLY_USE_FOR_CLEANUP_IN_DEV);
    }

    await this.connect(params);
  };

  connect = async (params: StartDataSyncParams) => {
    const {
      channel,
      onSyncEvent,
      onSyncStatusChange,
      user,
      onAwarenessChange,
      signaling = 'wss://y-webrtc-signaling.lobehub.com',
    } = params;
    // ====== 1. init yjs doc ====== //

    await this.initYDoc();

    this.logger('[YJS] start to listen sync event...');
    this.initYjsObserve(onSyncEvent, onSyncStatusChange);

    // ====== 2. init webrtc provider ====== //
    this.logger(`[WebRTC] init provider... room: ${channel.name}`);
    const { WebrtcProvider } = await import('y-webrtc');

    // clients connected to the same room-name share document updates
    this.provider = new WebrtcProvider(channel.name, this._ydoc!, {
      password: channel.password,
      signaling: [signaling],
    });

    // when fast refresh in dev, the provider will be cached in window
    // so we need to clean it in destory
    if (process.env.NODE_ENV === 'development') {
      window.__ONLY_USE_FOR_CLEANUP_IN_DEV = this.provider;
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
          this.reconnect(params);
        }, 1000);
      }
    });

    // ====== 5. handle awareness  ====== //

    this.initAwareness({ onAwarenessChange, user });

    return this.provider;
  };

  reconnect = async (params: StartDataSyncParams) => {
    await this.cleanConnection(this.provider);

    await this.connect(params);
  };

  async disconnect() {
    await this.cleanConnection(this.provider);
  }

  private initYDoc = async () => {
    if (typeof window === 'undefined') return;

    this.logger('[YJS] init YDoc...');
    const { Doc } = await import('yjs');
    this._ydoc = new Doc();
  };

  private async cleanConnection(provider: WebrtcProvider | null) {
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
    if (!this.provider) return;

    const awareness = this.provider.awareness;

    awareness.setLocalState({ clientID: awareness.clientID, user });
    this.onAwarenessChange?.([{ ...user, clientID: awareness.clientID, current: true }]);

    awareness.on('change', () => this.syncAwarenessToUI());
  };

  private syncAwarenessToUI = async () => {
    const awareness = this.provider?.awareness;

    if (!awareness) return;

    const state = Array.from(awareness.getStates().values()).map((s) => ({
      ...s.user,
      clientID: s.clientID,
      current: s.clientID === awareness.clientID,
    }));

    this.onAwarenessChange?.(uniqBy(state, 'id'));
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
