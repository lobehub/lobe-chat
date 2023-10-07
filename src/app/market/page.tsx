import { cookies } from 'next/headers';

import { LOBE_LOCALE_COOKIE } from '@/const/locale';
import { getAgentIndexJSON } from '@/const/url';
import { Locales } from '@/locales/resources';
import { LobeChatAgentsMarketIndex } from '@/types/market';

import Market from './index';

const getAgentList = async (): Promise<LobeChatAgentsMarketIndex> => {
  const cookieStore = cookies();
  const lang = cookieStore.get(LOBE_LOCALE_COOKIE);

  try {
    const res = await fetch(getAgentIndexJSON(lang?.value as Locales));

    return res.json();
  } catch {
    return { agents: [], schemaVersion: 1 };
  }
};

const Page = async () => {
  const data = await getAgentList();

  return <Market defaultAgents={data.agents} />;
};

export default Page;
