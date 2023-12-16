import { StateCreator } from 'zustand/vanilla';

import { chainPickEmoji } from '@/chains/pickEmoji';
import { chainSummaryAgentName } from '@/chains/summaryAgentName';
import { chainSummaryDescription } from '@/chains/summaryDescription';
import { chainSummaryTags } from '@/chains/summaryTags';
import { chatService } from '@/services/chat';
import { LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import { setNamespace } from '@/utils/storeDebug';

import { SessionLoadingState } from '../store/initialState';
import { State, initialState } from './initialState';
import { ConfigDispatch, configReducer } from './reducers/config';
import { MetaDataDispatch, metaDataReducer } from './reducers/meta';

/**
 * 设置操作
 */
export interface Action {
  /**
   * 自动选择表情
   * @param id - 表情的 ID
   */
  autoPickEmoji: () => void;
  /**
   * 自动完成代理描述
   * @param id - 代理的 ID
   * @returns 一个 Promise，用于异步操作完成后的处理
   */
  autocompleteAgentDescription: () => Promise<void>;
  autocompleteAgentTags: () => Promise<void>;
  /**
   * 自动完成代理标题
   * @param id - 代理的 ID
   * @returns 一个 Promise，用于异步操作完成后的处理
   */
  autocompleteAgentTitle: () => Promise<void>;
  /**
   * 自动完成助理元数据
   */
  autocompleteAllMeta: (replace?: boolean) => void;
  autocompleteMeta: (key: keyof MetaData) => void;
  dispatchConfig: (payload: ConfigDispatch) => void;
  dispatchMeta: (payload: MetaDataDispatch) => void;

  resetAgentConfig: () => void;

  resetAgentMeta: () => void;

  setAgentConfig: (config: Partial<LobeAgentConfig>) => void;

  setAgentMeta: (meta: Partial<MetaData>) => void;
  streamUpdateMetaArray: (key: keyof MetaData) => any;
  streamUpdateMetaString: (key: keyof MetaData) => any;
  toggleAgentPlugin: (pluginId: string, state?: boolean) => void;
  /**
   * 更新加载状态
   * @param key - SessionLoadingState 的键
   * @param value - 加载状态的值
   */
  updateLoadingState: (key: keyof SessionLoadingState, value: boolean) => void;
}

export type Store = Action & State;

const t = setNamespace('AgentSettings');

export const store: StateCreator<Store, [['zustand/devtools', never]]> = (set, get) => ({
  ...initialState,

  autoPickEmoji: async () => {
    const { config, meta, dispatchMeta } = get();

    const systemRole = config.systemRole;

    const emoji = await chatService.fetchPresetTaskResult({
      onLoadingChange: (loading) => {
        get().updateLoadingState('avatar', loading);
      },
      params: chainPickEmoji([meta.title, meta.description, systemRole].filter(Boolean).join(',')),
    });

    if (emoji) {
      dispatchMeta({ type: 'update', value: { avatar: emoji } });
    }
  },
  autocompleteAgentDescription: async () => {
    const { dispatchMeta, config, meta, updateLoadingState, streamUpdateMetaString } = get();

    const systemRole = config.systemRole;

    if (!systemRole) return;

    const preValue = meta.description;

    // 替换为 ...
    dispatchMeta({ type: 'update', value: { description: '...' } });

    chatService.fetchPresetTaskResult({
      onError: () => {
        dispatchMeta({ type: 'update', value: { description: preValue } });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('description', loading);
      },
      onMessageHandle: streamUpdateMetaString('description'),
      params: chainSummaryDescription(systemRole),
    });
  },
  autocompleteAgentTags: async () => {
    const { dispatchMeta, config, meta, updateLoadingState, streamUpdateMetaArray } = get();

    const systemRole = config.systemRole;

    if (!systemRole) return;

    const preValue = meta.tags;

    // 替换为 ...
    dispatchMeta({ type: 'update', value: { tags: ['...'] } });

    chatService.fetchPresetTaskResult({
      onError: () => {
        dispatchMeta({ type: 'update', value: { tags: preValue } });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('tags', loading);
      },
      onMessageHandle: streamUpdateMetaArray('tags'),
      params: chainSummaryTags(
        [meta.title, meta.description, systemRole].filter(Boolean).join(','),
      ),
    });
  },
  autocompleteAgentTitle: async () => {
    const { dispatchMeta, config, meta, updateLoadingState, streamUpdateMetaString } = get();

    const systemRole = config.systemRole;

    if (!systemRole) return;

    const previousTitle = meta.title;

    // 替换为 ...
    dispatchMeta({ type: 'update', value: { title: '...' } });

    chatService.fetchPresetTaskResult({
      onError: () => {
        dispatchMeta({ type: 'update', value: { title: previousTitle } });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('title', loading);
      },
      onMessageHandle: streamUpdateMetaString('title'),
      params: chainSummaryAgentName([meta.description, systemRole].filter(Boolean).join(',')),
    });
  },
  autocompleteAllMeta: (replace) => {
    const { meta } = get();

    if (!meta.title || replace) {
      get().autocompleteAgentTitle();
    }

    if (!meta.description || replace) {
      get().autocompleteAgentDescription();
    }

    if (!meta.avatar || replace) {
      get().autoPickEmoji();
    }

    if (!meta.tags || replace) {
      get().autocompleteAgentTags();
    }
  },
  autocompleteMeta: (key) => {
    const {
      autoPickEmoji,
      autocompleteAgentTitle,
      autocompleteAgentDescription,
      autocompleteAgentTags,
    } = get();

    switch (key) {
      case 'avatar': {
        autoPickEmoji();
        return;
      }

      case 'description': {
        autocompleteAgentDescription();
        return;
      }

      case 'title': {
        autocompleteAgentTitle();
        return;
      }

      case 'tags': {
        autocompleteAgentTags();
        return;
      }
    }
  },

  dispatchConfig: (payload) => {
    const nextConfig = configReducer(get().config, payload);

    set({ config: nextConfig }, false, payload);

    get().onConfigChange?.(nextConfig);
  },
  dispatchMeta: (payload) => {
    const nextValue = metaDataReducer(get().meta, payload);

    set({ meta: nextValue }, false, payload);

    get().onMetaChange?.(nextValue);
  },

  resetAgentConfig: () => {
    get().dispatchConfig({ type: 'reset' });
  },
  resetAgentMeta: () => {
    get().dispatchMeta({ type: 'reset' });
  },

  setAgentConfig: (config) => {
    get().dispatchConfig({ config, type: 'update' });
  },
  setAgentMeta: (meta) => {
    get().dispatchMeta({ type: 'update', value: meta });
  },

  streamUpdateMetaArray: (key: keyof MetaData) => {
    let value = '';
    return (text: string) => {
      value += text;
      get().dispatchMeta({ type: 'update', value: { [key]: value.split(',') } });
    };
  },

  streamUpdateMetaString: (key: keyof MetaData) => {
    let value = '';
    return (text: string) => {
      value += text;
      get().dispatchMeta({ type: 'update', value: { [key]: value } });
    };
  },

  toggleAgentPlugin: (id, state) => {
    get().dispatchConfig({ pluginId: id, state, type: 'togglePlugin' });
  },

  updateLoadingState: (key, value) => {
    set(
      { autocompleteLoading: { ...get().autocompleteLoading, [key]: value } },
      false,
      t('updateLoadingState', { key, value }),
    );
  },
});
