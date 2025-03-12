import { generate } from 'random-words';

import { createNanoId } from '@/utils/uuid';

const prefixes = {
  agents: 'agt',
  files: 'file',
  knowledgeBases: 'kb',
  messages: 'msg',
  plugins: 'plg',
  sessionGroups: 'sg',
  sessions: 'ssn',
  threads: 'thd',
  topics: 'tpc',
  user: 'user',
} as const;

export const idGenerator = (namespace: keyof typeof prefixes, size = 12) => {
  const hash = createNanoId(size);
  const prefix = prefixes[namespace];

  if (!prefix) throw new Error(`Invalid namespace: ${namespace}, please check your code.`);

  return `${prefix}_${hash()}`;
};
export const randomSlug = (count = 2) => (generate(count) as string[]).join('-');

export const inboxSessionId = (userId: string) => `ssn_inbox_${userId}`;
