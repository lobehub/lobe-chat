import type { StateCreator } from 'zustand/vanilla';

import { documentService } from '@/services/document';
import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import type { HomeStore } from '@/store/home/store';
import { setNamespace } from '@/utils/storeDebug';

import type { StarterMode } from './initialState';

const n = setNamespace('homeInput');

export interface HomeInputAction {
  clearInputMode: () => void;
  sendAsAgent: (message: string) => Promise<string>;
  sendAsImage: () => void;
  sendAsResearch: (message: string) => Promise<void>;
  sendAsWrite: (message: string) => Promise<string>;
  setInputActiveMode: (mode: StarterMode) => void;
}

export const createHomeInputSlice: StateCreator<
  HomeStore,
  [['zustand/devtools', never]],
  [],
  HomeInputAction
> = (set, get) => ({
  clearInputMode: () => {
    set({ inputActiveMode: null }, false, n('clearInputMode'));
  },

  sendAsAgent: async (message) => {
    set({ homeInputLoading: true }, false, n('sendAsAgent/start'));

    try {
      // 1. Create new Agent using useAgentStore.createAgent
      const { createAgent } = useAgentStore.getState();
      const result = await createAgent({
        config: {
          systemRole: message,
          title: message?.slice(0, 50) || 'New Agent',
        },
      });

      // 2. Refresh agent list
      await get().refreshAgentList();

      // 3. Navigate to Agent profile page
      const navigate = useGlobalStore.getState().navigate;
      if (navigate) {
        navigate(`/agent/${result.sessionId}/profile`);
      }

      // 4. Send initial message with agentId context
      if (result.agentId) {
        const { sendMessage } = useChatStore.getState();
        await sendMessage({
          context: { agentId: result.agentId, scope: 'agent_builder' },
          message,
        });
      }

      // 5. Clear mode
      set({ inputActiveMode: null }, false, n('sendAsAgent/clearMode'));

      return result.sessionId;
    } finally {
      set({ homeInputLoading: false }, false, n('sendAsAgent/end'));
    }
  },

  sendAsImage: () => {
    // Navigate to /image page
    const navigate = useGlobalStore.getState().navigate;
    if (navigate) {
      navigate('/image');
    }

    // Clear mode
    set({ inputActiveMode: null }, false, n('sendAsImage'));
  },

  sendAsResearch: async (message) => {
    // TODO: Implement DeepResearch mode
    console.log('sendAsResearch:', message);

    // Clear mode
    set({ inputActiveMode: null }, false, n('sendAsResearch'));
  },

  sendAsWrite: async (message) => {
    set({ homeInputLoading: true }, false, n('sendAsWrite/start'));

    try {
      // 1. Create new Document
      const newDoc = await documentService.createDocument({
        editorData: '',
        title: message?.slice(0, 50) || 'Untitled',
      });

      // 2. Navigate to Page
      const navigate = useGlobalStore.getState().navigate;
      if (navigate) {
        navigate(`/page/${newDoc.id}`);
      }

      // 3. Send message with document scope context
      const { sendMessage } = useChatStore.getState();
      await sendMessage({
        context: {
          agentId: newDoc.id,
          scope: 'page',
        },
        message,
      });

      // 4. Clear mode
      set({ inputActiveMode: null }, false, n('sendAsWrite/clearMode'));

      return newDoc.id;
    } finally {
      set({ homeInputLoading: false }, false, n('sendAsWrite/end'));
    }
  },

  setInputActiveMode: (mode) => {
    set({ inputActiveMode: mode }, false, n('setInputActiveMode', mode));
  },
});
