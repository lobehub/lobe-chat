import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { AgentsMarketItem } from '@/types/market';

import { DEFAULT_AGENT_META } from './meta';

export const DEFAULT_AGENTS_MARKET_ITEM: AgentsMarketItem = {
  author: '',
  config: DEFAULT_AGENT_CONFIG,
  createAt: Date.now().toString(),
  homepage: '',
  identifier: '',
  manifest: '',
  meta: DEFAULT_AGENT_META,
  schemaVersion: 1,
};
