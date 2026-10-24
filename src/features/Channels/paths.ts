/** Channels live under an Agent group's Channel tab; a thread opens beside its channel. */
export const groupChannelPath = (groupId: string, channelId?: string, threadId?: string | null) => {
  const path = `/group/${groupId}/channel${channelId ? `/${channelId}` : ''}`;
  return threadId ? `${path}?thread=${encodeURIComponent(threadId)}` : path;
};

const GROUP_CHANNEL_PATH = /\/group\/[^/]+\/channel(?:\/([^/]+))?\/?$/;

/**
 * Which Channel a (possibly workspace-prefixed) pathname opens: `null` on the Channel tab's
 * landing page, `undefined` outside the Channel tab.
 */
export const matchGroupChannel = (pathname: string): string | null | undefined => {
  const match = GROUP_CHANNEL_PATH.exec(pathname);
  if (!match) return undefined;
  return match[1] ?? null;
};
