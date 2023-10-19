import { cookies } from 'next/headers';

import { LOBE_LOCALE_COOKIE } from '@/const/locale';
import { getAgentIndexJSON } from '@/const/url';
import { Locales } from '@/locales/resources';
import { LobeChatAgentsMarketIndex } from '@/types/market';
import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';

const getAgentList = async (): Promise<LobeChatAgentsMarketIndex> => {
  const cookieStore = cookies();
  const lang = cookieStore.get(LOBE_LOCALE_COOKIE);

  try {
    const res = await fetch(getAgentIndexJSON(lang?.value as Locales));

    return await res.json();
  } catch {
    return { agents: [], schemaVersion: 1 };
  }
};

export default async () => {
  const data = await getAgentList();
  const mobile = isMobileDevice();

  const Page = mobile ? MobilePage : DesktopPage;

  return <Page defaultAgents={data.agents} />;
};
