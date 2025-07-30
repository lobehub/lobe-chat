import {
  DEFAULT_AGENT_TITLE,
  DEFAULT_AUTHOR,
  DEFAULT_AVATAR,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_INBOX_AVATAR,
  DEFAULT_INBOX_DESCRIPTION,
  DEFAULT_INBOX_TITLE,
} from '@/mobile/const/meta';
import { MetaData } from '@/mobile/types/meta';
import { merge } from '@/mobile/utils/merge';

import { SessionStore } from '../index';
import { sessionSelectors } from './list';

// ==========   Meta   ============== //
const currentAgentMeta = (s: SessionStore): MetaData => {
  const isInbox = sessionSelectors.isInboxSession(s);

  const defaultMeta = {
    author: DEFAULT_AUTHOR,
    avatar: isInbox ? DEFAULT_INBOX_AVATAR : DEFAULT_AVATAR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    description: isInbox ? DEFAULT_INBOX_DESCRIPTION : undefined,
    title: isInbox ? DEFAULT_INBOX_TITLE : DEFAULT_AGENT_TITLE,
  };

  const session = sessionSelectors.currentSession(s);

  return merge(defaultMeta, session?.meta);
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s).title;
const currentAgentDescription = (s: SessionStore) => currentAgentMeta(s).description;
const currentAgentAvatar = (s: SessionStore) => currentAgentMeta(s).avatar;
const currentAgentBackgroundColor = (s: SessionStore) => currentAgentMeta(s).backgroundColor;
const currentAgentAuthor = (s: SessionStore) => currentAgentMeta(s).author;

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || DEFAULT_AGENT_TITLE;
const getAuthor = (s: MetaData) => s.author || DEFAULT_AUTHOR;
// New session do not show 'noDescription'
export const getDescription = (s: MetaData) => s.description;

export const sessionMetaSelectors = {
  currentAgentAuthor,
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentDescription,
  currentAgentMeta,
  currentAgentTitle,
  getAuthor,
  getAvatar,
  getDescription,
  getTitle,
};
