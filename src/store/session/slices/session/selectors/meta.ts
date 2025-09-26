import { t } from 'i18next';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { SessionStore } from '@/store/session';
import { MetaData } from '@/types/meta';
import { LobeSessionType } from '@/types/session';
import { merge } from '@/utils/merge';

import { sessionSelectors } from './list';

// ==========   Meta   ============== //
const currentAgentMeta = (s: SessionStore): MetaData => {
  const isInbox = sessionSelectors.isInboxSession(s);

  const defaultMeta = {
    avatar: isInbox ? DEFAULT_INBOX_AVATAR : DEFAULT_AVATAR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    description: isInbox ? t('inbox.desc', { ns: 'chat' }) : undefined,
    title: isInbox ? t('inbox.title', { ns: 'chat' }) : t('defaultSession'),
  };

  const session = sessionSelectors.currentSession(s);

  return merge(defaultMeta, session?.meta);
};

const currentGroupMeta = (s: SessionStore): MetaData => {
  const defaultMeta = {
    description: t('group.desc', { ns: 'chat' }),
    title: t('group.title', { ns: 'chat' }),
  };

  const session = sessionSelectors.currentSession(s);

  return merge(defaultMeta, session?.meta);
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s).title;
const currentAgentDescription = (s: SessionStore) => currentAgentMeta(s).description;
const currentAgentAvatar = (s: SessionStore) => currentAgentMeta(s).avatar;
const currentAgentBackgroundColor = (s: SessionStore) => currentAgentMeta(s).backgroundColor;

const getAgentMetaByAgentId =
  (agentId: string) =>
  (s: SessionStore): MetaData => {
    // Find agent session where config.id matches the agentId
    const agentSession = s.sessions?.find(
      (session) => session.type === LobeSessionType.Agent && session.config?.id === agentId,
    );

    if (agentSession?.meta) {
      return agentSession.meta;
    }

    // Return empty meta if no session found
    return {};
  };

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });
// New session do not show 'noDescription'
export const getDescription = (s: MetaData) => s.description;

export const sessionMetaSelectors = {
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentDescription,
  currentAgentMeta,
  currentAgentTitle,
  currentGroupMeta,
  getAgentMetaByAgentId,
  getAvatar,
  getDescription,
  getTitle,
};
