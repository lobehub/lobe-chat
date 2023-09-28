import dayjs from 'dayjs';
import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { genShareGPTUrl } from '@/services/shareGPT';
import { SessionStore } from '@/store/session';
import { ShareGPTConversation } from '@/types/share';

import { agentSelectors } from '../../agentConfig';
import { sessionSelectors } from '../../session/selectors';
import { chatSelectors } from '../selectors';

interface ShareMessage {
  from: 'human' | 'gpt';
  value: string;
}
export const AVATAR =
  'data:image/webp;base64,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';

const Footer: ShareMessage = {
  from: 'gpt',
  value: `Share from [**🤯 LobeChat**](https://github.com/lobehub/lobe-chat) - ${dayjs().format(
    'YYYY-MM-DD',
  )}`,
};

const PLUGIN_INFO = (plugin: {
  apiName: string;
  content: string;
  identifier: string;
}): ShareMessage => ({
  from: 'gpt',
  value: [
    `**🧩 Function Calling Plugin**`,
    `- Identifier: \`${plugin.identifier}\``,
    `- API name: \`${plugin.apiName}\``,
    `- Result:`,
    ``,
    '```json',
    plugin.content,
    '```',
  ].join('\n'),
});

// const t = setNamespace('chat/share');
export interface ShareAction {
  shareToShareGPT: (props: {
    avatar?: string;
    withPluginInfo?: boolean;
    withSystemRole?: boolean;
  }) => void;
}

export const chatShare: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ShareAction
> = (set, get) => ({
  shareToShareGPT: async ({ withSystemRole, withPluginInfo, avatar }) => {
    const session = sessionSelectors.currentSession(get());
    if (!session) return;
    const messages = chatSelectors.currentChats(get());
    const config = agentSelectors.currentAgentConfig(get());
    const meta = agentSelectors.currentAgentMeta(get());

    const defaultMsg: ShareGPTConversation['items'] = [];
    const showSystemRole = withSystemRole && !!config.systemRole;
    const shareMsgs = produce(defaultMsg, (draft) => {
      draft.push({
        from: 'gpt',
        value: [
          `${meta.avatar} **${meta.title}** - ${meta.description}`,
          showSystemRole && '---',
          showSystemRole && config.systemRole,
        ]
          .filter(Boolean)
          .join('\n\n'),
      });

      for (const i of messages) {
        switch (i.role) {
          case 'assistant': {
            draft.push({ from: 'gpt', value: i.content });
            break;
          }
          case 'function': {
            if (withPluginInfo)
              draft.push(
                PLUGIN_INFO({
                  apiName: i.plugin?.apiName || 'undefined',
                  content: i.content,
                  identifier: i.plugin?.identifier || 'undefined',
                }),
              );
            break;
          }
          case 'user': {
            draft.push({ from: 'human', value: i.content });
            break;
          }
        }
      }

      draft.push(Footer);
    });

    set({ shareLoading: true });

    const res = await genShareGPTUrl({
      avatarUrl: avatar || AVATAR,
      items: shareMsgs,
    });
    set({ shareLoading: false });

    window.open(res, '_blank');
  },
  // genShareUrl: () => {
  //   const session = sessionSelectors.currentSession(get());
  //   if (!session) return '';
  //
  //   const agent = session.config;
  //   return genShareMessagesUrl(session.chats, agent.systemRole);
  // },
});
