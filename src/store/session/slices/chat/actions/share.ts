import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { genShareGPTUrl } from '@/services/shareGPT';
import { SessionStore } from '@/store/session';
import { ShareGPTConversation } from '@/types/share';

import { agentSelectors } from '../../agentConfig';
import { sessionSelectors } from '../../session/selectors';
import { chatSelectors } from '../selectors';

// const t = setNamespace('chat/share');
export interface ShareAction {
  shareToShareGPT: () => void;
}

export const chatShare: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ShareAction
> = (set, get) => ({
  // genShareUrl: () => {
  //   const session = sessionSelectors.currentSession(get());
  //   if (!session) return '';
  //
  //   const agent = session.config;
  //   return genShareMessagesUrl(session.chats, agent.systemRole);
  // },
  shareToShareGPT: async () => {
    const session = sessionSelectors.currentSession(get());
    if (!session) return;
    const messages = chatSelectors.currentChats(get());
    const config = agentSelectors.currentAgentConfig(get());

    const defaultMsg: ShareGPTConversation['items'] = [];

    const shareMsgs = produce(defaultMsg, (draft) => {
      if (!!config.systemRole) {
        draft.push({
          from: 'human',
          value: `-------------- ### This is a system settings | 这是一条系统设定

${config.systemRole}`,
        });
      }

      for (const i of messages) {
        switch (i.role) {
          case 'user':
          default: {
            draft.push({ from: 'human', value: i.content });
            break;
          }

          case 'assistant': {
            draft.push({ from: 'gpt', value: i.content });
            break;
          }
          case 'function': {
            draft.push({
              from: 'gpt',
              value: `-------------- ### This is a function call | 这是一次插件调用
plugin name: ${i.plugin?.identifier}
function call name: ${i.plugin?.apiName}
result:
\`\`\`json
${i.content}
\`\`\``,
            });
            break;
          }
        }
      }

      draft.push({
        from: 'human',
        value: 'Share from [LobeChat](https://github.com/lobehub/lobe-chat)',
      });
    });

    set({ shareLoading: true });
    const res = await genShareGPTUrl({
      avatarUrl: 'https://npm.elemecdn.com/@lobehub/assets-logo/assets/logo-3d.webp',
      items: shareMsgs,
    });
    set({ shareLoading: false });

    window.open(res, '_blank');
  },
});
