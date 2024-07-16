import { DeepPartial } from 'utility-types';
import { StateCreator } from 'zustand/vanilla';

import { chainPickEmoji } from '@/chains/pickEmoji';
import { chainSummaryAgentName } from '@/chains/summaryAgentName';
import { chainSummaryDescription } from '@/chains/summaryDescription';
import { chainSummaryTags } from '@/chains/summaryTags';
import { TraceNameMap, TracePayload, TraceTopicType } from '@/const/trace';
import { chatService } from '@/services/chat';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/slices/settings/selectors';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import { SystemAgentItem } from '@/types/user/settings';
import { MessageTextChunk } from '@/utils/fetch';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { SessionLoadingState } from '../store/initialState';
import { State, initialState } from './initialState';
import { ConfigDispatch, configReducer } from './reducers/config';
import { MetaDataDispatch, metaDataReducer } from './reducers/meta';

export interface PublicAction {
  /**
   * 自动选择表情
   * @param id - 表情的 ID
   */
  autoPickEmoji: () => Promise<void>;
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
}

export interface Action extends PublicAction {
  dispatchConfig: (payload: ConfigDispatch) => void;
  dispatchMeta: (payload: MetaDataDispatch) => void;
  getCurrentTracePayload: (data: Partial<TracePayload>) => TracePayload;

  internal_getSystemAgentForMeta: () => SystemAgentItem;
  resetAgentConfig: () => void;

  resetAgentMeta: () => void;
  setAgentConfig: (config: DeepPartial<LobeAgentConfig>) => void;
  setAgentMeta: (meta: Partial<MetaData>) => void;

  setChatConfig: (config: Partial<LobeAgentChatConfig>) => void;
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

    chatService.fetchPresetTaskResult({
      onFinish: async (emoji) => {
        dispatchMeta({ type: 'update', value: { avatar: emoji } });
      },
      onLoadingChange: (loading) => {
        get().updateLoadingState('avatar', loading);
      },
      params: merge(
        get().internal_getSystemAgentForMeta(),
        chainPickEmoji([meta.title, meta.description, systemRole].filter(Boolean).join(',')),
      ),
      trace: get().getCurrentTracePayload({ traceName: TraceNameMap.EmojiPicker }),
    });
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
      params: merge(get().internal_getSystemAgentForMeta(), chainSummaryDescription(systemRole)),
      trace: get().getCurrentTracePayload({ traceName: TraceNameMap.SummaryAgentDescription }),
    });
  },
  autocompleteAgentTags: async () => {
    const { dispatchMeta, config, meta, updateLoadingState, streamUpdateMetaArray } = get();

    const systemRole = config.systemRole;

    if (!systemRole) return;

    const preValue = meta.tags;

    // 替换为 ...
    dispatchMeta({ type: 'update', value: { tags: ['...'] } });

    // Get current agent for agentMeta
    chatService.fetchPresetTaskResult({
      onError: () => {
        dispatchMeta({ type: 'update', value: { tags: preValue } });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('tags', loading);
      },
      onMessageHandle: streamUpdateMetaArray('tags'),
      params: merge(
        get().internal_getSystemAgentForMeta(),
        chainSummaryTags([meta.title, meta.description, systemRole].filter(Boolean).join(',')),
      ),
      trace: get().getCurrentTracePayload({ traceName: TraceNameMap.SummaryAgentTags }),
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
      params: merge(
        get().internal_getSystemAgentForMeta(),
        chainSummaryAgentName([meta.description, systemRole].filter(Boolean).join(',')),
      ),
      trace: get().getCurrentTracePayload({ traceName: TraceNameMap.SummaryAgentTitle }),
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
  getCurrentTracePayload: (data) => ({
    sessionId: get().id,
    topicId: TraceTopicType.AgentSettings,
    ...data,
  }),

  internal_getSystemAgentForMeta: () => {
    return systemAgentSelectors.agentMeta(useUserStore.getState());
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

  setChatConfig: (config) => {
    get().setAgentConfig({ chatConfig: config });
  },

  streamUpdateMetaArray: (key: keyof MetaData) => {
    let value = '';
    return (chunk: MessageTextChunk) => {
      switch (chunk.type) {
        case 'text': {
          value += chunk.text;
          get().dispatchMeta({ type: 'update', value: { [key]: value.split(',') } });
        }
      }
    };
  },

  streamUpdateMetaString: (key: keyof MetaData) => {
    let value = '';
    return (chunk: MessageTextChunk) => {
      switch (chunk.type) {
        case 'text': {
          value += chunk.text;
          get().dispatchMeta({ type: 'update', value: { [key]: value } });
        }
      }
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
