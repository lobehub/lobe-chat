import { throttle } from 'lodash-es';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { OnSyncEvent, OnSyncStatusChange, StartDataSyncParams } from '@/types/sync';

import { LobeDBSchemaMap, LocalDBInstance } from './db';

declare global {
  interface Window {
    __ONLY_USE_FOR_CLEANUP_IN_DEV?: WebrtcProvider | null;
  }
}

let ydoc: Doc;

if (typeof window !== 'undefined') {
  ydoc = new Doc();
}

class SyncBus {
  private ydoc: Doc = ydoc;
  private provider: WebrtcProvider | null = null;

  startDataSync = async (params: StartDataSyncParams) => {
    // 开发时由于存在 fast refresh 全局实例会缓存在运行时中
    // 因此需要在每次重新连接时清理上一次的实例
    if (window.__ONLY_USE_FOR_CLEANUP_IN_DEV) {
      this.cleanProvider(window.__ONLY_USE_FOR_CLEANUP_IN_DEV);
    }

    this.connect(params);
  };

  connect = (params: StartDataSyncParams) => {
    const {
      channel,
      onSyncEvent,
      onSyncStatusChange,
      user,
      onAwarenessChange,
      signaling = 'wss://y-webrtc-signaling.lobehub.com',
    } = params;
    console.log('[YJS] start to listen sync event...');
    this.initYjsObserve(onSyncEvent, onSyncStatusChange);

    console.log(`[WebRTC] init provider... room: ${channel.name}`);
    // clients connected to the same room-name share document updates
    this.provider = new WebrtcProvider(channel.name, this.ydoc, {
      password: channel.password,
      signaling: [signaling],
    });

    // 只在开发时解决全局实例缓存问题
    if (process.env.NODE_ENV === 'development') {
      window.__ONLY_USE_FOR_CLEANUP_IN_DEV = this.provider;
    }

    const provider = this.provider;

    console.log(`[WebRTC] provider init success`);

    // 当本地设备正确连接到 WebRTC Provider 后，触发 status 事件
    // 当开始连接，则开始监听事件
    provider.on('status', async ({ connected }) => {
      console.log('[WebRTC] peer connected status:', connected);
      if (connected) {
        // this.initObserve(onSyncEvent, onSyncStatusChange);
        onSyncStatusChange?.('ready');
      }
    });

    // provider.on('peers', (peers) => {
    //   console.log(peers);
    // });

    // 当各方的数据均完成同步后，YJS 对象之间的数据已经一致时，触发 synced 事件
    provider.on('synced', async ({ synced }) => {
      console.log('[WebRTC] peer sync status:', synced);
      if (synced) {
        console.groupCollapsed('[WebRTC] start to init yjs data...');
        onSyncStatusChange?.('syncing');
        await this.initSync();
        onSyncStatusChange?.('synced');
        console.groupEnd();
        console.log('[WebRTC] yjs data init success');
      } else {
        console.log('[WebRTC] sync failed,try to reconnect...');
        await this.reconnect(params);
      }
    });

    const awareness = provider.awareness;

    awareness.setLocalState({ clientID: awareness.clientID, user });
    onAwarenessChange?.([{ ...user, clientID: awareness.clientID, current: true }]);

    awareness.on('change', () => {
      const state = Array.from(awareness.getStates().values()).map((s) => ({
        ...s.user,
        clientID: s.clientID,
        current: s.clientID === awareness.clientID,
      }));

      onAwarenessChange?.(state);
    });

    return provider;
  };

  reconnect = async (params: StartDataSyncParams) => {
    this.cleanProvider(this.provider);

    this.connect(params);
  };

  private cleanProvider(provider: WebrtcProvider | null) {
    if (provider) {
      console.log(`[WebRTC] clean provider...`);
      provider.room?.destroy();
      provider.awareness?.destroy();
      provider.destroy();
      console.log(`[WebRTC] clean success`);
      console.log(`[WebRTC] -------------------`);
    }
  }

  manualSync = async () => {
    console.log('[WebRTC] try to manual init sync...');
    await this.initSync();
  };

  getYMap = (tableKey: keyof LobeDBSchemaMap) => {
    return this.ydoc.getMap(tableKey);
  };

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
    const table = LocalDBInstance[tableKey];
    const yItemMap = this.getYMap(tableKey);
    const updateSyncEvent = throttle(onEvent, 1000);

    // 定义一个变量来保存定时器的ID
    // eslint-disable-next-line no-undef
    let debounceTimer: NodeJS.Timeout;

    yItemMap.observe(async (event) => {
      // abort local change
      if (event.transaction.local) return;

      // 每次有变更时，都先清除之前的定时器（如果有的话），然后设置新的定时器
      clearTimeout(debounceTimer);

      onSyncStatusChange('syncing');

      console.log(`[YJS] observe ${tableKey} changes:`, event.keysChanged.size);
      const pools = Array.from(event.keys).map(async ([id, payload]) => {
        const item: any = yItemMap.get(id);

        switch (payload.action) {
          case 'add':
          case 'update': {
            const itemInTable = await table.get(id);
            if (!itemInTable) {
              await table.add(item, id);
            } else {
              await table.update(id, item);
            }
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

      // 设置定时器，500ms 后更新状态为'synced'
      debounceTimer = setTimeout(() => {
        onSyncStatusChange('synced');
      }, 1000);
    });
  };

  private loadDataFromDBtoYjs = async (tableKey: keyof LobeDBSchemaMap) => {
    const table = LocalDBInstance[tableKey];
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

      this.ydoc.transact(() => {
        batchItems.forEach((item) => {
          // TODO: 需要改表，所有 table 都需要有 id 字段
          yItemMap.set(item.id || (item as any).identifier, item);
        });
      });
    }

    console.log('[DB]:', tableKey, yItemMap.size);
  };
}

export const syncBus = new SyncBus();
