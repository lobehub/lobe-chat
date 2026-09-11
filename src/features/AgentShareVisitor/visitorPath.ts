/**
 * Route prefix of the agent-share visitor page. `/a/<slug>` on purpose — short
 * enough to read aloud, and not `/agent/…`, which the marketing site already
 * uses for the public agent market, so a shared link can never be mistaken
 * for (or proxied to) a market listing.
 */
export const AGENT_SHARE_VISITOR_PATH = '/a';

/**
 * Profile page of an agent share — the canonical landing surface. A link
 * recipient is deciding whether this agent is worth their attention, not
 * resuming a conversation, so the bare `/a/<slug>` answers "what is this"
 * and the composer lives one segment deeper.
 */
export const buildAgentShareProfilePath = (slugOrId: string) =>
  `${AGENT_SHARE_VISITOR_PATH}/${slugOrId}`;

/** Conversation surface of an agent share, optionally on a saved topic. */
export const buildAgentShareChatPath = (slugOrId: string, topicId?: string) =>
  `${AGENT_SHARE_VISITOR_PATH}/${slugOrId}/chat${topicId ? `/${topicId}` : ''}`;

/**
 * Where a share link should return a visitor after sign-in. Falls back to the
 * profile so an anonymous visitor lands on the page that explains the agent.
 */
export const buildAgentShareVisitorPath = (slugOrId: string, topicId?: string) =>
  topicId ? buildAgentShareChatPath(slugOrId, topicId) : buildAgentShareProfilePath(slugOrId);

/**
 * Sign-in URL that returns the visitor to the same share once signed in.
 * `/signin` is an auth shell outside the SPA router, so callers navigate to it
 * with a full document load.
 */
export const buildAgentShareSignInUrl = (slugOrId: string, topicId?: string) =>
  `/signin?callbackUrl=${encodeURIComponent(buildAgentShareVisitorPath(slugOrId, topicId))}`;

/**
 * Where the CREATOR lands when they open their own share link: the share
 * settings page, or the agent itself on a platform without that page
 * (mobile). The creator is never a visitor of their own share.
 */
export const buildAgentShareOwnerPath = (agentId: string, { mobile = false } = {}) =>
  mobile ? `/agent/${agentId}` : `/agent/${agentId}/share`;
