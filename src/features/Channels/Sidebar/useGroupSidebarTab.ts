import { useActiveLocation } from '@/hooks/useActiveLocation';

import { matchGroupChannel } from '../paths';

export type GroupSidebarTab = 'channel' | 'group';

/** The tab follows the URL, so deep links, reloads and back/forward land on the right list. */
export const useGroupSidebarTab = (): GroupSidebarTab =>
  matchGroupChannel(useActiveLocation().pathname) === undefined ? 'group' : 'channel';
